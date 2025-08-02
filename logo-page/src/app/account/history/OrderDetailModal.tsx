"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, XCircle, Clock, Phone, Loader2, ShoppingBag } from "lucide-react";
import { formatDateFlexible } from "@/app/admin/khuyenmai/formatDateFlexible";
import { EnrichedOrder } from "./types";
import { statusBadge } from "./palette";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { anhSanPhamSevice, getAnhByFileName } from "@/services/anhSanPhamService";

interface OrderDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedOrder: EnrichedOrder | null;
    handleCancelOrder: (orderId: number) => void;
    handleConfirmDelivery: (orderId: number) => void;
    handleReorder: (order: EnrichedOrder) => void;
    cancelingId: number | null;
    reorderingId: number | null;
}

export default function OrderDetailModal({
    open,
    onOpenChange,
    selectedOrder,
    handleCancelOrder,
    handleConfirmDelivery,
    handleReorder,
    cancelingId,
    reorderingId,
}: OrderDetailModalProps) {
    const router = useRouter();
    const [imageUrls, setImageUrls] = useState<Record<number, string>>({});

    const handleProductImageClick = (productId?: number, item?: any) => {
        console.log("Debug - Item:", item);
        const pid = item?.sanPham?.id;
        console.log("Product ID for navigation:", pid, "Full Item:", item);
        if (pid) {
            console.log("Attempting navigation to /product/", pid);
            try {
                router.push(`/product/${pid}`);
            } catch (e) {
                console.error("Navigation error:", e);
                toast.error("Không thể chuyển đến trang chi tiết sản phẩm. Vui lòng thử lại!");
            }
        } else {
            console.log("Product ID is undefined or null. Item data:", item);
            toast.info("Không tìm thấy ID sản phẩm để xem chi tiết.");
        }
    };

    const fetchProductImages = async (pid: number) => {
        try {
            const response = await anhSanPhamSevice.getAnhSanPhamTheoSanPhamId(pid);
            if (Array.isArray(response) && response.length > 0 && typeof response[0].anhChinh === 'string') {
                const blob = await getAnhByFileName(response[0].anhChinh);
                const url = URL.createObjectURL(blob);
                setImageUrls((prev) => ({ ...prev, [pid]: url }));
            } else {
                console.warn("No valid anhChinh for product ID:", pid, "Response:", response);
                setImageUrls((prev) => ({ ...prev, [pid]: "/placeholder-image.jpg" })); // Fallback image
            }
        } catch (error) {
            console.error("Error fetching image for product ID:", pid, error);
            setImageUrls((prev) => ({ ...prev, [pid]: "/placeholder-image.jpg" })); // Fallback on error
        }
    };

    useEffect(() => {
        if (selectedOrder) {
            const pids = selectedOrder.chiTietSanPham
                ?.map((item) => item.sanPham?.id)
                .filter((id): id is number => !!id) || [];
            pids.forEach((pid) => fetchProductImages(pid));
            return () => {
                Object.values(imageUrls).forEach((url) => URL.revokeObjectURL(url));
            };
        }
    }, [selectedOrder]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-yellow-200 rounded-2xl shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-yellow-600">Chi Tiết Đơn Hàng</DialogTitle>
                </DialogHeader>

                {selectedOrder && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                                        <Package className="w-4 h-4 text-yellow-800" />
                                    </div>
                                    <h3 className="font-semibold text-yellow-800">Thông Tin Đơn Hàng</h3>
                                </div>
                                <div className="space-y-2 text-sm text-gray-700">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Mã đơn hàng:</span>
                                        <span className="font-medium">{selectedOrder.maHD}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Ngày đặt:</span>
                                        <span className="font-medium">{formatDateFlexible(selectedOrder.ngayTao, false)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Trạng thái:</span>
                                        <span className={statusBadge(selectedOrder.trangThai)}>{selectedOrder.trangThai}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tổng tiền:</span>
                                        <span className="font-extrabold text-red-500 text-lg">
                                            ₫{(selectedOrder.tongTien || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <h3 className="font-semibold text-orange-600">Lịch Sử Đơn Hàng</h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { status: "Đặt hàng thành công", date: formatDateFlexible(selectedOrder.ngayTao, false), icon: CheckCircle },
                                        ...(selectedOrder.trangThai === "Đang xử lý" || selectedOrder.trangThai === "Đã xác nhận" || selectedOrder.trangThai === "Đang đóng gói" || selectedOrder.trangThai === "Đang vận chuyển" || selectedOrder.trangThai === "Đã giao" || selectedOrder.trangThai === "Hoàn tất"
                                            ? [{ status: "Đang xử lý", date: "đơn hàng đang được xử lý", icon: Clock }]
                                            : []),
                                        ...(selectedOrder.trangThai === "Đã xác nhận"
                                            ? [{ status: "Xác nhận đơn hàng", date: "Đã xác nhận đơn", icon: CheckCircle }]
                                            : []),
                                        ...(selectedOrder.trangThai === "Đang đóng gói" || selectedOrder.trangThai === "Đang vận chuyển" || selectedOrder.trangThai === "Đã giao" || selectedOrder.trangThai === "Hoàn tất"
                                            ? [{ status: "Đang đóng gói", date: "Đang chuẩn bị hàng", icon: Package }]
                                            : []),
                                        ...(selectedOrder.trangThai === "Đang vận chuyển" || selectedOrder.trangThai === "Đã giao" || selectedOrder.trangThai === "Hoàn tất"
                                            ? [{ status: "Đang vận chuyển", date: "Đang giao hàng", icon: Truck }]
                                            : []),
                                        ...(selectedOrder.trangThai === "Đã giao" || selectedOrder.trangThai === "Hoàn tất"
                                            ? [{ status: "Giao hàng thành công", date: "Đã giao thành công", icon: CheckCircle }]
                                            : []),
                                        ...(selectedOrder.trangThai === "Đã hủy"
                                            ? [{ status: "Đã hủy", date: "Đơn hàng đã bị hủy", icon: XCircle }]
                                            : []),
                                    ].map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.25, delay: idx * 0.08 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-4 h-4 bg-green-300 rounded-full flex items-center justify-center">
                                                <item.icon className="w-3 h-3 text-green-700" />
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-700">{item.status}</p>
                                                <p className="text-gray-500">{item.date}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                                    <Truck className="w-4 h-4 text-green-700" />
                                </div>
                                <h3 className="font-semibold text-green-700">Thông Tin Giao Hàng</h3>
                            </div>
                            <div className="space-y-2 text-sm text-gray-700">
                                <div>
                                    <span className="text-gray-500">Địa chỉ:</span>
                                    <p className="font-medium">{selectedOrder.diaChiGiaoHang || "Chưa có địa chỉ"}</p>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Phương thức:</span>
                                    <span className="font-medium">
                                        {selectedOrder.loaiVanChuyen === 1 || selectedOrder.isFast === 1 ? "Giao hàng nhanh" : "Giao hàng thường"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Phí giao hàng:</span>
                                    <span className="font-medium">₫{(selectedOrder.phiShip || 0).toLocaleString()}</span>
                                </div>
                                {selectedOrder.tenNguoiNhan && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Người nhận:</span>
                                        <span className="font-medium">{selectedOrder.tenNguoiNhan}</span>
                                    </div>
                                )}
                                {selectedOrder.sdt && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Số điện thoại:</span>
                                        <span className="font-medium">{selectedOrder.sdt}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center">
                                    <Package className="w-4 h-4 text-purple-700" />
                                </div>
                                <h3 className="font-semibold text-purple-700">
                                    Sản Phẩm ({selectedOrder.chiTietSanPham?.length || 0})
                                </h3>
                            </div>
                            {selectedOrder.chiTietSanPham && selectedOrder.chiTietSanPham.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedOrder.chiTietSanPham.map((item, index) => {
                                        const pid = item.sanPham?.id;
                                        return (
                                            <motion.div
                                                key={index}
                                                className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200"
                                                whileHover={{ scale: 1.01 }}
                                                transition={{ duration: 0.15 }}
                                            >
                                                {imageUrls[pid as number] ? (
                                                    <img
                                                        src={imageUrls[pid as number]}
                                                        alt={item.sanPham?.tenSanPham || ""}
                                                        className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-yellow-300 transition-all duration-200"
                                                        onClick={() => handleProductImageClick(pid, item)}
                                                    />
                                                ) : (
                                                    <Skeleton className="w-16 h-16 rounded-lg" />
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-700">
                                                        {item.sanPham?.tenSanPham || "Sản phẩm không tồn tại"}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">Mã SP: {item.sanPham?.maSanPham || "N/A"}</p>
                                                    <p className="text-sm text-gray-500">Số lượng: {item.soLuong || 0}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Đơn giá: ₫{(item.gia || item.sanPham?.gia || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-red-500">
                                                        ₫{((item.gia || item.sanPham?.gia || 0) * (item.soLuong || 0)).toLocaleString()}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">Không có sản phẩm nào</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                                    <Package className="w-4 h-4 text-yellow-800" />
                                </div>
                                <h3 className="font-semibold text-yellow-800">Thông Tin Thanh Toán</h3>
                            </div>
                            <div className="space-y-2 text-sm text-gray-700">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tạm tính:</span>
                                    <span className="font-medium">₫{(selectedOrder.tamTinh || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Phí vận chuyển:</span>
                                    <span className="font-medium">₫{(selectedOrder.phiShip || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Giảm giá:</span>
                                    <span className="font-medium text-green-600">
                                        -₫{(selectedOrder.soTienGiam || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="border-t border-yellow-200 pt-2 flex justify-between">
                                    <span className="font-bold">Tổng cộng:</span>
                                    <span className="font-extrabold text-red-500 text-lg">
                                        ₫{(selectedOrder.tongTien || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Phương thức:</span>
                                    <span className="font-medium">{selectedOrder.phuongThucThanhToan || "COD"}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 justify-center mt-4">
                                <Button className="bg-yellow-300 hover:bg-yellow-400 text-yellow-800 px-6 transition-colors duration-200">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Liên Hệ Hỗ Trợ
                                </Button>

                                {selectedOrder.trangThai === "Đang xử lý" && (
                                    <Button
                                        variant="outline"
                                        className="border-red-400 text-white bg-red-400 hover:bg-red-500 transition-colors duration-200"
                                        disabled={cancelingId === selectedOrder.id}
                                        onClick={() => handleCancelOrder(selectedOrder.id)}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        {cancelingId === selectedOrder.id ? "Đang hủy..." : "Hủy Đơn"}
                                    </Button>
                                )}

                                {selectedOrder.trangThai === "Đã giao" && (
                                    <Button
                                        variant="outline"
                                        className="border-green-400 text-white bg-green-400 hover:bg-green-500 transition-colors duration-200"
                                        disabled={cancelingId === selectedOrder.id}
                                        onClick={() => handleConfirmDelivery(selectedOrder.id)}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {cancelingId === selectedOrder.id ? "Đang xác nhận..." : "Xác nhận đã giao hàng"}
                                    </Button>
                                )}

                                {(selectedOrder.trangThai === "Hoàn tất" || selectedOrder.trangThai === "Đã hủy") && (
                                    <Button
                                        variant="outline"
                                        className="border-yellow-400 text-yellow-800 bg-white hover:bg-yellow-50 transition-colors duration-200"
                                        disabled={reorderingId === selectedOrder.id}
                                        onClick={() => handleReorder(selectedOrder)}
                                    >
                                        {reorderingId === selectedOrder.id ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Đang thêm...
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingBag className="w-4 h-4 mr-2" />
                                                Mua lại
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </DialogContent>
        </Dialog>
    );
}