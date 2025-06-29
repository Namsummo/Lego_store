import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrangThaiHoaDon } from "@/components/types/hoaDon-types";

// Badge màu cho trạng thái
const STATUS_BADGE: Record<string, string> = {
    DELIVERED: "bg-green-100 text-green-800 border border-green-300",
    CANCELLED: "bg-red-100 text-red-800 border border-red-300",
    SHIPPED: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    PROCESSING: "bg-blue-100 text-blue-800 border border-blue-300",
    PENDING: "bg-gray-100 text-gray-800 border border-gray-300",
};

// Hàm kiểm tra hợp lệ chuyển trạng thái
function isValidTrangThaiTransition(current: string, next: string): boolean {
    switch (current) {
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

function parseBackendDate(date: number[] | Date | string | number | undefined): Date | null {
    if (!date) return null;
    if (Array.isArray(date) && date.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = date;
        return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1e6));
    }
    if (typeof date === "string" || typeof date === "number" || date instanceof Date) {
        const d = new Date(date);
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
}

interface Order {
    id: number;
    customer: string;
    service: string;
    status: string | number | null;
    date: string | number | Date;
    paymentMethod?: string;
    total?: number;
    shippingCode?: string; // Thêm mã vận chuyển
}

interface OrderTableProps {
    orders: Order[];
    STATUS: { value: string; label: string }[];
    handleStatusChange: (id: number, value: string) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({
    orders, STATUS, handleStatusChange
}) => (
    <div className="rounded-2xl shadow-xl overflow-x-auto bg-[#181e29] border border-blue-900">
        <Table>
            <TableHeader>
                <TableRow className="bg-[#232b3b]">
                    <TableHead className="text-white font-semibold text-center">Mã đơn</TableHead>
                    <TableHead className="text-white font-semibold text-center">Khách hàng</TableHead>
                    <TableHead className="text-white font-semibold text-center">Địa chỉ nhận hàng</TableHead>
                    <TableHead className="text-white font-semibold text-center">Trạng thái</TableHead>
                    <TableHead className="text-white font-semibold text-center">Ngày Tạo</TableHead>
                    <TableHead className="text-white font-semibold text-center">Mã vận chuyển</TableHead>
                    <TableHead className="text-white font-semibold text-center">Phương thức thanh toán</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-[#232b3b] transition">
                        <TableCell className="text-white text-center font-bold">{order.id}</TableCell>
                        <TableCell className="text-white text-center">{order.customer}</TableCell>
                        <TableCell className="text-white text-center">{order.service}</TableCell>
                        <TableCell className="text-center">
                            <Select
                                value={order.status as string}
                                onValueChange={(value) => {
                                    if (!isValidTrangThaiTransition(order.status as string, value)) {
                                        alert("Chuyển trạng thái không hợp lệ!");
                                        return;
                                    }
                                    handleStatusChange(order.id, value);
                                }}
                            >
                                <SelectTrigger className="w-32 bg-white/10 border border-blue-400 text-white rounded-lg text-xs font-semibold">
                                    <SelectValue>
                                        {STATUS.find((st) => st.value === order.status)?.label || order.status}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS.map((st) => (
                                        <SelectItem
                                            key={st.value}
                                            value={st.value}
                                            disabled={
                                                st.value === order.status ||
                                                !isValidTrangThaiTransition(order.status as string, st.value)
                                            }
                                            className={
                                                st.value === order.status ||
                                                    !isValidTrangThaiTransition(order.status as string, st.value)
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
                        <TableCell className="text-white text-center">
                            {(() => {
                                const d = parseBackendDate(order.date);
                                return d ? d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN") : "-";
                            })()}
                        </TableCell>
                        <TableCell className="text-white text-center">
                            {order.shippingCode || "-"}
                        </TableCell>
                        <TableCell className="text-white text-center">
                            {order.paymentMethod || "-"}
                        </TableCell>
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
