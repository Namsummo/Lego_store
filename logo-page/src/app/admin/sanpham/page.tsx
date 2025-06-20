// SanPhamPage.tsx
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
import { useState } from "react";
import { SanPham } from "@/components/types/product.type";

export default function SanPhamPage() {
  const { data: sanPhams = [], isLoading, refetch } = useSanPham();
  const [editSanPham, setEditSanPham] = useState<SanPham | null>(null);
  const [formKey, setFormKey] = useState(0);

  const addSanPhamMutation = useAddSanPham();
  const deleteSanPhamMutation = useXoaSanPham();
  const editSanPhamMutation = useEditSanPham();

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
        <SanPhamTable
          sanPhams={sanPhams}
          onDelete={handleDelete}
          onEdit={(product) => setEditSanPham(product)}
        />
      )}
    </div>
  );
}