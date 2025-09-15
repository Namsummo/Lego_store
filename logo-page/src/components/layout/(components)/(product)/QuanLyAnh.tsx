import { KhuyenMaiTheoSanPham } from "@/components/types/khuyenmai-type";
import { useListKhuyenMaiTheoSanPham } from "@/hooks/useKhuyenmai";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type SanPhamChiTietWithAnhUrls = KhuyenMaiTheoSanPham & {
  anhUrls?: { url: string; anhChinh?: boolean }[];
};

export default function QuanLyAnh() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const sanPhamID = Number(id);
  const { data: sanPhamList = [] } = useListKhuyenMaiTheoSanPham();
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const sanPhamChiTietRaw = sanPhamList.find((sp) => sp.id === sanPhamID);
  const sanPhamChiTiet = sanPhamChiTietRaw as SanPhamChiTietWithAnhUrls;

  // Hàm scroll thumbnails đến ảnh được chọn
  const scrollToThumbnail = (index: number) => {
    if (thumbnailsRef.current) {
      const thumbnailWidth = 80; // w-20 = 80px
      const gap = 12; // gap-3 = 12px
      const scrollPosition = index * (thumbnailWidth + gap);
      
      thumbnailsRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const handlePrevImage = () => {
    if (!sanPhamChiTiet?.anhUrls) return;
    const prevIdx =
      (mainImageIndex - 1 + sanPhamChiTiet.anhUrls.length) %
      sanPhamChiTiet.anhUrls.length;
    setMainImageIndex(prevIdx);
    scrollToThumbnail(prevIdx);
  };

  const handleNextImage = () => {
    if (!sanPhamChiTiet?.anhUrls) return;
    const nextIdx = (mainImageIndex + 1) % sanPhamChiTiet.anhUrls.length;
    setMainImageIndex(nextIdx);
    scrollToThumbnail(nextIdx);
  };

  const handleThumbnailClick = (idx: number) => {
    setMainImageIndex(idx);
    scrollToThumbnail(idx);
  };

  useEffect(() => {
    if (sanPhamChiTiet?.anhUrls && sanPhamChiTiet.anhUrls.length > 0) {
      setMainImageIndex(0);
    }
  }, [sanPhamChiTiet]);

  const getMainImageUrl = () => {
    if (!sanPhamChiTiet?.anhUrls || sanPhamChiTiet.anhUrls.length === 0) {
      return null;
    }
    return sanPhamChiTiet.anhUrls[mainImageIndex]?.url || null;
   
  };

  return (
    <div className="w-full md:w-1/2 relative">
      {/* Main Image */}
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
        {getMainImageUrl() ? (
          <Image
            src='/images/avatar-admin.png'
            alt={sanPhamChiTiet?.tenSanPham || ""}
            width={400}
            height={400}
            className="object-contain w-full h-[350px] rounded-xl"
            onError={() => {
              console.error("Lỗi tải ảnh chính");
            }}
          />
        ) : (
          <div className="w-full h-[350px] bg-gray-100 flex justify-center items-center rounded-xl text-gray-400 text-xl">
            Không có ảnh
          </div>
        )}
      </div>
      
      {/* Thumbnails và Navigation */}
      {sanPhamChiTiet?.anhUrls && sanPhamChiTiet.anhUrls.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-3">
            {/* Nút mũi tên trái */}
            {sanPhamChiTiet.anhUrls.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm flex-shrink-0"
                onClick={handlePrevImage}
                type="button"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            
            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto flex-1" ref={thumbnailsRef}>
              {sanPhamChiTiet.anhUrls.map((anh, idx) => (
                <div
                  key={idx}
                  className={`cursor-pointer w-20 h-20 relative transition-all duration-300 hover:scale-105 ${
                    mainImageIndex === idx 
                      ? "ring-2 ring-blue-500 border-2 border-blue-400 shadow-lg opacity-100" 
                      : "border-2 border-gray-200 opacity-60 hover:opacity-80"
                  } rounded-lg overflow-hidden bg-white flex-shrink-0`}
                  onClick={() => handleThumbnailClick(idx)}
                >
                  <Image
                    src='/images/avatar-admin.png'
                    alt={`Thumbnail ${idx + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/avatar-admin.png";
                      console.error(`Lỗi tải thumbnail: ${anh.url}`);
                    }}
                  />
                </div>
              ))}
            </div>
            
            {/* Nút mũi tên phải */}
            {sanPhamChiTiet.anhUrls.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm flex-shrink-0"
                onClick={handleNextImage}
                type="button"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
