// components/sanpham/columns.ts
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { SanPham } from "@/components/types/product.type";

export const columns: ColumnDef<SanPham & { stt: number }>[] = [
  {
    accessorKey: "stt",
    header: "STT",
  },
  {
    accessorKey: "tenSanPham",
    header: "Tên sản phẩm",
  },
  {
    accessorKey: "moTa",
    header: "Mô tả",
  },
  {
    accessorKey: "danhMuc.tenDanhMuc",
    header: "Danh mục",
    cell: ({ row }) => row.original.danhMuc?.tenDanhMuc ?? "Không có",
  },
  {
    accessorKey: "boSuuTap.tenBoSuuTap",
    header: "Bộ sưu tập",
    cell: ({ row }) => row.original.boSuuTap?.tenBoSuuTap ?? "Không có",
  },
  {
    id: "actions",
    header: "Hành động",
    cell: ({ row }) => {
      return (
        <div className="space-x-2">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => row.original.onEdit?.(row.original)}
          >
            Sửa
          </button>
          <button
            className="text-red-600 hover:underline"
            onClick={() => row.original.onDelete?.(row.original.id)}
          >
            Xoá
          </button>
        </div>
      );
    },
  },
];
