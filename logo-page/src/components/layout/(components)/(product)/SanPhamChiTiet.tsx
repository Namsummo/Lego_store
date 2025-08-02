"use client";

import { KhuyenMaiTheoSanPham } from "@/components/types/khuyenmai-type";
import { useListKhuyenMaiTheoSanPham } from "@/hooks/useKhuyenmai";
import { useParams } from "next/navigation";
import Link from "next/link";
import React from "react";




import QuanLyAnh from "./QuanLyAnh";
import DanhGiaSanPham from "./DanhGiaQuanLySP";
import SanPhamHanhDong from "./SanPhamHanhDong";

// Thêm type mở rộng cho sản phẩm chi tiết để có anhUrls
type SanPhamChiTietWithAnhUrls = KhuyenMaiTheoSanPham & {
  anhUrls?: { url: string; anhChinh?: boolean }[];
};

export default function SanPhamChitiet() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const sanPhamID = Number(id);

  const {
    data: sanPhamList = [],
    isLoading,
    error,
  } = useListKhuyenMaiTheoSanPham();


  const sanPhamChiTietRaw = sanPhamList.find((sp) => sp.id === sanPhamID);
  const sanPhamChiTiet = sanPhamChiTietRaw as SanPhamChiTietWithAnhUrls;

  if (isNaN(sanPhamID) || sanPhamID <= 0) return <div>Đang tải ...</div>;

  if (isLoading) return <div>Đang tải ...</div>;
  if ((error as unknown) || !sanPhamChiTiet) return <div>Lỗi tải sản phẩm</div>;

  return (
    <>
      {/* Breadcrumb Navigation */}
      <div className="w-full">
        <div className="bg-gray-100 shadow-sm border-b border-gray-100 p-4">
          <div className="max-w-6xl mx-auto">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Trang Chủ
              </Link>
              <span className="text-gray-400">{">"}</span>
              <span className="text-gray-900 font-medium truncate">
                {sanPhamChiTiet?.tenSanPham || "Sản phẩm"}
              </span>
            </nav>
          </div>
        </div>
      </div>

      <div className="w-full text-black bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto p-8">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Product Images Gallery */}
            <QuanLyAnh />
            <SanPhamHanhDong />
          </div>

          {/* Mô tả sản phẩm - Kéo dài toàn bộ chiều rộng */}
          <div className="mt-10 pt-8  border-t border-gray-200">
            <h2 className="text-2xl  font-bold text-gray-900 mb-4">
              Mô tả sản phẩm
            </h2>
            <div className="text-gray-700 text-lg break-words">
              {sanPhamChiTiet.moTa}
            </div>
          </div>

          {/* Phần đánh giá sản phẩm */}
          <DanhGiaSanPham />
        </div>
      </div>
    </>
  );
}
