"use client";

import { useEffect, useState } from "react";
import { StatusCardList } from "./StatusCardList";
import { OrderFilter } from "./OrderFilter";
import { OrderTable } from "./OrderTable";
import { Button } from "@/components/ui/button";
import { HoaDonService } from "@/services/hoaDonService";
import { HoaDonDTO, TrangThaiHoaDon } from "@/components/types/hoaDon-types";

const STATUS = [
    { value: TrangThaiHoaDon.PENDING, label: "Đang xử lý", border: "border-blue-400" },
    { value: TrangThaiHoaDon.PROCESSING, label: "Đang chuẩn bị", border: "border-purple-400" },
    { value: TrangThaiHoaDon.SHIPPED, label: "Đang giao", border: "border-yellow-400" },
    { value: TrangThaiHoaDon.DELIVERED, label: "Đã giao", border: "border-green-400" },
    { value: TrangThaiHoaDon.CANCELLED, label: "Đã hủy", border: "border-red-400" },
];

// Hàm map trạng thái từ backend về enum FE
function mapTrangThai(trangThai: string): TrangThaiHoaDon | string {
    switch (trangThai?.toUpperCase()) {
        case "PENDING": return TrangThaiHoaDon.PENDING;
        case "PROCESSING": return TrangThaiHoaDon.PROCESSING;
        case "SHIPPED": return TrangThaiHoaDon.SHIPPED;
        case "DELIVERED": return TrangThaiHoaDon.DELIVERED;
        case "CANCELLED": return TrangThaiHoaDon.CANCELLED;
        default: return trangThai;
    }
}

export default function TrangThaiHoaDonPage() {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPayment, setFilterPayment] = useState("all");
    const [data, setData] = useState<HoaDonDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        HoaDonService.getPagedHoaDons(0, 100)
            .then((res) => {
                console.log("Dữ liệu hóa đơn:", res.content);
                setData(res.content);
            })
            .finally(() => setLoading(false));
    }, []);

    const statusCounts = STATUS.map((st) => ({
        ...st,
        count: data.filter((o) => mapTrangThai(String(o.trangThai)) === st.value).length,
    }));

    // Lấy danh sách phương thức thanh toán duy nhất từ data
    const paymentMethods = Array.from(
        new Set(data.map((o) => o.phuongThucThanhToan).filter(Boolean))
    );

    const filteredData = data.filter(
        (o) =>
            (filterStatus === "all" || mapTrangThai(String(o.trangThai)) === filterStatus) &&
            (filterPayment === "all" || o.phuongThucThanhToan === filterPayment) &&
            (o.ten?.toLowerCase().includes(search.toLowerCase()) ||
                o.diaChiGiaoHang?.toLowerCase().includes(search.toLowerCase()))
    );

    const handleCardClick = (status: string) => {
        setFilterStatus((prev) => (prev === status ? "all" : status));
    };

    // Hàm cập nhật trạng thái hóa đơn
    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            setLoading(true);
            await HoaDonService.updateTrangThai(id, newStatus);

            // Sửa lại cách cập nhật dữ liệu để phù hợp với kiểu HoaDonDTO
            setData((prev) =>
                prev.map((o) => {
                    if (o.id === id) {
                        // Tạo bản sao của đối tượng hiện tại và chỉ cập nhật trường trangThai
                        return { ...o, trangThai: newStatus };
                    }
                    return o;
                })
            );
        } catch (error) {
            alert("Cập nhật trạng thái thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#181e29] py-8 px-2 md:px-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-center text-white mb-10 tracking-tight drop-shadow">
                Quản lý trạng thái đơn hàng SEO
            </h1>
            <StatusCardList statusCounts={statusCounts} filterStatus={filterStatus} onCardClick={handleCardClick} />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <OrderFilter
                    search={search}
                    setSearch={setSearch}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    STATUS={STATUS}
                    filterPayment={filterPayment}
                    setFilterPayment={setFilterPayment}
                    paymentMethods={paymentMethods}
                />
            </div>
            <OrderTable
                orders={filteredData.map((o) => ({
                    id: o.id,
                    customer: o.ten,
                    service: o.diaChiGiaoHang,
                    status: mapTrangThai(String(o.trangThai)),
                    date: o.ngayTao,
                    paymentMethod: o.phuongThucThanhToan,
                    shippingCode: o.maVanChuyen, // Thêm mã vận chuyển
                }))}
                STATUS={STATUS}
                handleStatusChange={handleStatusChange}
            />
            <div className="flex justify-center items-center gap-4 mt-6">
                <Button
                    variant="outline"
                    disabled
                    className="text-[#c3c6cc] border-blue-200 rounded-lg"
                >
                    Previous
                </Button>
                <span className="font-semibold text-white">Page 1 of 1</span>
                <Button
                    variant="outline"
                    disabled
                    className="text-[#c3c6cc] border-blue-200 rounded-lg"
                >
                    Next
                </Button>
            </div>
            {loading && <div className="text-white text-center mt-4">Đang tải dữ liệu...</div>}
        </div>
    );
}
