"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useUserStore } from "@/context/authStore.store";
import { useHoaDonByUserId, useChiTietSanPhamHoaDon } from "@/hooks/useHoaDon";
import { useSanPham } from "@/hooks/useSanPham";
import { HoaDonService } from "@/services/hoaDonService";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cartService } from "@/services/cartService";
import { ChiTietSanPham, EnrichedOrder, SanPham } from "./types";
import { palette } from "./palette";
import OrderFilters from "./OrderFilters";
import OrderList from "./OrderList";
import OrderDetailModal from "./OrderDetailModal";
import OrderPagination from "./OrderPagination";
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

export default function OrderHistoryPage() {
    const router = useRouter();
    const { user } = useUserStore();
    const { data: orders, isLoading, error, refetch } = useHoaDonByUserId(user?.id || 0);
    const { data: sanPhams } = useSanPham();

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("");
    const [searchKeyword, setSearchKeyword] = useState<string>("");

    const [ordersWithDetails, setOrdersWithDetails] = useState<EnrichedOrder[]>([]);
    const [productImages, setProductImages] = useState<Record<number, string>>({});

    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage, setItemPerPage] = useState(10);

    const [selectedOrder, setSelectedOrder] = useState<EnrichedOrder | null>(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);

    const [cancelingId, setCancelingId] = useState<number | null>(null);
    const [reorderingId, setReorderingId] = useState<number | null>(null);

    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showConfirmDeliveryDialog, setShowConfirmDeliveryDialog] = useState(false);
    const [dialogOrderId, setDialogOrderId] = useState<number | null>(null);

    const { data: chiTietSanPham } = useChiTietSanPhamHoaDon(selectedOrder?.id || 0);

    useEffect(() => {
        if (orders && sanPhams) {
            const fetchDetails = async () => {
                const enrichedOrders = await Promise.all(
                    orders.map(async (order: any) => {
                        try {
                            const chiTietData = await HoaDonService.getChiTietSanPhamByHoaDonId(order.id);
                            const enrichedChiTiet: ChiTietSanPham[] = chiTietData.map((ct: ChiTietSanPham) => {
                                const productId = typeof ct.spId === "object" ? ct.spId.id : ct.spId;
                                const matched = (sanPhams as SanPham[]).find((sp) => sp.id === productId) || null;
                                return { ...ct, sanPham: matched };
                            });
                            return { ...order, chiTietSanPham: enrichedChiTiet } as EnrichedOrder;
                        } catch (e) {
                            console.error("Error fetching details", e);
                            return { ...order, chiTietSanPham: [] } as EnrichedOrder;
                        }
                    })
                );
                setOrdersWithDetails(enrichedOrders);
            };
            fetchDetails();
        }
    }, [orders, sanPhams]);

    const filteredOrders = useMemo(() => {
        return ordersWithDetails.filter((order) => {
            const matchesStatus = statusFilter === "all" || order.trangThai === statusFilter;

            let matchesDateRange = true;
            if (dateFilter) {
                const orderDate = new Date(order.ngayTao);
                matchesDateRange =
                    !isNaN(orderDate.getTime()) && orderDate.toISOString().slice(0, 10) >= dateFilter;
            }

            const keyword = searchKeyword.toLowerCase().trim();
            const matchesKeyword = keyword
                ? order.maHD?.toLowerCase().includes(keyword) ||
                order.chiTietSanPham?.some((it: ChiTietSanPham) =>
                    it.sanPham?.tenSanPham?.toLowerCase().includes(keyword)
                )
                : true;

            return matchesStatus && matchesDateRange && matchesKeyword;
        });
    }, [ordersWithDetails, statusFilter, dateFilter, searchKeyword]);

    useEffect(() => setCurrentPage(1), [itemPerPage]);

    const statusOptions = [
        { value: "all", label: "Tất cả", count: ordersWithDetails.length },
        {
            value: "Đang xử lý",
            label: "Đang xử lý",
            count: ordersWithDetails.filter((o) => o.trangThai === "Đang xử lý").length,
        },
        {
            value: "Đã xác nhận",
            label: "Đã xác nhận",
            count: ordersWithDetails.filter((o) => o.trangThai === "Đã xác nhận").length,
        },
        {
            value: "Đang đóng gói",
            label: "Đang đóng gói",
            count: ordersWithDetails.filter((o) => o.trangThai === "Đang đóng gói").length,
        },
        {
            value: "Đang vận chuyển",
            label: "Đang vận chuyển",
            count: ordersWithDetails.filter((o) => o.trangThai === "Đang vận chuyển").length,
        },
        {
            value: "Đã giao",
            label: "Đã giao",
            count: ordersWithDetails.filter((o) => o.trangThai === "Đã giao").length,
        },
        {
            value: "Hoàn tất",
            label: "Hoàn tất",
            count: ordersWithDetails.filter((o) => o.trangThai === "Hoàn tất").length,
        },
        {
            value: "Đã hủy",
            label: "Đã hủy",
            count: ordersWithDetails.filter((o) => o.trangThai === "Đã hủy").length,
        },
    ];

    const handleCancelOrder = async (orderId: number) => {
        setDialogOrderId(orderId);
        setShowCancelDialog(true);
    };

    const confirmCancelOrder = async () => {
        if (dialogOrderId === null) return;

        try {
            setCancelingId(dialogOrderId);
            await HoaDonService.updateTrangThai(dialogOrderId, "Đã hủy");
            if (selectedOrder?.id === dialogOrderId) setShowOrderDetail(false);
            await refetch();
        } catch (e) {
            console.error("Error canceling order", e);
        } finally {
            setCancelingId(null);
            setShowCancelDialog(false);
            setDialogOrderId(null);
        }
    };

    const handleConfirmDelivery = async (orderId: number) => {
        setDialogOrderId(orderId);
        setShowConfirmDeliveryDialog(true);
    };

    const confirmDelivery = async () => {
        if (dialogOrderId === null) return;

        try {
            setCancelingId(dialogOrderId);
            await HoaDonService.updateTrangThai(dialogOrderId, "Hoàn tất");
            if (selectedOrder?.id === dialogOrderId) setShowOrderDetail(false);
            await refetch();
        } catch (e) {
            console.error("Error confirming delivery", e);
        } finally {
            setCancelingId(null);
            setShowConfirmDeliveryDialog(false);
            setDialogOrderId(null);
        }
    };

    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const handleReorder = async (order: EnrichedOrder) => {
        try {
            setReorderingId(order.id);
            const items = order.chiTietSanPham || [];
            if (items.length === 0) {
                setReorderingId(null);
                return;
            }

            await Promise.all(
                items.map((it: ChiTietSanPham) => {
                    const productId = typeof it.spId === "object" ? it.spId.id : it.spId;
                    const quantity = it.soLuong || 1;
                    return cartService.addToCart(productId, quantity);
                })
            );

            await sleep(3000);
            router.push("/cart");
        } catch (e) {
            console.error(e);
        } finally {
            setReorderingId(null);
        }
    };

    const handleViewDetail = (order: EnrichedOrder) => {
        setSelectedOrder(order);
        setShowOrderDetail(true);
    };

    const totalPages = Math.ceil(filteredOrders.length / itemPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemPerPage,
        currentPage * itemPerPage
    );

    if (isLoading) {
        return (
            <div className={`min-h-screen ${palette.pageBg} flex items-center justify-center`}>
                <div className="text-center space-y-4">
                    <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                    <div className={`text-sm ${palette.subText}`}>Đang tải lịch sử đơn hàng...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen ${palette.pageBg} flex items-center justify-center`}>
                <div className="text-center">
                    <p className="text-red-600">Lỗi: Không thể tải lịch sử đơn hàng</p>
                    <Button
                        onClick={() => refetch()}
                        className="mt-4 bg-[#FFD400] hover:bg-[#FFE066] text-black transition-colors duration-200"
                    >
                        Thử lại
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`text-3xl font-bold ${palette.text} mb-6 drop-shadow-[0_2px_0_rgba(0,0,0,0.08)]`}
                >
                    Lịch Sử Đơn Hàng
                </motion.h1>

                <OrderFilters
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    searchKeyword={searchKeyword}
                    setSearchKeyword={setSearchKeyword}
                    statusOptions={statusOptions}
                />

                <OrderList
                    orders={paginatedOrders}
                    productImages={productImages}
                    handleViewDetail={handleViewDetail}
                    handleCancelOrder={handleCancelOrder}
                    handleConfirmDelivery={handleConfirmDelivery}
                    handleReorder={handleReorder}
                    cancelingId={cancelingId}
                    reorderingId={reorderingId}
                    handleReturnOrder={() => { }} // TODO: Implement return order logic if needed
                    returningId={null} // TODO: Set returningId state if needed
                />

                <OrderDetailModal
                    open={showOrderDetail}
                    onOpenChange={setShowOrderDetail}
                    selectedOrder={selectedOrder}
                    handleCancelOrder={handleCancelOrder}
                    handleConfirmDelivery={handleConfirmDelivery}
                    handleReorder={handleReorder}
                    cancelingId={cancelingId}
                    reorderingId={reorderingId}
                />

                {totalPages > 1 && (
                    <OrderPagination
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalPages={totalPages}
                        itemPerPage={itemPerPage}
                        setItemPerPage={setItemPerPage}
                        totalItems={filteredOrders.length}
                        displayedItems={paginatedOrders.length}
                    />
                )}

                <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận hủy đơn hàng</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bạn chắc chắn muốn hủy đơn này? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmCancelOrder}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Xác nhận
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={showConfirmDeliveryDialog} onOpenChange={setShowConfirmDeliveryDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận giao hàng</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bạn đã nhận được hàng và muốn xác nhận? Hành động này sẽ hoàn tất đơn hàng.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelivery}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                Xác nhận
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}