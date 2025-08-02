"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDateFlexible } from "../khuyenmai/formatDateFlexible";
import { TrangThaiHoaDon, HoaDonDTO } from "@/components/types/hoaDon-types";
import { useState } from "react";

interface OrderTableProps {
  data: { content: HoaDonDTO[]; totalPages: number };
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  PAGE_SIZE: number;
  handleStatusUpdate: (
    id: number,
    currentStatus: string,
    nextStatus: string
  ) => void;
  isValidTrangThaiTransition: (current: string, next: string) => boolean;
}

export default function OrderTable({
  data,
  page,
  setPage,
  PAGE_SIZE,
  handleStatusUpdate,
  isValidTrangThaiTransition,
}: OrderTableProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<HoaDonDTO | null>(null);
  const [nextStatus, setNextStatus] = useState<string | null>(null);

  const handleSelectChange = (order: HoaDonDTO, value: string) => {
    setSelectedOrder(order);
    setNextStatus(value);
    setShowDialog(true);
  };

  const confirmStatusChange = () => {
    if (selectedOrder && nextStatus) {
      handleStatusUpdate(
        selectedOrder.id,
        selectedOrder.trangThai || "",
        nextStatus
      );
    }
    setShowDialog(false);
    setSelectedOrder(null);
    setNextStatus(null);
  };

  return (
    <>
      <div className=" border-2 border-blue-500 rounded-2xl mt-3 overflow-x-auto shadow-2xl shadow-blue-500/40">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#2A2F4E]">
              {[
                "STT",
                "Mã HĐ",
                "Tên khách hàng",
                "SĐT",
                "Tổng tiền",
                "Ngày tạo",
                "Trạng thái",
                "Thanh toán",
                "Loại HĐ",
                "Mã VC",
              ].map((text) => (
                <TableHead
                  key={text}
                  className="text-white text-center text-sm font-semibold bg-blue-500"
                >
                  {text}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.content.map((hd, index) => (
              <TableRow key={hd.id} className="hover:bg-[#232b3b] transition">
                <TableCell className="text-white text-center">
                  {page * PAGE_SIZE + index + 1}
                </TableCell>
                <TableCell className="text-white font-semibold text-center">
                  {hd.maHD || "N/A"}
                </TableCell>
                <TableCell className="text-white text-center">
                  {hd.ten || hd.user?.ten || "N/A"}
                </TableCell>
                <TableCell className="text-white text-center">
                  {hd.sdt || hd.user?.sdt || "N/A"}
                </TableCell>
                <TableCell className="text-white text-center font-medium">
                  {hd.tongTien?.toLocaleString("vi-VN") || "0"}₫
                </TableCell>
                <TableCell className="text-white text-center">
                  {formatDateFlexible(hd.ngayTao)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Select
                      value={hd.trangThai || ""}
                      onValueChange={(value) => handleSelectChange(hd, value)}
                    >
                      <SelectTrigger className="w-[120px] bg-[#2A2F4E] border border-[#3B82F6] text-white text-xs font-semibold rounded-lg">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent className="mr-3 bg-[#1A1F2E] border border-[#3B82F6] text-white text-center">
                        {Object.values(TrangThaiHoaDon).map((status, idx) => (
                          <SelectItem
                            key={idx}
                            value={status}
                            disabled={
                              hd.trangThai
                                ? !isValidTrangThaiTransition(
                                  hd.trangThai,
                                  status
                                ) || hd.trangThai === status
                                : false
                            }
                            className="text-xs"
                          >
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell className="text-white text-center">
                  {hd.phuongThucThanhToan || "N/A"}
                </TableCell>
                <TableCell className="text-white text-center">
                  {hd.loaiHD === 1
                    ? "Tại quầy"
                    : hd.loaiHD === 2
                      ? "Online"
                      : "N/A"}
                </TableCell>
                <TableCell className="text-white text-center">
                  {hd.maVanChuyen || "N/A"}
                </TableCell>
              </TableRow>
            ))}
            {!data.content.length && (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-center text-gray-400 py-8"
                >
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* AlertDialog xác nhận chuyển trạng thái */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="bg-[#1A1F2E] border border-blue-400 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận chuyển trạng thái</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Bạn có chắc chắn muốn chuyển trạng thái từ{" "}
              <strong className="text-yellow-400">
                {selectedOrder?.trangThai}
              </strong>{" "}
              sang{" "}
              <strong className="text-green-400">{nextStatus}</strong> không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-red-500 hover:bg-red-600 text-white">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Phân trang */}
      <div className="flex justify-center items-center mt-4 bg-[#1A1F2E] p-2 rounded-lg">
        <Button
          variant="outline"
          className="text-white border-[#3B82F6] bg-[#2A2F2E] hover:bg-[#3B82F6] hover:text-white rounded-lg px-4 py-2"
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          Trang trước
        </Button>
        <span className="text-sm text-gray-400 mx-4">
          Trang <strong>{page + 1}</strong> / {data.totalPages}
        </span>
        <Button
          variant="outline"
          className="text-white border-[#3B82F6] bg-[#2A2F2E] hover:bg-[#3B82F6] hover:text-white rounded-lg px-4 py-2"
          onClick={() =>
            setPage((prev) => (prev < data.totalPages - 1 ? prev + 1 : prev))
          }
          disabled={page >= data.totalPages - 1}
        >
          Trang sau
        </Button>
      </div>
    </>
  );
}
