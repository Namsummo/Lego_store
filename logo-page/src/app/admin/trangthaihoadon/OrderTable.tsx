"use client";

import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { HoaDonDTO } from "@/components/types/hoaDon-types";

// Hàm kiểm tra hợp lệ chuyển trạng thái
function isValidTrangThaiTransition(current: string, next: string): boolean {
    switch (current?.toUpperCase()) {
        case "PENDING":
            return next === "PROCESSING" || next === "CANCELLED";
        case "PROCESSING":
            return next === "SHIPPED";
        case "SHIPPED":
            return next === "DELIVERED";
        case "DELIVERED":
        case "CANCELLED":
            return false;
        default:
            return false;
    }
}

// Parse ngày từ backend (chuẩn Date array hoặc string)
function parseBackendDate(date: number[] | Date | string | number | undefined): string {
    if (!date) return "-";
    if (Array.isArray(date) && date.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = date;
        const d = new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1e6));
        return d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN");
    }
    const d = new Date(date);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN");
}

interface OrderTableProps {
    orders: HoaDonDTO[];
    STATUS: { value: string; label: string }[];
    handleStatusChange: (id: number, value: string) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({
    orders,
    STATUS,
    handleStatusChange,
}) => (
    <div className="rounded-2xl shadow-xl overflow-x-auto bg-[#181e29] border border-blue-900">
        <Table>
            <TableHeader>
                <TableRow className="bg-[#232b3b]">
                    <TableHead className="text-white text-center font-semibold">Mã đơn</TableHead>
                    <TableHead className="text-white text-center font-semibold">Khách hàng</TableHead>
                    <TableHead className="text-white text-center font-semibold">Địa chỉ nhận hàng</TableHead>
                    <TableHead className="text-white text-center font-semibold">Trạng thái</TableHead>
                    <TableHead className="text-white text-center font-semibold">Ngày tạo</TableHead>
                    <TableHead className="text-white text-center font-semibold">Mã vận chuyển</TableHead>
                    <TableHead className="text-white text-center font-semibold">Phương thức thanh toán</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((hd) => (
                    <TableRow key={hd.id} className="hover:bg-[#232b3b] transition">
                        <TableCell className="text-white text-center font-bold">{hd.id}</TableCell>
                        <TableCell className="text-white text-center">{hd.ten}</TableCell>
                        <TableCell className="text-white text-center">{hd.diaChiGiaoHang}</TableCell>
                        <TableCell className="text-center">
                            <Select
                                value={hd.trangThai?.toUpperCase()}
                                onValueChange={(value) => {
                                    if (!isValidTrangThaiTransition(hd.trangThai?.toUpperCase(), value)) {
                                        alert("Chuyển trạng thái không hợp lệ!");
                                        return;
                                    }
                                    handleStatusChange(hd.id, value); // Gọi lên component cha
                                }}
                            >
                                <SelectTrigger className="w-32 bg-white/10 border border-blue-400 text-white rounded-lg text-xs font-semibold">
                                    <SelectValue>
                                        {STATUS.find((st) => st.value === hd.trangThai?.toUpperCase())?.label || hd.trangThai}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS.map((st) => (
                                        <SelectItem
                                            key={st.value}
                                            value={st.value}
                                            disabled={
                                                st.value === hd.trangThai?.toUpperCase() ||
                                                !isValidTrangThaiTransition(hd.trangThai?.toUpperCase(), st.value)
                                            }
                                            className={
                                                st.value === hd.trangThai?.toUpperCase() ||
                                                    !isValidTrangThaiTransition(hd.trangThai?.toUpperCase(), st.value)
                                                    ? "opacity-50 pointer-events-none"
                                                    : ""
                                            }
                                        >
                                            {st.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </TableCell>
                        <TableCell className="text-white text-center">{parseBackendDate(hd.ngayTao)}</TableCell>
                        <TableCell className="text-white text-center">{hd.maVanChuyen || "-"}</TableCell>
                        <TableCell className="text-white text-center">{hd.phuongThucThanhToan || "-"}</TableCell>
                    </TableRow>
                ))}
                {orders.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                            Không có dữ liệu phù hợp.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
);

export default OrderTable;
