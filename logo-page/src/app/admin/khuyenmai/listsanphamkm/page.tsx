"use client";
import React, { useState } from "react";
import KhuyenMaiSanPham from "./KhuyenMaiSanPham";
import { Button } from "@/components/ui/button";
import { useListKhuyenMaiTheoSanPham } from "@/hooks/useKhuyenmai";

export default function Page() {
  const { data: danhSachSanPhamKM = [] } = useListKhuyenMaiTheoSanPham();
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 20;
  const totalPages = Math.ceil(danhSachSanPhamKM.length / itemPerPage);

  return (
    <div className="space-y-4">
      <KhuyenMaiSanPham currentPage={currentPage} itemPerPage={itemPerPage} />
      <div className="flex justify-center items-center gap-2 mt-4">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Trước
        </Button>
        <span>
          Trang {currentPage} /{totalPages}
        </span>
        <Button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}
