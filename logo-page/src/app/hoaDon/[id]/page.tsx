"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    HoaDonDTO,
    HoaDonChiTietDTO,
    TrangThaiHoaDon,
} from "@/components/types/hoaDon-types";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, AlertCircle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useQueries } from "@tanstack/react-query";
import { useHoaDonById, useChiTietSanPhamHoaDon } from "@/hooks/useHoaDon";
import Head from "next/head";
import { sanPhamService } from "@/services/sanPhamService";

// Interface for product data
interface Product {
    id: number;
    tenSanPham: string;
}

// Badge classes for order statuses
const getBadgeClass = (status: TrangThaiHoaDon): string => {
    const badgeClasses: Record<TrangThaiHoaDon, string> = {
        [TrangThaiHoaDon.PENDING]: "bg-yellow-400 text-gray-900",
        [TrangThaiHoaDon.PROCESSING]: "bg-blue-400 text-white",
        [TrangThaiHoaDon.PACKING]: "bg-indigo-400 text-white",
        [TrangThaiHoaDon.SHIPPED]: "bg-purple-400 text-white",
        [TrangThaiHoaDon.DELIVERED]: "bg-green-400 text-white",
        [TrangThaiHoaDon.COMPLETED]: "bg-emerald-400 text-white",
        [TrangThaiHoaDon.CANCELLED]: "bg-gray-400 text-white",
        [TrangThaiHoaDon.FAILED]: "bg-red-400 text-white",
    };
    return badgeClasses[status] || "bg-gray-300 text-gray-800";
};

const HoaDonDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const orderId = id && !isNaN(parseInt(id)) ? parseInt(id) : null;

    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [isNotFoundDialogOpen, setIsNotFoundDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Validate orderId
    useEffect(() => {
        if (!orderId || orderId <= 0) {
            setErrorMessage("ID hóa đơn không hợp lệ. Vui lòng kiểm tra lại.");
            setIsErrorDialogOpen(true);
        }
    }, [orderId]);

    // Fetch order and order details
    const {
        data: hoaDon,
        isLoading: isHoaDonLoading,
        error: hoaDonError,
    } = useHoaDonById(orderId ?? 0);
    const {
        data: chiTietItems,
        isLoading: isChiTietLoading,
        error: chiTietError,
    } = useChiTietSanPhamHoaDon(orderId ?? 0);

    // Log chiTietItems for debugging
    useEffect(() => {
        console.log("chiTietItems:", chiTietItems);
        chiTietItems?.forEach((item, index) =>
            console.log(`Item ${index}: spId =`, item.spId)
        );
    }, [chiTietItems]);

    // Fetch product names
    const productQueries = useQueries({
        queries:
            chiTietItems?.map((item, index) => {
                const productId =
                    typeof item.spId === "object" && item.spId !== null
                        ? (item.spId as any).id
                        : item.spId;
                console.log(`Query ${index}: productId =`, productId);
                return {
                    queryKey: ["sanPhams", productId],
                    queryFn: async (): Promise<Product> => {
                        try {
                            const data = await sanPhamService.getSanPhamID(productId);
                            console.log(`Product data for ID ${productId}:`, data);
                            return {
                                id: productId,
                                tenSanPham:
                                    data?.tenSanPham
                            };
                        } catch (error) {
                            console.error(`Error fetching product ID ${productId}:`, error);
                            return { id: productId, tenSanPham: "Lỗi tải tên" };
                        }
                    },
                    enabled: !!chiTietItems && !!productId && orderId !== null,
                };
            }) ?? [],
    });

    // Log productQueries states
    useEffect(() => {
        productQueries.forEach((query, index) => {
            console.log(`Product Query ${index}:`, {
                isLoading: query.isLoading,
                error: query.error,
                data: query.data,
            });
        });
    }, [productQueries]);

    // Memoize product names
    const productNames = useMemo(() => {
        return (
            chiTietItems?.map((_, index) => {
                const query = productQueries[index];
                if (query?.isLoading) return "Đang tải...";
                if (query?.error) return "Lỗi tải tên";
                return query?.data?.tenSanPham ?? "Tên không xác định";
            }) ?? []
        );
    }, [chiTietItems, productQueries]);

    // Log product names
    useEffect(() => {
        console.log("Product Names:", productNames);
    }, [productNames]);

    // Set document title
    useEffect(() => {
        document.title = `Chi tiết hóa đơn LEGO #${hoaDon?.maHD || ""} | LEGO Việt Nam`;
    }, [hoaDon]);

    // Handle errors and not found cases
    useEffect(() => {
        if (hoaDonError || chiTietError) {
            setErrorMessage(
                (hoaDonError ?? chiTietError)?.message ?? "Lỗi không xác định"
            );
            setIsErrorDialogOpen(true);
        } else if (!isHoaDonLoading && !hoaDon && orderId !== null) {
            setIsNotFoundDialogOpen(true);
        }
    }, [hoaDonError, chiTietError, hoaDon, isHoaDonLoading, orderId]);

    // Format currency
    const formatCurrency = (amount: number = 0): string =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);

    // Format date
    const formatDate = (date: string | null): string => {
        if (!date) return "Chưa xác định";
        try {
            return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: vi });
        } catch {
            return "Ngày không hợp lệ";
        }
    };

    // Define order steps
    const orderSteps = [
        { label: "Đặt hàng", status: TrangThaiHoaDon.PENDING },
        { label: "Xác nhận đơn", status: TrangThaiHoaDon.PROCESSING },
        { label: "Đang đóng gói", status: TrangThaiHoaDon.PACKING },
        { label: "Đang vận chuyển", status: TrangThaiHoaDon.SHIPPED },
        { label: "Đã giao", status: TrangThaiHoaDon.DELIVERED },
        { label: "Hoàn tất", status: TrangThaiHoaDon.COMPLETED },
    ];

    const currentStepIndex = orderSteps.findIndex(
        (step) => step.status === hoaDon?.trangThai
    );

    // Structured data for SEO
    const structuredData = hoaDon
        ? {
            "@context": "https://schema.org",
            "@type": "Order",
            orderNumber: hoaDon.maHD,
            orderStatus: `https://schema.org/Order${hoaDon.trangThai}`,
            orderDate: hoaDon.ngayTao,
            merchant: { "@type": "Organization", name: "LEGO Việt Nam" },
            acceptedOffer:
                chiTietItems?.map((item, index) => ({
                    "@type": "Offer",
                    itemOffered: {
                        "@type": "Product",
                        name: productNames[index] ?? "Sản phẩm không xác định",
                    },
                    price: item.gia,
                    priceCurrency: "VND",
                    eligibleQuantity: { "@type": "QuantitativeValue", value: item.soLuong },
                })) ?? [],
        }
        : {};

    // Loading state
    if (isHoaDonLoading || isChiTietLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-yellow-50">
                <Loader2
                    className="h-10 w-10 animate-spin text-yellow-600"
                    aria-label="Đang tải dữ liệu hóa đơn"
                />
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Chi tiết hóa đơn LEGO #{hoaDon?.maHD || ""} | LEGO Việt Nam</title>
                <meta
                    name="description"
                    content={`Xem chi tiết hóa đơn #${hoaDon?.maHD || ""} tại LEGO Việt Nam. Theo dõi trạng thái đơn hàng, thông tin sản phẩm LEGO, và tổng tiền thanh toán.`}
                />
                <meta
                    name="keywords"
                    content="LEGO, hóa đơn LEGO, chi tiết đơn hàng, LEGO Việt Nam, mua sắm LEGO"
                />
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="author" content="LEGO Việt Nam" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            </Head>
            <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-yellow-50 min-h-screen">
                {/* Error Dialog */}
                <AlertDialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
                    <AlertDialogContent className="bg-white rounded-2xl shadow-xl max-w-md border border-yellow-200">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-3 text-red-600 text-xl font-bold">
                                <AlertCircle className="h-6 w-6" aria-hidden="true" />
                                Lỗi
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-700">
                                {errorMessage}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-3">
                            <Button
                                variant="outline"
                                className="border-yellow-300 text-gray-700 hover:bg-yellow-100 transition-colors duration-200 rounded-lg"
                                onClick={() => setIsErrorDialogOpen(false)}
                                aria-label="Đóng thông báo lỗi"
                            >
                                Đóng
                            </Button>
                            <Button
                                className="bg-yellow-500 text-gray-900 hover:bg-yellow-600 transition-colors duration-200 rounded-lg"
                                onClick={() => router.push("/hoaDon")}
                                aria-label="Quay lại danh sách hóa đơn"
                            >
                                Quay lại
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Not Found Dialog */}
                <AlertDialog open={isNotFoundDialogOpen} onOpenChange={setIsNotFoundDialogOpen}>
                    <AlertDialogContent className="bg-white rounded-2xl shadow-xl max-w-md border border-yellow-200">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold text-gray-800">
                                Không tìm thấy hóa đơn
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-700">
                                Không tìm thấy hóa đơn với ID: {orderId}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <Button
                                className="bg-yellow-500 text-gray-900 hover:bg-yellow-600 transition-colors duration-200 rounded-lg"
                                onClick={() => router.push("/hoaDon")}
                                aria-label="Quay lại danh sách hóa đơn"
                            >
                                Quay lại
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {hoaDon && (
                    <div className="space-y-10">
                        {/* Order Progress */}
                        <Card className="shadow-md rounded-2xl overflow-hidden bg-white border border-yellow-200">
                            <CardHeader className="bg-yellow-100 p-6">
                                <CardTitle className="text-3xl font-bold text-gray-800">
                                    Hóa đơn LEGO #{hoaDon.maHD}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold mb-6 text-gray-800">Tiến trình đơn hàng</h3>
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        {orderSteps.map((step, index) => {
                                            const isActive = index <= currentStepIndex;
                                            return (
                                                <div key={step.status} className="flex-1 text-center relative">
                                                    <div className="flex flex-col items-center">
                                                        <div
                                                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${isActive
                                                                ? "bg-yellow-400 text-gray-900 shadow-md"
                                                                : "bg-gray-200 text-gray-600"
                                                                }`}
                                                            aria-label={`Bước ${step.label} ${isActive ? "đã hoàn thành" : "chưa hoàn thành"}`}
                                                        >
                                                            {index + 1}
                                                        </div>
                                                        <span
                                                            className={`text-sm mt-3 font-medium ${isActive ? "text-gray-800" : "text-gray-500"
                                                                }`}
                                                        >
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                    {index < orderSteps.length - 1 && (
                                                        <div
                                                            className={`absolute top-6 left-1/2 w-full h-1 sm:h-1 sm:w-1/2 sm:left-full transform sm:-translate-x-1/2 ${index < currentStepIndex ? "bg-yellow-400" : "bg-gray-200"
                                                                }`}
                                                        ></div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Order and Customer Info */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-gray-800">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold border-b border-yellow-200 pb-2">
                                            Thông tin hóa đơn
                                        </h3>
                                        <p>
                                            <strong className="font-medium">Mã hóa đơn:</strong> {hoaDon.maHD}
                                        </p>
                                        <p>
                                            <strong className="font-medium">Trạng thái:</strong>{" "}
                                            <Badge
                                                className={`${getBadgeClass(hoaDon.trangThai)} hover:opacity-90 transition-opacity duration-200`}
                                                aria-label={`Trạng thái hóa đơn: ${hoaDon.trangThai}`}
                                            >
                                                {hoaDon.trangThai}
                                            </Badge>
                                        </p>
                                        <p>
                                            <strong className="font-medium">Ngày tạo:</strong>{" "}
                                            {formatDate(hoaDon.ngayTao)}
                                        </p>
                                        <p>
                                            <strong className="font-medium">Phương thức thanh toán:</strong>{" "}
                                            {hoaDon.phuongThucThanhToan ?? "Chưa xác định"}
                                        </p>
                                        <p>
                                            <strong className="font-medium">Phí ship:</strong>{" "}
                                            {hoaDon.phiShip ? formatCurrency(hoaDon.phiShip) : "Miễn phí"}
                                        </p>
                                        {hoaDon.maVanChuyen && (
                                            <p>
                                                <strong className="font-medium">Mã vận chuyển:</strong>{" "}
                                                {hoaDon.maVanChuyen}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold border-b border-yellow-200 pb-2">
                                            Thông tin khách hàng
                                        </h3>
                                        <p>
                                            <strong className="font-medium">Khách:</strong> {hoaDon.ten ?? "Chưa xác định"}
                                        </p>
                                        <p>
                                            <strong className="font-medium">SĐT:</strong> {hoaDon.sdt ?? "Chưa xác định"}
                                        </p>
                                        <p>
                                            <strong className="font-medium">Địa chỉ:</strong>{" "}
                                            {hoaDon.diaChiGiaoHang ?? "Chưa xác định"}
                                        </p>
                                        <p>
                                            <strong className="font-medium">Nhân viên:</strong>{" "}
                                            {hoaDon.nvName ?? "Chưa phân công"}
                                        </p>
                                        {hoaDon.phieuGiamGia && (
                                            <p>
                                                <strong className="font-medium">Phiếu giảm:</strong>{" "}
                                                {hoaDon.phieuGiamGia.maPhieu}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Product List */}
                        <Card className="shadow-md rounded-2xl overflow-hidden bg-white border border-yellow-200">
                            <CardHeader className="bg-yellow-100 p-6">
                                <CardTitle className="text-xl font-semibold text-gray-800">
                                    Sản phẩm LEGO
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {chiTietItems && chiTietItems.length > 0 ? (
                                    <Table className="text-gray-800">
                                        <TableHeader className="bg-yellow-50">
                                            <TableRow>
                                                <TableHead className="w-[50%] font-semibold text-gray-800">
                                                    Tên sản phẩm LEGO
                                                </TableHead>
                                                <TableHead className="font-semibold text-gray-800">Số lượng</TableHead>
                                                <TableHead className="font-semibold text-gray-800">Đơn giá</TableHead>
                                                <TableHead className="font-semibold text-gray-800">Thành tiền</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {chiTietItems.map((item, index) => (
                                                <TableRow
                                                    key={item.id}
                                                    className="hover:bg-yellow-50 transition-colors duration-200"
                                                >
                                                    <TableCell className="font-medium">
                                                        {productNames[index]}
                                                    </TableCell>
                                                    <TableCell>{item.soLuong}</TableCell>
                                                    <TableCell>{formatCurrency(item.gia)}</TableCell>
                                                    <TableCell>{formatCurrency(item.tongTien)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">
                                        Không có sản phẩm LEGO trong hóa đơn này.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Total Amount */}
                        <Card className="shadow-md rounded-2xl overflow-hidden bg-white border border-yellow-200">
                            <CardHeader className="bg-yellow-100 p-6">
                                <CardTitle className="text-xl font-semibold text-gray-800">
                                    Tổng tiền
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 text-gray-800 space-y-4">
                                <div className="flex justify-between text-base">
                                    <span className="font-medium">Tạm tính:</span>
                                    <span>{formatCurrency(hoaDon.tamTinh)}</span>
                                </div>
                                <div className="flex justify-between text-base">
                                    <span className="font-medium">Giảm giá:</span>
                                    <span>{formatCurrency(hoaDon.soTienGiam)}</span>
                                </div>
                                <div className="flex justify-between text-base">
                                    <span className="font-medium">Phí vận chuyển:</span>
                                    <span>{hoaDon.phiShip ? formatCurrency(hoaDon.phiShip) : "Miễn phí"}</span>
                                </div>
                                <div className="flex justify-between font-bold border-t border-yellow-200 pt-4 text-lg">
                                    <span>Tổng cộng:</span>
                                    <span className="text-yellow-600">{formatCurrency(hoaDon.tongTien)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Navigation Buttons */}
                        <div className="mt-8 flex justify-end gap-4">
                            <Button
                                variant="outline"
                                className="border-yellow-300 text-gray-700 hover:bg-yellow-100 transition-colors duration-200 rounded-lg px-6 py-2"
                                onClick={() => router.push("/hoaDon")}
                                aria-label="Quay lại danh sách hóa đơn"
                            >
                                Quay lại
                            </Button>
                            {hoaDon.qrCodeUrl && (
                                <Button
                                    className="bg-yellow-500 text-gray-900 hover:bg-yellow-600 transition-colors duration-200 rounded-lg px-6 py-2"
                                    aria-label="Xem QR Code hóa đơn"
                                >
                                    <a href={hoaDon.qrCodeUrl} target="_blank" rel="noopener noreferrer">
                                        Xem QR Code
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default HoaDonDetail;