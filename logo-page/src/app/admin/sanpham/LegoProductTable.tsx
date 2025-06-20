"use client";

import React from "react";
import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SanPham } from "@/components/types/product.type";

interface Props {
  products: SanPham[];
  onEdit: (product: SanPham) => void;
  onDelete: (id: number) => void;
  getTenDanhMuc: (id: number) => string;
  getTenBoSuuTap: (id: number) => string;
}

const LegoProductTable: React.FC<Props> = ({
  products,
  onEdit,
  onDelete,
  getTenDanhMuc,
  getTenBoSuuTap,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-8 rounded-md border border-white/20 bg-[#10123c]"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ảnh</TableHead>
            <TableHead>Mã SP</TableHead>
            <TableHead>Tên SP</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Bộ sưu tập</TableHead>
            <TableHead>Độ tuổi</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Số lượng</TableHead>
            <TableHead>Mảnh ghép</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <img
                  src={p.anhDaiDien ?? "/default.jpg"}
                  alt={p.tenSanPham}
                  className="w-12 h-12 object-cover rounded"
                />
              </TableCell>
              <TableCell>{p.maSanPham}</TableCell>
              <TableCell>{p.tenSanPham}</TableCell>
              <TableCell>{getTenDanhMuc(p.danhMucId)}</TableCell>
              <TableCell>{getTenBoSuuTap(p.boSuuTapId)}</TableCell>
              <TableCell>{p.doTuoi}+</TableCell>
              <TableCell>{Number(p.gia).toLocaleString("vi-VN")}₫</TableCell>
              <TableCell>{p.soLuongTon}</TableCell>
              <TableCell>{p.soLuongManhGhep}</TableCell>
              <TableCell>{p.trangThai}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(p)} title="Chỉnh sửa">
                    <Edit className="w-4 h-4 text-yellow-500" />
                  </button>
                  <button onClick={() => onDelete(p.id)} title="Xóa">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default LegoProductTable;
