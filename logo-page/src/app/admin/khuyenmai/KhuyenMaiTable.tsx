import { KhuyenMaiDTO } from "@/components/types/khuyenmai-type";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { formatDateFlexible } from "./formatDateFlexible";
import { Edit, Trash2 } from "lucide-react";

interface Props {
  khuyenMai: KhuyenMaiDTO[];
  onDelete: (id: number) => void;
  onEdit: (data: KhuyenMaiDTO) => void;
}
export default function KhuyenMaiTable({ khuyenMai, onDelete, onEdit }: Props) {
  return (
    <div className="border-2  border-blue-500  rounded-2xl mt-2">
      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Mã Khuyến Mại</TableHead>
            <TableHead>Tên Khuyến Mại</TableHead>
            <TableHead>Phần Trăm (%)</TableHead>
            <TableHead>Ngày Bắt Đầu</TableHead>
            <TableHead>Ngày Kết Thúc</TableHead>
            <TableHead>Ngày Tạo</TableHead>
            <TableHead>Trạng Thái</TableHead>
            <TableHead>Hành Động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {khuyenMai.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center">
                Không có khuyến mãi nào
              </TableCell>
            </TableRow>
          ) : (
            khuyenMai.map((km, idx) => (
              <TableRow key={km.maKhuyenMai}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{km.maKhuyenMai}</TableCell>
                <TableCell>{km.tenKhuyenMai}</TableCell>
                <TableCell>{km.phanTramKhuyenMai}</TableCell>
                <TableCell>{formatDateFlexible(km.ngayBatDau)}</TableCell>
                <TableCell>{formatDateFlexible(km.ngayKetThuc)}</TableCell>
                <TableCell>{formatDateFlexible(km.ngayTao)}</TableCell>

                <TableCell>
                  <span
                    className={cn(
                      "font-bold",
                      km.trangThai === "active" && "text-green-600",
                      km.trangThai === "inactive" && "text-yellow-600",
                      km.trangThai === "expired" && "text-red-600",
                      !["active", "inactive", "expired"].includes(
                        km.trangThai
                      ) && "text-gray-500"
                    )}
                  >
                    {km.trangThai === "active"
                      ? "Đang hoạt động"
                      : km.trangThai === "inactive"
                      ? "Chưa bắt đầu"
                      : km.trangThai === "expired"
                      ? "Đã hết hạn"
                      : "Không xác định"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button title="Chỉnh sửa" onClick={() => onEdit(km)}>
                      <Edit className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button title="Xóa" onClick={() => onDelete(km.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
