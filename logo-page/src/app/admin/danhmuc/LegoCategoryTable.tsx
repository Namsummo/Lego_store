"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { DanhMuc } from "@/components/types/product.type";

interface LegoCategoryTableProps {
  categories: DanhMuc[];
  onEdit: (category: DanhMuc) => void;
  onDelete: (id: number, tenBoSuuTap: string) => void;
}

const LegoCategoryTable: React.FC<LegoCategoryTableProps> = ({
  categories,
  onEdit,
  onDelete,
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
            <TableHead className="font-bold">Tên danh mục</TableHead>
            <TableHead className="font-bold">Mô tả</TableHead>
            <TableHead className="font-bold">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.tenDanhMuc}</TableCell>
              <TableCell>{c.moTa}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(c)}
                    className="hover:opacity-80 transition"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4 text-yellow-500" />
                  </button>
                  <button
                    onClick={() => onDelete(c.id, c.tenDanhMuc)}
                    className="hover:opacity-80 transition"
                    title="Xóa"
                  >
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

export default LegoCategoryTable;
