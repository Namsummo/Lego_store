"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KhuyenMaiTheoSanPham } from "@/components/types/khuyenmai-type";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { AddToWishListButton } from "@/components/layout/(components)/(wishlist)/AddToWishListButton";
import { motion } from "framer-motion";
import { useDanhMucID } from "@/hooks/useDanhMuc";

interface SanPhamListProps {
  ps: KhuyenMaiTheoSanPham[];
}

// Component con để hiển thị tên danh mục
function CategoryName({ danhMucId }: { danhMucId: number | null }) {
  const { data: danhMuc } = useDanhMucID(danhMucId || 0);

  if (!danhMucId || !danhMuc) {
    return (
      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1"></div>
    );
  }

  return (
    <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
      {danhMuc.tenDanhMuc}
    </div>
  );
}

export default function SanPhamListNoBox({ ps }: SanPhamListProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showAddToCartSuccess, setShowAddToCartSuccess] = useState(false);

  // Hàm thêm vào giỏ hàng localStorage
  const addToCartLocal = (sp: KhuyenMaiTheoSanPham) => {
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
      cart.push({
        id: sp.id,
        name: sp.tenSanPham,
        image: sp.anhUrls?.[0]?.url || "",
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

  // Nút scroll trái/phải
  const handleScroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.8;
    let newScrollPosition = scrollPosition;
    if (direction === "left") {
      newScrollPosition = Math.max(0, scrollPosition - scrollAmount);
    } else {
      newScrollPosition = Math.min(
        carouselRef.current.scrollWidth - carouselRef.current.clientWidth,
        scrollPosition + scrollAmount
      );
    }
    carouselRef.current.scrollTo({
      left: newScrollPosition,
      behavior: "smooth",
    });
    setScrollPosition(newScrollPosition);
  };

  const filtered = ps.filter(
    (p) =>
      (p.noiBat === 1 || p.noiBat === true) &&
      (!p.trangThai || p.trangThai === "Đang kinh doanh")
  );

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

  return (
    <>
      <div className="relative max-w-7xl mx-auto px-8">
        {/* Nút điều hướng trái/phải */}
        <Button
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-700 rounded-full w-12 h-12 shadow-md hidden md:flex"
          onClick={() => handleScroll("left")}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <Button
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-700 rounded-full w-12 h-12 shadow-md hidden md:flex"
          onClick={() => handleScroll("right")}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
        {/* Carousel scroll-x mượt, giữ nguyên nội dung card */}
        <div
          ref={carouselRef}
          className="flex space-x-8 pb-5 pt-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filtered.map((p, idx) => {
            const imgToUse =
              p.anhUrls?.find((img) => img.anhChinh) || p.anhUrls?.[0];
             //const mainImageUrl = imgToUse?.url || "/images/avatar-admin.png";
            const mainImageUrl =  "/images/avatar-admin.png";
            const badge = getProductBadge(p);

            return (
              <motion.div
                key={p.id}
                className="flex-shrink-0 w-[320px] snap-center py-2"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
              >
                <Card className="overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 bg-white transition-all duration-300 group relative w-full mx-auto hover:-translate-y-1 hover:scale-105">
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

                      <Link href={`/product/${p.id}`} className="block">
                        {mainImageUrl && (
                          <>
                            <Image
                              src={mainImageUrl}
                              alt={p.tenSanPham}
                              fill
                              className="object-contain w-full h-full p-3 group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/images/avatar-admin.png";
                                console.error(
                                  `Lỗi tải ảnh sản phẩm: ${p.tenSanPham}`
                                );
                              }}
                            />
                            <div></div>
                          </>
                        )}
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pb-1">
                    <div className="mb-2">
                      <div className="flex items-center justify-between">
                        <CategoryName danhMucId={p.danhMucId} />
                        <div className="text-xs text-gray-400">
                          {p.maSanPham}
                        </div>
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
              </motion.div>
            );
          })}
        </div>
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
