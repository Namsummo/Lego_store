"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { KhuyenMaiTheoSanPham } from "@/components/types/khuyenmai-type";
import { ShoppingCart } from "lucide-react";
import { AddToWishListButton } from "@/components/layout/(components)/(wishlist)/AddToWishListButton";
import { useDanhMucID } from "@/hooks/useDanhMuc";
import { cn } from "@/lib/utils";

interface SanPhamListProps {
  ps: KhuyenMaiTheoSanPham[];
}

// Component con để hiển thị tên danh mục
function CategoryName({ danhMucId }: { danhMucId: number | null }) {
  const { data: danhMuc } = useDanhMucID(danhMucId || 0);
  if (!danhMucId || !danhMuc) {
    return (
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"></div>
    );
  }
  return (
    <div className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
      {danhMuc.tenDanhMuc}
    </div>
  );
}

// Hàm lấy ảnh chính từ danh sách ảnh
const getMainImageUrl = (product: KhuyenMaiTheoSanPham) => {
  // Kiểm tra anhUrls thay vì anhSps
  const anhUrls = product.anhUrls;

  if (!anhUrls || anhUrls.length === 0) {
    return "/images/avatar-admin.png";
  }

  // Tìm ảnh chính (anhChinh: true)
  const mainImg = anhUrls.find((img) => img.anhChinh === true);
  const imgToUse = mainImg || anhUrls[0];

  if (imgToUse && imgToUse.url) {
    return imgToUse.url;
  }

  return "/images/avatar-admin.png";
};

export default function SanPhamList({ ps }: SanPhamListProps) {
  const [isClient, setIsClient] = useState(false);
  const [showAddToCartSuccess, setShowAddToCartSuccess] = useState(false);

  console.log(`SanPhamList: Nhận được ${ps.length} sản phẩm`);

  // Fix hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Hàm thêm vào giỏ hàng localStorage
  const addToCartLocal = (sp: KhuyenMaiTheoSanPham) => {
    if (!isClient) return;

    let cart: Array<{
      id: number;
      name: string;
      image: string;
      price: number;
      quantity: number;
    }> = [];
    try {
      const cartData = localStorage.getItem("cartItems");
      cart = cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error("Lỗi khi đọc giỏ hàng từ localStorage:", error);
      cart = [];
    }

    const index = cart.findIndex((item: { id: number }) => item.id === sp.id);
    if (index !== -1) {
      cart[index].quantity += 1;
    } else {
      // Sửa lại để lấy từ anhUrls
      const mainImage =
        sp.anhUrls?.find((img) => img.anhChinh) || sp.anhUrls?.[0];
      cart.push({
        id: sp.id,
        name: sp.tenSanPham,
        image: mainImage?.url || "",
        price: sp.giaKhuyenMai || sp.gia,
        quantity: 1,
      });
    }
    localStorage.setItem("cartItems", JSON.stringify(cart));
    // Trigger custom event để Header cập nhật ngay lập tức
    window.dispatchEvent(new Event("cartUpdated"));
    // Hiển thị thông báo thành công
    setShowAddToCartSuccess(true);
    setTimeout(() => {
      setShowAddToCartSuccess(false);
    }, 3000);
  };

  const getProductBadge = (product: KhuyenMaiTheoSanPham) => {
    if (product.giaKhuyenMai && product.giaKhuyenMai < product.gia) {
      return { text: "Khuyến mãi", color: "bg-red-500 text-white" };
    }
    const price = product.giaKhuyenMai || product.gia;
    if (price >= 3000000) {
      return { text: "Hàng hiếm", color: "bg-purple-600 text-white" };
    }
    if (product.noiBat) {
      return { text: "Nổi bật", color: "bg-blue-600 text-white" };
    }
    return { text: "Hàng mới", color: "bg-green-500 text-white" };
  };

  if (!isClient) {
    return <div className="text-center py-8 text-gray-500">Đang tải...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-0">
        {ps.map((p) => {
          const mainImageUrl = getMainImageUrl(p);
          const badge = getProductBadge(p);

          return (
            <Card
              key={p.id}
              className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 bg-white transition-all duration-300 group relative w-full mx-auto hover:-translate-y-1 hover:scale-105 mt-4"
            >
              <CardHeader className="p-0">
                <div className="relative w-full h-52">
                  {/* Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className={`${badge.color} px-2 py-1 rounded-full text-xs font-medium shadow-sm group-hover:scale-110 transition-transform duration-200`}
                    >
                      {badge.text}
                    </span>
                  </div>

                  {/* Product Image */}
                  <Link
                    href={`/product/${p.id}`}
                    className="block w-full h-full"
                  >
                    <Image
                      src='/images/bg1.jpg'
                      alt={p.tenSanPham}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/avatar-admin.png";
                        console.error(`Lỗi tải ảnh sản phẩm: ${p.tenSanPham}`);
                      }}
                    />
                  </Link>
                </div>
              </CardHeader>

              <CardContent className="p-4 pb-1">
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <CategoryName danhMucId={p.danhMucId} />
                    <div className="text-xs text-gray-400">{p.maSanPham}</div>
                  </div>
                </div>

                <Link href={`/product/${p.id}`} className="block">
                  <CardTitle className="text-base font-semibold line-clamp-2 h-[44px] text-gray-800 group-hover:text-blue-600 transition-colors mb-2 cursor-pointer">
                    {p.tenSanPham}
                  </CardTitle>
                </Link>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    Độ tuổi: {p.doTuoi}+
                  </span>
                  <span
                    className={cn(
                      "text-xs text-white font-medium px-2 py-1 rounded-full ",
                      p.soLuongTon === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    )}
                  >
                    {`${p.soLuongTon === 0 ? "Hết hàng" : "Còn hàng"}`}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-0 pb-0">
                  <div className="text-lg font-bold text-gray-800">
                    {(p.giaKhuyenMai || p.gia).toLocaleString("vi-VN")}₫
                  </div>
                  {p.giaKhuyenMai && p.giaKhuyenMai < p.gia && (
                    <div className="text-xs text-gray-400 line-through">
                      {p.gia.toLocaleString("vi-VN")}₫
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-3 pt-0">
                <div className="flex gap-3 w-full">
                  <Button
                    className="flex-1 bg-orange-500 text-white hover:bg-orange-600 rounded-xl font-semibold h-11 shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center justify-center gap-2 group-hover:scale-105"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCartLocal(p);
                    }}
                    disabled={p.soLuongTon === 0}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Thêm vào giỏ hàng
                  </Button>
                  <AddToWishListButton
                    productId={p.id}
                    className="h-11 w-11 border-4 border-gray-400 hover:border-red-500 rounded-xl transition-all duration-200 inline-flex items-center justify-center group-hover:scale-105 shadow-lg hover:shadow-xl hover:bg-red-50"
                    style={{ backgroundColor: "#dbeafe" }}
                  />
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Thông báo thêm giỏ hàng thành công */}
      {showAddToCartSuccess && (
        <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-8 flex flex-col items-center shadow-2xl max-w-sm w-full mx-4 border border-gray-700">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-xl font-semibold text-white text-center leading-tight">
              Sản phẩm đã được thêm vào Giỏ hàng
            </p>
          </div>
        </div>
      )}
    </>
  );
}
