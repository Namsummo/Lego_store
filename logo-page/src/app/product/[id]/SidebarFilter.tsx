"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBoSuutap } from "@/hooks/useBoSutap";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import { cn } from "@/lib/utils";
import { ChevronDown, FilterIcon } from "lucide-react";
import React, { useState } from "react";

export const getTuoi = [
  { label: "6-10 tuổi", min: 6, max: 10 },
  { label: "10-15 tuổi", min: 10, max: 15 },
  { label: "15-20 tuổi", min: 15, max: 20 },
  { label: "20-30 tuổi", min: 20, max: 30 },
  { label: "30-50 tuổi", min: 50, max: 50 },
];

export const getGia = [
  { label: "Dưới 500k", min: 0, max: 500000 },
  { label: "Từ 500k -1M", min: 500000, max: 1000000 },
  { label: "Từ 1M - 2M", min: 1000000, max: 2000000 },
  { label: "Trên 2M", min: 2000000, max: Infinity },
];

interface SidebarFilterProps {
  selectedDanhMuc: number | null;
  setSelectedDanhMuc: (value: number | null) => void;
  selectedTuoi: string | null;
  setSelectedTuoi: (value: string | null) => void;
  selectedGia: string | null;
  setSelectedGia: (value: string | null) => void;
  selectedBoSuuTap: number | null;
  setSelectedBoSutap: (value: number | null) => void;
}

export default function SidebarFilter({
  selectedBoSuuTap,
  selectedDanhMuc,
  selectedGia,
  selectedTuoi,
  setSelectedBoSutap,
  setSelectedDanhMuc,
  setSelectedGia,
  setSelectedTuoi,
}: SidebarFilterProps) {
  const { data: danhMucs = [] } = useDanhMuc();
  const { data: boSuuTaps = [] } = useBoSuutap();

  const [isDanhMucOpen, setIsDanhMucOpen] = useState(false);
  const [isTuoiOpen, setIsTuoiOpen] = useState(false);
  const [isBoSuuTapOpen, setIsBoSuuTapOpen] = useState(false);
  const [isGiaOpen, setIsGiaOpen] = useState(false);
  return (
    <div className="flex flex-col lg:flex-row gap-8 px-4 relative z-0">
      <div className="w-full max-w-md bg-yellow-100 p-5 rounded-2xl shadow-lg border border-gray-300 sticky top-4 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex gap-2 text-gray-800 font-bold tracking-wide">
            <FilterIcon className="w-5 h-5" />
            <span className="text-lg">Bộ lọc</span>
          </h2>
          <Button
            variant="link"
            onClick={() => {
              setSelectedBoSutap(null);
              setSelectedDanhMuc(null);
              setSelectedTuoi(null);
              setSelectedGia(null);
            }}
            className="text-sm text-blue-700 hover:underline"
          >
            Xóa lọc
          </Button>
        </div>

        {/* ---- DANH MỤC ---- */}
        <div className="mb-6">
          <h3
            className="font-semibold text-gray-800 flex justify-between items-center cursor-pointer"
            onClick={() => setIsDanhMucOpen(!isDanhMucOpen)}
          >
            <span>DANH MỤC</span>
            <ChevronDown
              className={`transition-transform ${
                isDanhMucOpen ? "rotate-180" : ""
              }`}
            />
          </h3>
          {isDanhMucOpen && (
            <ul className="mt-2 space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 pr-1">
              <li>
                <Button
                  onClick={() => setSelectedDanhMuc(null)}
                  className={cn(
                    "w-full justify-start px-3 py-2 rounded-md",
                    !selectedDanhMuc
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100"
                  )}
                >
                  Tất cả danh mục
                </Button>
              </li>
              {danhMucs.map((dm) => (
                <li key={dm.id}>
                  <Button
                    onClick={() => setSelectedDanhMuc(dm.id)}
                    className={cn(
                      "w-full justify-start px-3 py-2 rounded-md",
                      selectedDanhMuc === dm.id
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "hover:bg-gray-100"
                    )}
                  >
                    {dm.tenDanhMuc}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ---- BỘ SƯU TẬP ---- */}
        <div className="mb-6">
          <h3
            className="font-semibold text-gray-800 flex justify-between items-center cursor-pointer"
            onClick={() => setIsBoSuuTapOpen(!isBoSuuTapOpen)}
          >
            <span>BỘ SƯU TẬP</span>
            <ChevronDown
              className={`transition-transform ${
                isBoSuuTapOpen ? "rotate-180" : ""
              }`}
            />
          </h3>
          {isBoSuuTapOpen && (
            <ul className="mt-2 space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 pr-1">
              <li>
                <Button
                  onClick={() => setSelectedBoSutap(null)}
                  className={cn(
                    "w-full justify-start px-3 py-2 rounded-md",
                    !selectedBoSuuTap
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100"
                  )}
                >
                  Tất cả bộ sưu tập
                </Button>
              </li>
              {boSuuTaps.map((bst) => (
                <li key={bst.id}>
                  <Button
                    onClick={() => setSelectedBoSutap(bst.id)}
                    className={cn(
                      "w-full justify-start px-3 py-2 rounded-md",
                      selectedBoSuuTap === bst.id
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "hover:bg-gray-100"
                    )}
                  >
                    {bst.tenBoSuuTap}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ---- ĐỘ TUỔI ---- */}
        <div className="mb-6">
          <h3
            className="font-semibold text-gray-800 flex justify-between items-center cursor-pointer"
            onClick={() => setIsTuoiOpen(!isTuoiOpen)}
          >
            <span>ĐỘ TUỔI</span>
            <ChevronDown
              className={`transition-transform ${
                isTuoiOpen ? "rotate-180" : ""
              }`}
            />
          </h3>
          {isTuoiOpen && (
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 pr-1">
              {getTuoi.map((range) => (
                <label
                  key={range.label}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Input
                    type="checkbox"
                    className="w-5 h-5"
                    checked={selectedTuoi === range.label}
                    onChange={() =>
                      setSelectedTuoi(
                        selectedTuoi === range.label ? null : range.label
                      )
                    }
                  />
                  <span className="text-sm text-gray-700">{range.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* ---- GIÁ ---- */}
        <div>
          <h3
            className="font-semibold text-gray-800 flex justify-between items-center cursor-pointer"
            onClick={() => setIsGiaOpen(!isGiaOpen)}
          >
            <span>KHOẢNG GIÁ</span>
            <ChevronDown
              className={`transition-transform ${
                isGiaOpen ? "rotate-180" : ""
              }`}
            />
          </h3>
          {isGiaOpen && (
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 pr-1">
              {getGia.map((range) => (
                <label
                  key={range.label}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Input
                    type="checkbox"
                    className="w-5 h-5"
                    checked={selectedGia === range.label}
                    onChange={() =>
                      setSelectedGia(
                        selectedGia === range.label ? null : range.label
                      )
                    }
                  />
                  <span className="text-sm text-gray-700">{range.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
