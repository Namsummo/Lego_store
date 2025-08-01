"use client";
import { useSanPham } from "@/hooks/useSanPham";
import React from "react";
import Navbar from "../(pages)/Navbar";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import SanPhamListNoBox from "./SanPhamListNoBox";
import { Building2, Puzzle, Shield, Bot, Car, Rocket, Landmark, Swords, Heart } from "lucide-react";
import CallToActionBanner from "./CallToActionBanner";
import WhyChooseUs from "./WhyChooseUs";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Hàm chọn icon lucide-react dựa trên tên danh mục, nếu không match thì lấy icon theo index
const ICONS = [Building2, Puzzle, Shield, Bot, Car, Rocket, Landmark, Swords, Heart];
function getCategoryIcon(name: string, idx: number) {
  const lower = name.toLowerCase();
  if (lower.includes("city")) return <Building2 className="w-10 h-10 text-yellow-500" />;
  if (lower.includes("star wars")) return <Rocket className="w-10 h-10 text-yellow-500" />;
  if (lower.includes("quân đội") || lower.includes("army")) return <Shield className="w-10 h-10 text-yellow-500" />;
  if (lower.includes("siêu xe") || lower.includes("super car") || lower.includes("car")) return <Car className="w-10 h-10 text-yellow-500" />;
  if (lower.includes("creator")) return <Puzzle className="w-10 h-10 text-yellow-500" />;
  if (lower.includes("robot")) return <Bot className="w-10 h-10 text-yellow-500" />;
  if (lower.includes("ninja go") || lower.includes("ninjago") || lower.includes("ninja")) return <Landmark className="w-10 h-10 text-yellow-500" />;
  if (lower.includes("siêu anh hùng") || lower.includes("super hero")) return <Swords className="w-10 h-10 text-yellow-500" />;
  if (lower.includes("friends") || lower.includes("heart")) return <Heart className="w-10 h-10 text-yellow-500" />;
  // fallback
  const Icon = ICONS[idx % ICONS.length];
  return <Icon className="w-10 h-10 text-yellow-500" />;
}

export default function MainHome() {
  const {
    data: products,
  } = useSanPham();
  const {
    data: categories,
  } = useDanhMuc();

  // Lọc sản phẩm nổi bật từ danh sách sản phẩm khuyến mãi
  const featuredProducts = (products || [])
    .filter((p) => p.noiBat === 1 || p.noiBat === true)
    .map((p) => {
      const { anhUrls, anhSps } = p as { anhUrls?: { url: string; anhChinh?: boolean }[]; anhSps?: { url: string; anhChinh?: boolean }[] };
      return {
        ...p,
        maSanPham: p.maSanPham ?? "",
        moTa: p.moTa ?? "",
        soLuongManhGhep: p.soLuongManhGhep ?? undefined,
        soLuongVote: p.soLuongVote ?? 0,
        danhGiaTrungBinh: p.danhGiaTrungBinh ?? 0,
        trangThaiKM: "",
        anhUrls: anhUrls
          ? anhUrls.map(img => ({ id: 0, url: img.url, anhChinh: !!img.anhChinh, moTa: '' }))
          : (anhSps ? anhSps.map(img => ({ id: 0, url: img.url, anhChinh: !!img.anhChinh, moTa: '' })) : []),
        phanTramKhuyenMai: null,
        giaKhuyenMai: p.giaKhuyenMai ?? null,
      };
    });

  return (
    <div className="text-black ">

      {/* Banner */}
      <div className="w-full">
        {/* Banner */}
        <div className="relative h-[500px] w-full overflow-hidden">
          <Image
            src="/images/banner1.jpg"
            alt="Banner"
            fill
            priority
            quality={100}
            className="object-cover"
            sizes="100vw"
          />

          {/* Nội dung trên banner */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-4 drop-shadow-lg">
              Siêu khuyến mãi
            </h1>
            <p className="text-xl mb-8 max-w-2xl text-black drop-shadow md:text-2xl">
              Giảm giá lên đến 30% toàn bộ sản phẩm lego
            </p>
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg px-8 py-4 rounded-lg shadow-lg transition-all hover:scale-105">
              <Link href="/product">MUA NGAY</Link>
            </Button>
          </div>
        </div>
      </div>

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
          Những bộ LEGO được yêu thích nhất với chất lượng tuyệt vời và giá cả hấp dẫn
        </p>
      </motion.div>
      <div className="flex justify-center w-full mt-10">
        <div className="w-full max-w-7xl">
          <SanPhamListNoBox ps={featuredProducts} />
        </div>
      </div>

      {/* Danh mục sản phẩm */}
      <motion.section
        className="pt-16 pb-0 px-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-4xl font-black mb-4 text-blue-900">Danh mục sản phẩm</h2>
            <p className="text-lg text-gray-600">Khám phá các bộ sưu tập LEGO đa dạng</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories?.slice(0, 8).map((cat, idx) => (
              <motion.div
                key={cat.id}
                className={`lego-card p-6 text-center cursor-pointer group bg-white rounded-2xl border flex flex-col items-center justify-center`}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 8px 24px 0 rgba(0, 132, 255, 0.15)',
                  borderColor: '#60a5fa', // Tailwind blue-400
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex justify-center mb-3 group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cat.tenDanhMuc, idx)}
                </div>
                <h3 className="font-bold text-gray-800 mb-1 truncate w-full">{cat.tenDanhMuc}</h3>
                <p className="text-sm text-gray-600">{products ? products.filter(p => p.danhMucId === cat.id && p.trangThai === "Đang kinh doanh").length : "?"} sản phẩm</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      <WhyChooseUs />
      <CallToActionBanner />
    </div>
  );
}
