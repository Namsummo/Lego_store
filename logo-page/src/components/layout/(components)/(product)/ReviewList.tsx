// ReviewList.tsx
import { DanhGiaResponse } from "@/components/types/danhGia-type";
import Image from "next/image";
import { danhGiaService } from "@/services/danhGiaService";
import { Calendar, CornerDownRight, Star } from "lucide-react";
import React from "react";

// Tái sử dụng component UserInfo từ file gốc
const UserInfo = ({
  danhGia,
  soSao,
}: {
  danhGia: DanhGiaResponse;
  soSao?: number;
}) => {
  // Logic lấy tên người dùng với ưu tiên
  let displayName = "Khách";

  if (danhGia.user?.ten && danhGia.user.ten.trim()) {
    displayName = danhGia.user.ten.trim();
  } else if (danhGia.tenNguoiDung && danhGia.tenNguoiDung.trim()) {
    displayName = danhGia.tenNguoiDung.trim();
  } else if (danhGia.tenKH && danhGia.tenKH.trim()) {
    displayName = danhGia.tenKH.trim();
  }

  const avatar = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
        {avatar}
      </div>
      <div>
        <p className="font-semibold text-gray-900">{displayName}</p>
        {soSao && (
          <div className="flex items-center space-x-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < soSao ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface ReviewListProps {
  danhGias: DanhGiaResponse[];
  parseDate: (dateInput: string | number[]) => string;
  onMediaClick: (media: { type: "image" | "video"; url: string }) => void;
  selectedFilter: string;
}

export default function ReviewList({
  danhGias,
  parseDate,
  onMediaClick,
  selectedFilter,
}: ReviewListProps) {
  if (danhGias.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl">
        <div className="text-6xl mb-4">😊</div>
        <div className="text-xl text-gray-600 mb-2 font-semibold">
          {selectedFilter === "all"
            ? "Chưa có đánh giá nào"
            : "Không có đánh giá phù hợp"}
        </div>
        <div className="text-gray-500">
          {selectedFilter === "all"
            ? "Hãy là người đầu tiên đánh giá!"
            : "Thử chọn bộ lọc khác!"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {danhGias.map((danhGia) => (
        <div
          key={danhGia.id}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <UserInfo danhGia={danhGia} soSao={danhGia.soSao} />
            <div className="text-sm text-gray-500 flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
              <Calendar className="w-4 h-4" />
              {parseDate(danhGia.ngayDanhGia)}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-bold text-lg text-gray-900 mb-2">
              {danhGia.tieuDe}
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {danhGia.textDanhGia}
            </p>
          </div>

          {(danhGia.anhUrls?.length || danhGia.video) && (
            <div className="flex flex-wrap gap-3 mb-4">
              {danhGia.anhUrls?.map((anh) => (
                <Image
                  key={anh.id}
                  src={danhGiaService.getImageUrl(anh.url)}
                  alt="Review"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform shadow-md"
                  onClick={() =>
                    onMediaClick({
                      type: "image",
                      url: danhGiaService.getImageUrl(anh.url),
                    })
                  }
                />
              ))}
              {danhGia.video && (
                <div
                  className="w-20 h-20 bg-gray-900 rounded-xl cursor-pointer relative overflow-hidden hover:scale-105 transition-transform shadow-md"
                  onClick={() =>
                    onMediaClick({
                      type: "video",
                      url: danhGiaService.getVideoUrl(danhGia.video!.url),
                    })
                  }
                >
                  <video
                    src={danhGiaService.getVideoUrl(danhGia.video.url)}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-gray-800 ml-0.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {danhGia.textPhanHoi && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-l-4 border-blue-400">
              <div className="flex items-start gap-2">
                <CornerDownRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-bold text-blue-800">Phản hồi từ Lego MyKingDom:</span>
                  <p className="text-blue-800 mt-1 leading-relaxed">
                    {danhGia.textPhanHoi}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
