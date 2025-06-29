import React from "react";
import { Button } from "@/components/ui/button";

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

const getStatusColor = (status: string) => {
    switch (status) {
        case "PENDING":
            return "bg-yellow-100 text-yellow-800";
        case "PROCESSING":
            return "bg-blue-100 text-blue-800";
        case "SHIPPED":
            return "bg-purple-100 text-purple-800";
        case "DELIVERED":
            return "bg-green-100 text-green-800";
        case "CANCELLED":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

interface HoaDonDetailProps {
    open: boolean;
    onClose: () => void;
    detail: any;
    loadingDetail: boolean;
    chiTietSanPham: any[];
    exportExcel: () => void;
    exportDocx: () => void;
}

const HoaDonDetail: React.FC<HoaDonDetailProps> = ({
    open,
    onClose,
    detail,
    loadingDetail,
    chiTietSanPham,
    exportExcel,
    exportDocx,
}) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-10 w-[1100px] max-h-[95vh] overflow-y-auto relative text-black border-2 border-blue-200">
                <button
                    className="absolute top-4 right-6 text-2xl text-gray-400 hover:text-red-500 transition"
                    onClick={onClose}
                    aria-label="Đóng"
                >
                    ×
                </button>
                {loadingDetail ? (
                    <div className="text-center text-lg py-10">Đang tải chi tiết...</div>
                ) : detail ? (
                    <div>
                        <h3 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-wide">
                            Chi tiết hóa đơn #{detail.id}
                        </h3>
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div className="space-y-2">
                                <div><b>Mã hóa đơn:</b> <span className="font-semibold">{detail.id}</span></div>
                                <div>
                                    <b>Ngày tạo:</b>{" "}
                                    <span>
                                        {detail.ngayTao
                                            ? (() => {
                                                const d = parseBackendDate(detail.ngayTao);
                                                return d ? d.toLocaleString("vi-VN") : "";
                                            })()
                                            : ""}
                                    </span>
                                </div>
                                <div><b>Trạng thái:</b> <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(detail.trangThai as string)}`}>{detail.trangThai}</span></div>
                                <div><b>Phương thức thanh toán:</b> {detail.phuongThucThanhToan}</div>
                                <div><b>Tạm tính:</b> <span className="text-blue-700">{detail.tamTinh?.toLocaleString()}₫</span></div>
                                <div><b>Giảm giá:</b> <span className="text-yellow-700">{detail.soTienGiam?.toLocaleString()}₫</span></div>
                                <div><b>Tổng tiền:</b> <span className="text-green-700 font-bold">{detail.tongTien?.toLocaleString()}₫</span></div>
                            </div>
                            <div className="space-y-2">
                                <div><b>Tên khách hàng:</b> {detail.ten}</div>
                                <div><b>Số điện thoại:</b> {detail.sdt}</div>
                                <div><b>Địa chỉ giao hàng:</b> {detail.diaChiGiaoHang}</div>
                                <div><b>ID người dùng:</b> {detail.userId}</div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-6 mb-6">
                            <Button onClick={exportExcel} className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold px-6 py-2 rounded-lg shadow hover:from-green-500 hover:to-blue-600 transition">
                                Xuất Excel
                            </Button>
                            <Button onClick={exportDocx} className="flex items-center gap-2 bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-semibold px-6 py-2 rounded-lg shadow hover:from-indigo-500 hover:to-purple-600 transition">
                                Xuất Docx
                            </Button>
                        </div>
                        <div>
                            <b className="block mb-2 text-lg text-blue-700">Chi tiết sản phẩm:</b>
                            <table className="w-full border mt-2 text-base rounded-lg overflow-hidden shadow">
                                <thead>
                                    <tr className="bg-blue-100 text-blue-900">
                                        <th className="border px-3 py-2">STT</th>
                                        <th className="border px-3 py-2">Mã sản phẩm</th>
                                        <th className="border px-3 py-2">Tên sản phẩm</th>
                                        <th className="border px-3 py-2">Số lượng</th>
                                        <th className="border px-3 py-2">Đơn giá</th>
                                        <th className="border px-3 py-2">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chiTietSanPham.map((sp, idx) => (
                                        <tr key={sp.masp ?? sp.idSanPham ?? idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                            <td className="border px-3 py-2 text-center">{idx + 1}</td>
                                            <td className="border px-3 py-2">{sp.masp ?? ""}</td>
                                            <td className="border px-3 py-2">{sp.tensp ?? ""}</td>
                                            <td className="border px-3 py-2 text-center">{sp.soLuong ?? ""}</td>
                                            <td className="border px-3 py-2 text-right">
                                                {sp.gia !== undefined && sp.gia !== null
                                                    ? Number(sp.gia).toLocaleString() + "₫"
                                                    : ""}
                                            </td>
                                            <td className="border px-3 py-2 text-right">
                                                {sp.tongTien !== undefined && sp.tongTien !== null
                                                    ? Number(sp.tongTien).toLocaleString() + "₫"
                                                    : ""}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-blue-50 font-semibold">
                                        <td colSpan={5} className="border px-3 py-2 text-right">Tạm tính:</td>
                                        <td className="border px-3 py-2 text-right">{detail.tamTinh?.toLocaleString()}₫</td>
                                    </tr>
                                    <tr className="bg-yellow-50 font-semibold">
                                        <td colSpan={5} className="border px-3 py-2 text-right">Giảm giá:</td>
                                        <td className="border px-3 py-2 text-right">{detail.soTienGiam?.toLocaleString()}₫</td>
                                    </tr>
                                    <tr className="bg-green-50 font-bold">
                                        <td colSpan={5} className="border px-3 py-2 text-right">Tổng cộng:</td>
                                        <td className="border px-3 py-2 text-right">{detail.tongTien?.toLocaleString()}₫</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-red-500 text-center text-lg py-10">Không tìm thấy chi tiết hóa đơn.</div>
                )}
            </div>
        </div>
    );
};

export default HoaDonDetail;
