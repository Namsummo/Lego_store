"use client";
import { useSanPham } from "@/hooks/useSanPham";
import React from "react";
import Navbar from "../(pages)/Navbar";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import SanPhamListNoBox from "./SanPhamListNoBox";
import {
  Building2,
  Puzzle,
  Shield,
  Bot,
  Car,
  Rocket,
  Landmark,
  Swords,
  Heart,
  Gamepad2,
} from "lucide-react";
import CallToActionBanner from "./CallToActionBanner";
import WhyChooseUs from "./WhyChooseUs";
import BannerCarousel from "./BannerCarousel";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import ChatWidget from "@/shared/MessageChatBot";

// Hàm chọn icon lucide-react dựa trên tên danh mục, nếu không match thì lấy icon theo index
const ICONS = [
  Building2,
  Puzzle,
  Shield,
  Bot,
  Car,
  Rocket,
  Landmark,
  Swords,
  Heart,
];
function getCategoryIcon(name: string, idx: number) {
  const lower = name.toLowerCase();
  if (lower.includes("city"))
    return <Building2 className="w-10 h-10 text-yellow-500" />;
  if (lower.includes("star wars"))
    return <Rocket className="w-10 h-10 text-yellow-500" />;
  if (lower.includes("quân đội") || lower.includes("army"))
    return <Shield className="w-10 h-10 text-yellow-500" />;
  if (
    lower.includes("siêu xe") ||
    lower.includes("super car") ||
    lower.includes("car")
  )
    return <Car className="w-10 h-10 text-yellow-500" />;
  if (lower.includes("creator"))
    return <Puzzle className="w-10 h-10 text-yellow-500" />;
  if (lower.includes("robot"))
    return <Bot className="w-10 h-10 text-yellow-500" />;
  if (
    lower.includes("ninja go") ||
    lower.includes("ninjago") ||
    lower.includes("ninja")
  )
    return <Landmark className="w-10 h-10 text-yellow-500" />;
  if (lower.includes("siêu anh hùng") || lower.includes("super hero"))
    return <Swords className="w-10 h-10 text-yellow-500" />;
  if (lower.includes("friends") || lower.includes("heart"))
    return <Heart className="w-10 h-10 text-yellow-500" />;
  // fallback
  const Icon = ICONS[idx % ICONS.length];
  return <Icon className="w-10 h-10 text-yellow-500" />;
}

export default function MainHome() {
  const { data: products } = useSanPham();
  const { data: categories } = useDanhMuc();

  // Lọc sản phẩm nổi bật từ danh sách sản phẩm khuyến mãi
  const featuredProducts = (products || [])
    .filter((p) => p.noiBat === 1 || p.noiBat === true)
    .map((p) => {
      const { anhUrls, anhSps } = p as {
        anhUrls?: { url: string; anhChinh?: boolean }[];
        anhSps?: { url: string; anhChinh?: boolean }[];
      };
      return {
        ...p,
        maSanPham: p.maSanPham ?? "",
        moTa: p.moTa ?? "",
        soLuongManhGhep: p.soLuongManhGhep ?? undefined,
        soLuongVote: p.soLuongVote ?? 0,
        danhGiaTrungBinh: p.danhGiaTrungBinh ?? 0,
        trangThaiKM: "",
        anhUrls: anhUrls
          ? anhUrls.map((img) => ({
              id: 0,
              url: img.url,
              anhChinh: !!img.anhChinh,
              moTa: "",
            }))
          : anhSps
          ? anhSps.map((img) => ({
              id: 0,
              url: img.url,
              anhChinh: !!img.anhChinh,
              moTa: "",
            }))
          : [],
        phanTramKhuyenMai: null,
        giaKhuyenMai: p.giaKhuyenMai ?? null,
      };
    });

  return (
    <div className="text-black ">

      {/* Banner Carousel */}
      <BannerCarousel />

      <Navbar />
      <motion.div
        className="items-center font-bold text-center text-3xl mt-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl lg:text-4xl font-black mb-4 text-blue-900">
          Sản phẩm nổi bật
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Những bộ LEGO được yêu thích nhất với chất lượng tuyệt vời và giá cả
          hấp dẫn
        </p>
      </motion.div>
      <div className="flex justify-center w-full mt-10">
        <div className="w-full max-w-7xl">
          <SanPhamListNoBox ps={featuredProducts} />
        </div>
      </div>

      {/* Game Banner */}
      <motion.section
        className="py-16 px-4 bg-gradient-to-r from-purple-50 to-blue-50"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-purple-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                    <Gamepad2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Cờ Caro Online
                  </h2>
                </div>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl">
                  Thư giãn với game cờ caro thú vị! Chơi với bạn bè hoặc thử
                  thách AI. Hoàn toàn miễn phí và không cần đăng ký.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Button
                    onClick={() => (window.location.href = "/caro")}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-lg transition-all hover:scale-105"
                  >
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Chơi ngay
                  </Button>
                  <Button 
                    className="border-2 border-purple-400 text-purple-600 bg-white hover:bg-white hover:text-purple-600 hover:border-purple-600 font-semibold px-8 py-3 rounded-lg transition-all hover:scale-105"
                  >
                    Tìm hiểu thêm
                  </Button>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative">
                  <div className="w-64 h-64 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl overflow-hidden border-2 border-dashed border-purple-300 relative">
                    <Image 
                      src="/images/banner_caro.jpg" 
                      alt="Game Cờ Caro Preview" 
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex items-center justify-center h-full">
                              <div class="text-center">
                                <svg class="w-16 h-16 text-purple-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"></path>
                                </svg>
                                <p class="text-purple-600 font-semibold">Game Cờ Caro</p>
                                <p class="text-sm text-purple-500">15x15 Board</p>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                    FREE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Danh mục sản phẩm */}
      <motion.section
        className="pt-16 pb-0 px-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-4xl font-black mb-4 text-blue-900">
              Danh mục sản phẩm
            </h2>
            <p className="text-lg text-gray-600">
              Khám phá các bộ sưu tập LEGO đa dạng
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories?.slice(0, 8).map((cat, idx) => (
              <motion.div
                key={cat.id}
                className={`lego-card p-6 text-center cursor-pointer group bg-white rounded-2xl border flex flex-col items-center justify-center`}
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 8px 24px 0 rgba(0, 132, 255, 0.15)",
                  borderColor: "#60a5fa", // Tailwind blue-400
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex justify-center mb-3 group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cat.tenDanhMuc, idx)}
                </div>
                <h3 className="font-bold text-gray-800 mb-1 truncate w-full">
                  {cat.tenDanhMuc}
                </h3>
                <p className="text-sm text-gray-600">
                  {products
                    ? products.filter(
                        (p) =>
                          p.danhMucId === cat.id &&
                          p.trangThai === "Đang kinh doanh"
                      ).length
                    : "?"}{" "}
                  sản phẩm
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      <WhyChooseUs />
      <ChatWidget />
      <CallToActionBanner />
    </div>
  );
}
