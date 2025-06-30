"use client";
import { KhuyenMaiDTO } from "@/components/types/khuyenmai-type";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAddKhuyenMaiVaoSanPham,
  useKhuyenMai,
  useListKhuyenMaiTheoSanPham,
} from "@/hooks/useKhuyenmai";
import React, { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
interface Props {
  currentPage: number;
  itemPerPage: number;
}

export default function KhuyenMaiSanPham({ currentPage, itemPerPage }: Props) {
  const { data: danhSachKhuyenMai = [] } = useKhuyenMai();
  const { data: danhSachSanPhamKM = [], isLoading } =
    useListKhuyenMaiTheoSanPham();
  const applyKM = useAddKhuyenMaiVaoSanPham();
  const [selectedKMId, setSelectedKMId] = useState<number | null>(null);
  const [selectedSPId, setSelectedSPId] = useState<number[]>([]);
  function toogleSanPham(id: number) {
    setSelectedSPId((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }
  function handleApplyKM() {
    if (!selectedKMId || selectedSPId.length === 0) {
      toast.error("Vui lòng chọn mã khuyến mãi vào sản phẩm");
      return;
    }
    applyKM.mutate(
      {
        khuyenMaiId: selectedKMId,
        listSanPhamId: selectedSPId,
      },
      {
        onSuccess: () => {
          setSelectedSPId([]);
        },
      }
    );
  }
  const paginatedData = danhSachSanPhamKM.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Áp dụng khuyến mãi cho sản phẩm</h2>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="glass-card flex gap-3 p-6 mb-8 rounded-md border border-white/20 bg-[#10123c]"
      >
        <Select onValueChange={(value) => setSelectedKMId(Number(value))}>
          <SelectTrigger className="w-72">
            <SelectValue placeholder="Chọn khuyến mãi" />
          </SelectTrigger>
          <SelectContent>
            {danhSachKhuyenMai.map((km: KhuyenMaiDTO) => (
              <SelectItem key={km.id} value={km.id.toString()}>
                {km.tenKhuyenMai} (${km.phanTramKhuyenMai}%)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleApplyKM}>Áp dung khuyến mãi</Button>
      </motion.div>
      {/* Table */}
      {isLoading ? (
        <div className="text-center py-4">Đang tải dữ liệu ....</div>
      ) : (
        <div className="border-3 border-blue-900 rounded-2xl ">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>STT</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Giá gốc</TableHead>
                <TableHead>% Khuyến Mãi</TableHead>
                <TableHead>Giá Khuyến Mãi</TableHead>
                <TableHead>Trạng Thái</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-white font-medium">
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <p className="text-xl font-medium">Chưa có sản phẩm nào</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((sp, index) => {
                  const apDungKhuyenMai = sp.phanTramKhuyenMai !== null;
                  return (
                    <TableRow key={sp.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSPId.includes(sp.id)}
                          onCheckedChange={() => toogleSanPham(sp.id)}
                          disabled={apDungKhuyenMai}
                        />
                      </TableCell>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{sp.tenSanPham}</TableCell>
                      <TableCell>{sp.gia.toLocaleString()} đ</TableCell>
                      <TableCell>
                        {sp.phanTramKhuyenMai
                          ? `${sp.phanTramKhuyenMai}%`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {sp.giaKhuyenMai
                          ? `${sp.giaKhuyenMai.toLocaleString()} đ`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {apDungKhuyenMai ? (
                          <span className="text-green-600 font-medium">
                            Đã áp dụng
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">
                            Chưa áp dụng
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
