"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { ShoppingBag, Eye, XCircle, CheckCircle, Loader2, Package } from "lucide-react";
import { formatDateFlexible } from "@/app/admin/khuyenmai/formatDateFlexible";
import { EnrichedOrder } from "./types";
import { palette, statusBadge } from "./palette";
import { useRouter } from "next/navigation";
import { anhSanPhamSevice, getAnhByFileName } from "@/services/anhSanPhamService";

interface OrderCardProps {
    order: EnrichedOrder;
    productImages: Record<number, string>;
    handleViewDetail: (order: EnrichedOrder) => void;
    handleCancelOrder: (orderId: number) => void;
    handleConfirmDelivery: (orderId: number) => void;
    handleReorder: (order: EnrichedOrder) => void;
    handleReturnOrder: (orderId: number) => void;
    cancelingId: number | null;
    reorderingId: number | null;
    returningId: number | null;
}

export default function OrderCard({
    order,
    handleViewDetail,
    handleCancelOrder,
    handleConfirmDelivery,
    handleReorder,
    handleReturnOrder,
    cancelingId,
    reorderingId,
    returningId,
}: OrderCardProps) {
    const router = useRouter();
    const [imageUrls, setImageUrls] = useState<Record<number, string>>({});

    const handleProductImageClick = (productId?: number, item?: any) => {
        console.log("Debug - Item Data:", item);
        if (productId) {
            console.log("Navigating to product ID:", productId);
            router.push(`/product/${productId}`);
        } else {
            console.log("Product ID is undefined or null. Item data:", item);
        }
    };

    // Fetch images using anhSanPhamService
    const fetchProductImages = async (pid: number) => {
        try {
            const response = await anhSanPhamSevice.getAnhSanPhamTheoSanPhamId(pid);
            // Check if response is an array and has at least one element
            if (Array.isArray(response) && response.length > 0 && typeof response[0].anhChinh === 'string') {
                const blob = await getAnhByFileName(response[0].anhChinh);
                const url = URL.createObjectURL(blob);
                setImageUrls((prev) => ({ ...prev, [pid]: url }));
            } else {
                console.warn(`No valid AnhChinh for product ID: ${pid}`, response);
            }
        } catch (error) {
            console.error("Lỗi khi tải ảnh cho product ID:", pid, error);
        }
    };

    // Load images when component mounts or order changes
    useEffect(() => {
        const pids = order.chiTietSanPham?.map((item) => item.sanPham?.id).filter((id): id is number => !!id) || [];
        pids.forEach((pid) => fetchProductImages(pid));

        // Cleanup object URLs
        return () => {
            Object.values(imageUrls).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [order]);

    return (
        <Card className={`${palette.panelBg} ${palette.border} rounded-2xl shadow-[0_6px_20px_rgba(0, 0, 0, 0.08)]`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FFE04D] rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h3 className={`font-semibold ${palette.text}`}>{order.maHD}</h3>
                            <p className={`text-xs ${palette.subText}`}>
                                Đặt ngày {formatDateFlexible(order.ngayTao, false)}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={statusBadge(order.trangThai)}>{order.trangThai}</span>
                        <p className="text-lg font-extrabold text-[#E3000B] mt-1">
                            ₫{(order.tongTien || 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                    <div className={`text-xs ${palette.subText} mb-1`}>Tiến độ đơn hàng</div>
                    <div className={`w-full ${palette.track} rounded-full h-3 overflow-hidden`}>
                        <motion.div
                            className="bg-[#FFD400] h-3 rounded-full"
                            initial={{ width: "10%" }}
                            animate={{
                                width:
                                    order.trangThai === "Đã hủy"
                                        ? "0%"
                                        : order.trangThai === "Đã giao" || order.trangThai === "Hoàn tất"
                                            ? "100%"
                                            : order.trangThai === "Đang vận chuyển"
                                                ? "75%"
                                                : order.trangThai === "Đang đóng gói"
                                                    ? "50%"
                                                    : order.trangThai === "Đã xác nhận"
                                                        ? "25%"
                                                        : "10%",
                            }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>
                    <div className={`text-xs ${palette.subText} mt-1`}>
                        {order.trangThai === "Đã hủy"
                            ? "0%"
                            : order.trangThai === "Đã giao" || order.trangThai === "Hoàn tất"
                                ? "100%"
                                : order.trangThai === "Đang vận chuyển"
                                    ? "75%"
                                    : order.trangThai === "Đang đóng gói"
                                        ? "50%"
                                        : order.trangThai === "Đã xác nhận"
                                            ? "25%"
                                            : "10%"}
                    </div>
                </div>

                {/* Items */}
                <div className="mb-4">
                    <p className={`text-sm font-medium ${palette.text} mb-2`}>
                        Sản phẩm ({order.chiTietSanPham?.length || 0})
                    </p>
                    <div className="space-y-2">
                        {order.chiTietSanPham?.map((item, idx) => {
                            const pid = item.sanPham?.id;
                            return (
                                <motion.div
                                    key={idx}
                                    className={`flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 hover:border-yellow-300`}
                                    whileHover={{ scale: 1.01 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {imageUrls[pid as number] ? (
                                        <img
                                            src={imageUrls[pid as number]}
                                            alt={item.sanPham?.tenSanPham || ""}
                                            className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-yellow-300 transition-all duration-200"
                                            onClick={() => handleProductImageClick(pid, item)}
                                        />
                                    ) : (
                                        <Skeleton className="w-12 h-12 rounded-lg" />
                                    )}
                                    <div className="flex-1">
                                        <p className={`font-medium ${palette.text} text-sm`}>
                                            {item.sanPham?.tenSanPham || "Sản phẩm không tồn tại"}
                                        </p>
                                        <p className={`text-xs ${palette.subText}`}>
                                            Số lượng: {item.soLuong || 0}
                                        </p>
                                    </div>
                                    <p className="font-semibold text-[#E3000B]">
                                        ₫{((item.sanPham?.gia || 0) * (item.soLuong || 0)).toLocaleString()}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            size="sm"
                            className="flex items-center gap-2 border border-yellow-300 text-black bg-[#FFD400] hover:bg-[#FFE066] transition-colors duration-200"
                            onClick={() => handleViewDetail(order)}
                        >
                            <Eye className="w-4 h-4" />
                            Xem Chi Tiết
                        </Button>
                    </motion.div>

                    {order.trangThai === "Đang xử lý" && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                size="sm"
                                disabled={cancelingId === order.id}
                                className="flex items-center gap-2 border-yellow-500 text-black bg-red-500 hover:bg-red-600 transition-colors duration-200 disabled:opacity-60"
                                onClick={() => handleCancelOrder(order.id)}
                            >
                                <XCircle className="w-4 h-4" />
                                {cancelingId === order.id ? "Đang hủy..." : "Hủy Đơn"}
                            </Button>
                        </motion.div>
                    )}

                    {order.trangThai === "Đã giao" && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                size="sm"
                                className="flex items-center gap-2 border-green-500 text-white bg-green-500 hover:bg-green-600 transition-colors duration-200"
                                onClick={() => handleConfirmDelivery(order.id)}
                                disabled={cancelingId === order.id}
                            >
                                <CheckCircle className="w-4 h-4" />
                                {cancelingId === order.id ? "Đang xác nhận..." : "Xác nhận đã giao hàng"}
                            </Button>
                        </motion.div>
                    )}

                    {(order.trangThai === "Đã giao" || order.trangThai === "Hoàn tất") && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                size="sm"
                                className="flex items-center gap-2 border-orange-500 text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-200"
                                onClick={() => router.push(`/account/history/return/${order.id}`)}
                            >
                                <Package className="w-4 h-4" />
                                Hoàn Hàng
                            </Button>
                        </motion.div>
                    )}

                    {(order.trangThai === "Hoàn tất" || order.trangThai === "Đã hủy") && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                size="sm"
                                onClick={() => handleReorder(order)}
                                disabled={reorderingId === order.id}
                                className="flex items-center gap-2 border border-yellow-400 text-black bg-white hover:bg-yellow-70 transition-colors duration-200"
                            >
                                {reorderingId === order.id ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Đang thêm...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="w-4 h-4" />
                                        Mua lại
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}