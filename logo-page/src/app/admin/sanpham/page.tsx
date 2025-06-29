"use client";

import { ProductData } from "@/lib/sanphamschema";
import SanPhamForm from "./SanPhamForm";
import SanPhamTable from "./SanPhamTable";
import {
  useSanPham,
  useAddSanPham,
  useXoaSanPham,
  useEditSanPham,
} from "@/hooks/useSanPham";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { SanPham } from "@/components/types/product.type";
import SanPhamFilter from "./SanPhamFilter";
import { useSearchStore } from "@/context/useSearch.store";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import { useBoSuutap } from "@/hooks/useBoSutap";
import { Button } from "@/components/ui/button";

export default function SanPhamPage() {
  const { data: sanPhams = [], isLoading, refetch } = useSanPham();
  const { data: danhMucs = [] } = useDanhMuc();
  const { data: boSuuTaps = [] } = useBoSuutap();

  const [editSanPham, setEditSanPham] = useState<SanPham | null>(null);
  const [formKey, setFormKey] = useState(0);
  const { keyword } = useSearchStore();
  const [selectedDanhMuc, setSelectedDanhMuc] = useState<number | null>(null);
  const [selectedBoSuuTap, setSelectedBoSuuTap] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const addSanPhamMutation = useAddSanPham();
  const deleteSanPhamMutation = useXoaSanPham();
  const editSanPhamMutation = useEditSanPham();
  useEffect(() => {
    console.log("edit id:", editSanPham?.id);
  }, [editSanPham]);

  // Filter logic
  const filteredSanPhams = sanPhams.filter((sp) => {
    const lowerKeyword = keyword.toLowerCase();

    const matchKeyword =
      sp.tenSanPham.toLowerCase().includes(lowerKeyword) ||
      sp.maSanPham?.toLowerCase().includes(lowerKeyword);

    const matchDanhMuc =
      selectedDanhMuc === null || sp.idDanhMuc === selectedDanhMuc;
    const matchBoSuuTap =
      selectedBoSuuTap === null || sp.idBoSuuTap === selectedBoSuuTap;

    return matchKeyword && matchDanhMuc && matchBoSuuTap;
  });

  // Pagination
  const itemPerPage = 10;
  const totalPages = Math.ceil(filteredSanPhams.length / itemPerPage);
  const paginatedSanPhams = filteredSanPhams.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );

  const handleSubmit = async (data: ProductData, id?: number) => {
    try {
      if (id) {
        await editSanPhamMutation.mutateAsync({ id, data });
        toast.success("Cập nhật thành công!");
        setEditSanPham(null);
      } else {
        await addSanPhamMutation.mutateAsync(data);
        toast.success("Thêm sản phẩm thành công!");
      }
      refetch();
    } catch {
      toast.error("Lỗi xử lý sản phẩm!");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await deleteSanPhamMutation.mutateAsync(id);
        toast.success("Xóa thành công!");
        refetch();
      } catch {
        toast.error("Lỗi khi xóa sản phẩm");
      }
    }
  };

  const handleSuccess = () => {
    setEditSanPham(null);
    setFormKey((prev) => prev + 1);
    refetch();
  };

  return (
    <div className="space-y-6">
      <SanPhamForm
        key={formKey}
        onSubmit={handleSubmit}
        edittingSanPham={editSanPham}
        onSucces={handleSuccess}
      />
      {isLoading ? (
        <p>Đang tải danh sách sản phẩm...</p>
      ) : (
        <>
          <span className="text-2xl font-bold mb-4">Danh sách sản phẩm</span>
          <SanPhamFilter
            danhMucs={danhMucs}
            boSuuTaps={boSuuTaps}
            selectedDanhMuc={selectedDanhMuc}
            selectedBoSuuTap={selectedBoSuuTap}
            onChangeDanhMuc={setSelectedDanhMuc}
            onChangeBoSuuTap={setSelectedBoSuuTap}
          />

          <SanPhamTable
            sanPhams={paginatedSanPhams}
            onDelete={handleDelete}
            onEdit={(product) => setEditSanPham({ ...product })}
          />
          <div className="flex gap-2 items-center justify-center">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Trước
            </Button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Sau
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
