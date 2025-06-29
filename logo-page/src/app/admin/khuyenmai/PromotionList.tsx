"use client";

import React, { ChangeEvent } from "react";
import { Edit, Trash2 } from "lucide-react";
import { KhuyenMai } from "@/components/types/khuyenmai-type";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PromotionListProps {
  promotions: KhuyenMai[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onEdit: (id: string | number) => void;
  onDelete: (id: string | number) => void;
  onRefresh: () => void;
}

const PromotionList: React.FC<PromotionListProps> = ({
  promotions,
  loading,
  onEdit,
  onDelete,
}) => {
  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch (error) {
      console.error("Lỗi định dạng ngày:", error);
      return dateString;
    }
  };

  const getStatusVariant = (
    status: string | undefined
  ): "default" | "secondary" | "destructive" | "outline" | "success" => {
    switch (status) {
      case "Đang hoạt động":
        return "success";
      case "Sắp diễn ra":
        return "secondary";
      case "Hết hạn":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="border rounded-lg">
      <ScrollArea className="h-[calc(100vh-300px)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Mã khuyến mãi</TableHead>

              <TableHead>% Giảm</TableHead>
              <TableHead>Ngày bắt đầu</TableHead>
              <TableHead>Ngày kết thúc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-6">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="mt-2 text-gray-500">
                      Đang tải dữ liệu...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : promotions.length > 0 ? (
              promotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell>{promo.id}</TableCell>
                  <TableCell>{promo.maKhuyenMai}</TableCell>

                  <TableCell>{promo.phanTramGiam}%</TableCell>
                  <TableCell>{formatDisplayDate(promo.ngayBatDau)}</TableCell>
                  <TableCell>{formatDisplayDate(promo.ngayKetThuc)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(promo.trangThai)}>
                      {promo.trangThai || "Không xác định"}
                    </Badge>
                  </TableCell>
                  <TableCell className="!p-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => onEdit(promo.id)}
                        variant="default"
                        size="icon"
                        title="Sửa"
                      >
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button
                        onClick={() => onDelete(promo.id)}
                        size="icon"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-6 text-gray-500"
                >
                  Không có dữ liệu khuyến mãi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default PromotionList;
