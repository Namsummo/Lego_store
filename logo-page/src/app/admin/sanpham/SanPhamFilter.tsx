// app/components/sanpham/SanPhamFilter.tsx
"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchStore } from "@/context/useSearch.store";

interface Props {
  danhMucs: { id: number; tenDanhMuc: string }[];
  boSuuTaps: { id: number; tenBoSuuTap: string }[];
  selectedDanhMuc: number | null;
  selectedBoSuuTap: number | null;
  onChangeDanhMuc: (id: number | null) => void;
  onChangeBoSuuTap: (id: number | null) => void;
}

export default function SanPhamFilter({
  danhMucs,
  boSuuTaps,
  selectedDanhMuc,
  selectedBoSuuTap,
  onChangeDanhMuc,
  onChangeBoSuuTap,
}: Props) {
  const { keyword, setKeyword } = useSearchStore();

  return (
    <div className="flex flex-wrap gap-4 my-4">
      {/* Tìm kiếm theo tên / mã sản phẩm */}
      <Input
        placeholder="Tìm theo tên hoặc mã sản phẩm"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="w-full sm:w-[250px]"
      />

      <div className="flex items-center gap-5">
        {/* Lọc theo danh mục */}
        <Select
          onValueChange={(val) => onChangeDanhMuc(val === "all" ? null : +val)}
          value={selectedDanhMuc?.toString() || "all"}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {danhMucs.map((dm) => (
              <SelectItem key={dm.id} value={dm.id.toString()}>
                {dm.tenDanhMuc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Lọc theo bộ sưu tập */}
        <Select
          onValueChange={(val) => onChangeBoSuuTap(val === "all" ? null : +val)}
          value={selectedBoSuuTap?.toString() || "all"}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Chọn bộ sưu tập" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả bộ sưu tập</SelectItem>
            {boSuuTaps.map((bst) => (
              <SelectItem key={bst.id} value={bst.id.toString()}>
                {bst.tenBoSuuTap}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
