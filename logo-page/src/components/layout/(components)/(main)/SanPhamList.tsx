// src/components/layout/(components)/SanPhamList.tsx
"use client";

import { SanPham } from "@/components/types/product.type";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
// Thêm HoverCardContent
 // Thêm HoverCardContent
import { AlertCircle } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card";

interface SanPhamListProps {
  products: SanPham[];
}

export default function SanPhamList({ products }: SanPhamListProps) {
  // Định dạng tiền
  const formatCurrency = (amount: number | null): string => {
    if (amount === null || typeof amount !== "number") {
      return "0đ";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Nhóm sản phẩm theo danh mục (danhMucId) và giới hạn 4 sản phẩm mỗi danh mục
  const groupedProducts = products.reduce((acc, product) => {
    const danhMucId = product.danhMucId ?? 0;
    if (!acc[danhMucId]) {
      acc[danhMucId] = [];
    }
    acc[danhMucId].push(product);
    return acc;
  }, {} as Record<number, SanPham[]>);

  // Giới hạn mỗi danh mục chỉ lấy tối đa 4 sản phẩm
  const limitedProductsByCategory = Object.values(groupedProducts)
    .flatMap((group) => group.slice(0, 4))
    .sort((a, b) => (a.danhMucId ?? 0) - (b.danhMucId ?? 0));
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {limitedProductsByCategory.map((product) => {
        const discountPercent =
          product.gia && product.giaKhuyenMai
            ? Math.round(
                ((product.gia - product.giaKhuyenMai) / product.gia) * 100
              )
            : 0;
        // Số lượng tồn
        const isOutOfStock = (product.soLuongTon ?? 0) === 0;

        return (
          <Card
            key={product.id}
            className="group flex flex-col justify-between overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl bg-gray-100 border-3 border-opacity-50 hover:border-opacity-100 hover:border-blue-300"
          >
            <Link href={`/product/${product.id}`}>
              <div className="relative w-full h-48">
                {product.anhDaiDien ? (
                  <Image
                    src={product.anhDaiDien}
                    alt={product.tenSanPham}
                    width={200}
                    height={200}
                    className="object-cover w-full h-48"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-400 flex items-center justify-center">
                    <span>Không có ảnh</span>
                  </div>
                )}
                {discountPercent > 0 && (
                  <Badge className="absolute top-2 left-2 bg-red-600 text-white font-bold rounded-full py-1 px-3 text-sm z-10">
                    -{discountPercent}%
                  </Badge>
                )}
                {isOutOfStock && (
                  <Badge
                    variant="destructive"
                    className="absolute top-2 right-2 bg-gray-800 text-white font-bold rounded-full py-1 px-3 text-sm z-10"
                  >
                    Hết hàng
                  </Badge>
                )}
              </div>
            </Link>
            <CardHeader className="p-4 pb-2 flex-grow">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Link href={`/product/${product.id}`} className="block">
                    <CardTitle className="text-lg font-semibold text-gray-800 hover:text-blue-600 line-clamp-2 min-h-[56px]">
                      <div className="flex-col">
                        <div>{product.tenSanPham}</div>
                        <div className="text-sm text-gray-400">
                          {product.moTa}
                        </div>
                      </div>
                    </CardTitle>
                  </Link>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">
                      {product.tenSanPham}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {product.moTa || "Không có mô tả ngắn."}
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xl font-bold text-red-600">
                  {formatCurrency(product.giaKhuyenMai ?? product.gia)}
                </span>
                {product.gia !== null &&
                  product.gia > (product.giaKhuyenMai ?? 0) && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      {formatCurrency(product.gia)}
                    </span>
                  )}
              </div>

              <div className="flex justify-between items-center mt-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm text-gray-700 flex items-center gap-1">
                        <AlertCircle size={14} />
                        Tồn kho: {product.soLuongTon ?? 0}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isOutOfStock
                          ? "Sản phẩm hiện đã hết hàng"
                          : "Số lượng còn lại trong kho"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm text-gray-700">
                        Độ tuổi: {product.doTuoi ?? 0}+
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Phù hợp với trẻ từ {product.doTuoi ?? 0} tuổi trở lên
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Button
                className="w-full lego-login-button transition-colors duration-200"
                disabled={isOutOfStock}
              >
                {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
