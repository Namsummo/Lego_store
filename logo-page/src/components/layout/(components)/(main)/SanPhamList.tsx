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
import { ShoppingCart, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useDanhMucID } from "@/hooks/useDanhMuc";

interface SanPhamListProps {
  ps: KhuyenMaiTheoSanPham[];
}

// Component con để hiển thị tên danh mục
function CategoryName({ danhMucId }: { danhMucId: number | null }) {
  const { data: danhMuc } = useDanhMucID(danhMucId || 0);
  if (!danhMucId || !danhMuc) {
    return <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"></div>;
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
    return '/images/avatar-admin.png';
  }

  // Tìm ảnh chính (anhChinh: true)
  const mainImg = anhUrls.find((img) => img.anhChinh === true);
  const imgToUse = mainImg || anhUrls[0];

  if (imgToUse && imgToUse.url) {
    return `http://localhost:8080/api/anhsp/images/${imgToUse.url}`;
  }

  return '/images/avatar-admin.png';
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

    let cart: Array<{ id: number, name: string, image: string, price: number, quantity: number }> = [];
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
      const mainImage = sp.anhUrls?.find(img => img.anhChinh) || sp.anhUrls?.[0];
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

  // Badge logic cải tiến - thay đổi thứ tự ưu tiên
  const getProductBadge = (product: KhuyenMaiTheoSanPham) => {
    // 1. Khuyến mãi (ưu tiên cao nhất)
    if (product.giaKhuyenMai && product.giaKhuyenMai < product.gia) {
      return { text: "Khuyến mãi", color: "bg-red-500 text-white" };
    }

    // 2. Hàng mới (ưu tiên thứ 2)
    if (product.id >= 20) {
      return { text: "Hàng mới", color: "bg-green-500 text-white" };
    }

    // 3. Hàng hiếm (ưu tiên thứ 3)
    const price = product.giaKhuyenMai || product.gia;
    if (price >= 3000000) {
      return { text: "Hàng hiếm", color: "bg-purple-600 text-white" };
    }

    // 4. Nổi bật (ưu tiên thấp nhất)
    if (product.noiBat) {
      return { text: "Nổi bật", color: "bg-blue-600 text-white" };
    }

    return { text: "", color: "" };
  };

  // Render loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sản phẩm nổi bật</h2>
          <p className="text-gray-600">Khám phá những sản phẩm tuyệt vời nhất của chúng tôi</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="animate-pulse">
              <div className="bg-gray-200 rounded-2xl h-80"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pt-5">
        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
          {ps.map((p, idx) => {
            const badge = getProductBadge(p);
            const mainImageUrl = getMainImageUrl(p);

            return (
              <motion.div
                key={`product-${p.id}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/product/${p.id}`} className="block">
                  <Card className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:scale-105">
                    <CardHeader className="p-0 relative">
                      <div className="relative w-full h-64 overflow-hidden">
                        {/* Badge */}
                        {badge.text && (
                          <div className="absolute top-3 left-3 z-20">
                            <span className={`${badge.color} px-3 py-1 rounded-full text-xs font-medium shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                              {badge.text}
                            </span>
                          </div>
                        )}

                        {/* Heart Icon */}
                        <div className="absolute top-3 right-3 z-20">
                          <Button
                            className="bg-white/90 hover:bg-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 w-10 h-10 flex items-center justify-center"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            type="button"
                          >
                            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                          </Button>
                        </div>

                        {/* Product Image */}
                        <div className="relative w-full h-full">
                          <Image
                            src={mainImageUrl}
                            alt={p.tenSanPham}
                            fill
                            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/avatar-admin.png';
                              console.error(`Lỗi tải ảnh sản phẩm: ${p.tenSanPham}`);
                            }}
                          />
                        </div>
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

                      <CardTitle className="text-base font-semibold line-clamp-2 h-[44px] text-gray-800 group-hover:text-blue-600 transition-colors mb-2">
                        {p.tenSanPham}
                      </CardTitle>
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
                        <Button
                          className="h-11 w-11 border border-gray-200 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all duration-200 inline-flex items-center justify-center group-hover:scale-105"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <Heart className="w-4 h-4 text-gray-600" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Thông báo thêm giỏ hàng thành công */}
        {showAddToCartSuccess && (
          <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 flex flex-col items-center shadow-2xl max-w-sm w-full mx-4 border border-gray-700">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-white text-center leading-tight">
                Sản phẩm đã được thêm vào Giỏ hàng
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}



