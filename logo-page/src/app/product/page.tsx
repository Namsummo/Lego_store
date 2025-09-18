"use client";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import React, { useState } from "react";
import SanPhamList from "@/components/layout/(components)/(main)/SanPhamList";
import StickyHeader from "@/components/layout/(components)/(pages)/StickyHeader";
import Footer from "@/components/layout/(components)/(pages)/Footer";
import { useSearchStore } from "@/context/useSearch.store";
import { Button } from "@/components/ui/button";
import { useBoSuutap } from "@/hooks/useBoSutap";
import { useListKhuyenMaiTheoSanPham } from "@/hooks/useKhuyenmai";
import SidebarFilter, { getGia, getTuoi } from "./[id]/SidebarFilter";
import { Pagination } from "@/components/ui/pagination";
import { KhuyenMaiTheoSanPham } from "@/components/types/khuyenmai-type";
import Navbar from "@/components/layout/(components)/(pages)/Navbar";

export default function AllProductsPage() {
  const { data: sanPhamTheoKhuyenMai = [] } = useListKhuyenMaiTheoSanPham();
  const { data: categories = [] } = useDanhMuc();
  const { data: bosuutaps = [] } = useBoSuutap();
  const [selectedBoSuuTap, setSelectedBoSutap] = useState<number | null>(null);
  const [selectedDanhMuc, setSelectedDanhMuc] = useState<number | null>(null);
  const [selectedGia, setSelectedGia] = useState<string | null>(null);
  const [selectedTuoi, setSelectedTuoi] = useState<string | null>(null);

  const { keyword, setKeyword } = useSearchStore();
  const [currentPage, setCurrentPage] = useState(1);
  // Hàm lấy badge cho sản phẩm (để sắp xếp)
  const getProductBadge = (product: KhuyenMaiTheoSanPham) => {
    if (product.giaKhuyenMai && product.giaKhuyenMai < product.gia) {
      return { text: "Khuyến mãi", color: "bg-red-500 text-white" };
    }

    if (product.id >= 20) {
      return { text: "Hàng mới", color: "bg-green-500 text-white" };
    }

    const price = product.giaKhuyenMai || product.gia;
    if (price >= 3000000) {
      return { text: "Hàng hiếm", color: "bg-purple-600 text-white" };
    }

    if (product.noiBat) {
      return { text: "Nổi bật", color: "bg-blue-600 text-white" };
    }

    return { text: "", color: "" };
  };

  // Lọc sản phẩm
  const filteredProducts = sanPhamTheoKhuyenMai.filter((sp) => {
    // Lọc theo danh mục
    const categoryMatch = selectedDanhMuc
      ? sp.danhMucId === selectedDanhMuc
      : true;

    // Lọc theo bộ sưu tập
    const collectionMatch = selectedBoSuuTap
      ? sp.boSuuTapId === selectedBoSuuTap
      : true;

    // Lọc theo độ tuổi
    let tuoiMatch = true;
    if (selectedTuoi) {
      const range = getTuoi.find((r) => r.label === selectedTuoi);
      if (range) {
        tuoiMatch =
          sp.doTuoi >= range.min &&
          (range.max === Infinity || sp.doTuoi <= range.max);
      }
    }
    // Lọc theo giá
    let giaMatch = true;
    if (selectedGia) {
      const range = getGia.find((r) => r.label === selectedGia);
      if (range) {
        const giaThucTe = sp.giaKhuyenMai ?? sp.gia ?? 0;
        giaMatch =
          giaThucTe >= range.min &&
          (range.max === Infinity || giaThucTe <= range.max);
      }
    }

    // Lọc theo tìm kiếm
    const searchMatch = keyword
      ? sp.tenSanPham.toLowerCase().includes(keyword.toLowerCase())
      : true;

    return (
      categoryMatch && collectionMatch && tuoiMatch && giaMatch && searchMatch
    );
  });

  // Sắp xếp sản phẩm: ưu tiên sản phẩm có badge lên đầu
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const badgeA = getProductBadge(a);
    const badgeB = getProductBadge(b);

    // Sản phẩm có badge sẽ lên đầu
    if (badgeA.text && !badgeB.text) return -1;
    if (!badgeA.text && badgeB.text) return 1;

    // Nếu cả hai đều có badge, sắp xếp theo thứ tự ưu tiên
    if (badgeA.text && badgeB.text) {
      const priorityOrder = {
        "Khuyến mãi": 1,
        "Hàng mới": 2,
        "Hàng hiếm": 3,
        "Nổi bật": 4,
      };
      return (
        (priorityOrder[badgeA.text as keyof typeof priorityOrder] || 5) -
        (priorityOrder[badgeB.text as keyof typeof priorityOrder] || 5)
      );
    }

    return 0;
  });
  // Phân trang
  const itemPerPage = 12; // Tăng từ 10 lên 12
  const totalPage = Math.ceil(sortedProducts.length / itemPerPage);
  const paginatedProdcuts = sortedProducts.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );

  return (
    <div className="min-h-screen flex flex-col">
      <StickyHeader />
      <div className="pt-24 relative z-[1000]">
        <Navbar />
      </div>
      <main className="bg-white text-black relative z-0">
        <div className="mb-8 text-center mt-10">
          <h1 className="text-4xl lg:text-4xl font-black mb-4 text-blue-900">
            Lego MyKingDom - Thế giới Lego
          </h1>
          <p className="text-gray-600">Khám phá bộ sưu tập của chúng tôi</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 px-4">
          <div className="lg:w-1/4 w-full">
            {/* Sidebar Filter */}
            <SidebarFilter
              selectedBoSuuTap={selectedBoSuuTap}
              selectedDanhMuc={selectedDanhMuc}
              selectedGia={selectedGia}
              selectedTuoi={selectedTuoi}
              setSelectedBoSutap={setSelectedBoSutap}
              setSelectedDanhMuc={setSelectedDanhMuc}
              setSelectedGia={setSelectedGia}
              setSelectedTuoi={setSelectedTuoi}
            />
          </div>
          <div className="lg:w-3/4">
            {/* Filter Info */}
            {(selectedDanhMuc ||
              selectedTuoi ||
              selectedBoSuuTap ||
              selectedGia) && (
              <div className="mb-6 bg-blue-50 px-4 py-3 rounded-lg flex items-center flex-wrap gap-2">
                {selectedDanhMuc && (
                  <span className="text-blue-800">
                    Danh mục:
                    <strong>
                      {
                        categories.find((c) => c.id === selectedDanhMuc)
                          ?.tenDanhMuc
                      }
                    </strong>
                  </span>
                )}
                {selectedBoSuuTap && (
                  <span className="text-blue-800">
                    Bộ sưu tập:
                    <strong>
                      {
                        bosuutaps.find((bst) => bst.id === selectedBoSuuTap)
                          ?.tenBoSuuTap
                      }
                    </strong>
                  </span>
                )}
                {selectedTuoi && (
                  <span className="text-blue-800">
                    Độ tuổi: <strong>{selectedTuoi}</strong>
                  </span>
                )}
                {selectedGia && (
                  <span className="text-blue-800">
                    Giá: <strong>{selectedGia}</strong>
                  </span>
                )}

                <Button
                  onClick={() => {
                    setSelectedDanhMuc(null);
                    setSelectedBoSutap(null);
                    setSelectedGia(null);
                    setSelectedTuoi(null);
                    setKeyword("");
                  }}
                  className="ml-auto text-sm text-blue-600 hover:underline"
                  variant="link"
                >
                  [Xóa tất cả]
                </Button>
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-2xl text-center text-gray-600">
                Hiện đang không có sản phẩm nào phù hợp
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-medium">Danh sách sản phẩm</h2>
                <SanPhamList ps={paginatedProdcuts} />

                {/* Pagination - ở giữa các sản phẩm */}
                <div className="flex justify-center mt-8 mb-10">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPage}
                    onPageChange={setCurrentPage}
                    maxVisiblePages={5}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
