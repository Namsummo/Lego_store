"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

function parseBackendDate(date: number[] | Date | string | number | undefined): Date | null {
    if (!date) return null;
    if (Array.isArray(date) && date.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = date;
        return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1e6));
    }
    const d = new Date(date as any);
    return isNaN(d.getTime()) ? null : d;
}

const getStatusVariant = (status: string) => {
    switch (status) {
        case "PENDING": return "warning";
        case "PROCESSING": return "info";
        case "SHIPPED": return "secondary";
        case "DELIVERED": return "success";
        case "CANCELLED": return "destructive";
        default: return "outline";
    }
};

type HoaDonDetailProps = {
    open: boolean;
    onClose: () => void;
    detail: any;
    loadingDetail: boolean;
    chiTietSanPham: any[];
    exportExcel: () => void;
    exportDocx: () => void;
};

export default function HoaDonDetail(props: HoaDonDetailProps) {
    const { open, onClose, detail, loadingDetail, chiTietSanPham, exportExcel, exportDocx } = props;

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl relative">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                    onClick={onClose}
                >
                    <X className="w-5 h-5" />
                </Button>

                <CardContent className="pt-8 pb-4 px-6 text-sm">
                    {loadingDetail ? (
                        <div className="text-center text-muted-foreground py-12">Đang tải chi tiết...</div>
                    ) : detail ? (
                        <ScrollArea className="h-[85vh] pr-2">
                            <h2 className="text-2xl font-bold text-center mb-4 text-primary">Chi tiết hóa đơn #{detail.id}</h2>
                            <div className="grid grid-cols-2 gap-6 text-base mb-6">
                                <div className="space-y-2">
                                    <div><b>Mã hóa đơn:</b> #{detail.id}</div>
                                    <div><b>Ngày tạo:</b> {parseBackendDate(detail.ngayTao)?.toLocaleString("vi-VN")}</div>
                                    <div>
                                        <b>Trạng thái:</b>{" "}
                                        <Badge variant={getStatusVariant(detail.trangThai)} className="uppercase">
                                            {detail.trangThai}
                                        </Badge>
                                    </div>
                                    <div><b>Phương thức thanh toán:</b> {detail.phuongThucThanhToan}</div>
                                    <div><b>Tạm tính:</b> {detail.tamTinh?.toLocaleString()}₫</div>
                                    <div><b>Giảm giá:</b> {detail.soTienGiam?.toLocaleString()}₫</div>
                                    <div className="text-lg font-semibold text-green-600"><b>Tổng tiền:</b> {detail.tongTien?.toLocaleString()}₫</div>
                                </div>
                                <div className="space-y-2">
                                    <div><b>Khách hàng:</b> {detail.ten}</div>
                                    <div><b>Số điện thoại:</b> {detail.sdt}</div>
                                    <div><b>Địa chỉ giao hàng:</b> {detail.diaChiGiaoHang}</div>
                                    <div><b>User ID:</b> {detail.userId}</div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mb-4">
                                <Button onClick={exportExcel} className="bg-green-500 hover:bg-green-600 text-white">Xuất Excel</Button>
                                <Button onClick={exportDocx} className="bg-indigo-500 hover:bg-indigo-600 text-white">Xuất DOCX</Button>
                            </div>

                            <Separator className="my-4" />
                            <h3 className="text-lg font-semibold text-primary mb-3">Chi tiết sản phẩm</h3>
                            <div className="overflow-auto border rounded-lg">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-2 text-left">STT</th>
                                            <th className="p-2 text-left">Mã SP</th>
                                            <th className="p-2 text-left">Tên SP</th>
                                            <th className="p-2 text-center">SL</th>
                                            <th className="p-2 text-right">Đơn giá</th>
                                            <th className="p-2 text-right">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {chiTietSanPham.map((sp, idx) => (
                                            <tr key={sp.masp ?? idx} className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                                <td className="p-2">{idx + 1}</td>
                                                <td className="p-2">{sp.masp}</td>
                                                <td className="p-2">{sp.tensp}</td>
                                                <td className="p-2 text-center">{sp.soLuong}</td>
                                                <td className="p-2 text-right">{Number(sp.gia).toLocaleString()}₫</td>
                                                <td className="p-2 text-right">{Number(sp.tongTien).toLocaleString()}₫</td>
                                            </tr>
                                        ))}
                                        <tr className="font-semibold bg-muted/50">
                                            <td colSpan={5} className="p-2 text-right">Tạm tính:</td>
                                            <td className="p-2 text-right">{detail.tamTinh?.toLocaleString()}₫</td>
                                        </tr>
                                        <tr className="font-semibol dbg-muted/500">
                                            <td colSpan={5} className="p-2 text-right">Giảm giá:</td>
                                            <td className="p-2 text-right">{detail.soTienGiam?.toLocaleString()}₫</td>
                                        </tr>
                                        <tr className="font-bold text-green-600">
                                            <td colSpan={5} className="p-2 text-right">Tổng cộng:</td>
                                            <td className="p-2 text-right text-green-600">{detail.tongTien?.toLocaleString()}₫</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="text-red-500 text-center py-10">Không tìm thấy hóa đơn</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
