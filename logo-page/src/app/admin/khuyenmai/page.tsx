"use client";
import React, { useState } from "react";
import KhuyenMaiForm from "./KhuyenMaiForm";
import KhuyenMaiTable from "./KhuyenMaiTable";
import { useDeleteKhuyenMai, useKhuyenMai } from "@/hooks/useKhuyenmai";
import { toast } from "sonner";
import { KhuyenMaiDTO } from "@/components/types/khuyenmai-type";
import { Button } from "@/components/ui/button";

export default function KhuyenMaiPage() {
  const { data: khuyenMai = [], isLoading, refetch } = useKhuyenMai();
  const [editing, setEditing] = useState<KhuyenMaiDTO | null>(null);
  const deleteKhuyenMaiMutation = useDeleteKhuyenMai();
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 10;
  const totalPages = Math.ceil(khuyenMai.length / itemPerPage);
  const paginatedData = khuyenMai.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa khuyến mãi này?")) {
      try {
        await deleteKhuyenMaiMutation.mutateAsync(id);
        toast.success("Xóa thành khuyến mãi thành công!");
        refetch();
      } catch {
        toast.error("Lỗi xóa sản phẩm");
      }
    }
  };

  return (
    <div className=" max-w-screen space-y-6">
      <KhuyenMaiForm
        editing={editing}
        setEditing={setEditing}
        onSucces={refetch}
      />
      {isLoading ? (
        <p>Đang tải sản phẩm</p>
      ) : (
        <>
          <KhuyenMaiTable
            khuyenMai={paginatedData}
            onDelete={handleDelete}
            onEdit={(data) => setEditing(data)}
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
