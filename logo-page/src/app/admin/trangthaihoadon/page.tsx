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

function mapTrangThai(trangThai: string): TrangThaiHoaDon | string {
    switch (trangThai?.toUpperCase()) {
        case "PENDING":
            return TrangThaiHoaDon.PENDING;
        case "PROCESSING":
            return TrangThaiHoaDon.PROCESSING;
        case "SHIPPED":
            return TrangThaiHoaDon.SHIPPED;
        case "DELIVERED":
            return TrangThaiHoaDon.DELIVERED;
        case "CANCELLED":
            return TrangThaiHoaDon.CANCELLED;
        default:
            return trangThai;
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
                setData(res.content);
            })
            .catch((err) => {
                console.error("Lỗi khi tải hóa đơn:", err);
            })
            .finally(() => setLoading(false));
    }, []);

    const statusCounts = STATUS.map((st) => ({
        ...st,
        count: data.filter((o) => o.trangThai?.toUpperCase() === st.value).length,
    }));

    // ✅ Chuyển về dạng { value, label }[] để dùng cho Select
    const paymentMethods = Array.from(
        new Set(data.map((o) => o.phuongThucThanhToan).filter(Boolean))
    ).map((method) => ({
        value: method,
        label: method,
    }));

    const filteredData = data.filter(
        (o) =>
            (filterStatus === "all" || o.trangThai?.toUpperCase() === filterStatus) &&
            (filterPayment === "all" || o.phuongThucThanhToan === filterPayment) &&
            (o.ten?.toLowerCase().includes(search.toLowerCase()) ||
                o.diaChiGiaoHang?.toLowerCase().includes(search.toLowerCase()))
    );

    const handleCardClick = (status: string) => {
        setFilterStatus((prev) => (prev === status ? "all" : status));
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            setLoading(true);
            const statusUpper = newStatus.toUpperCase();

            await HoaDonService.updateTrangThai(id, statusUpper);

            setData((prevData) =>
                prevData.map((o) =>
                    o.id === id ? { ...o, trangThai: statusUpper as TrangThaiHoaDon } : o
                )
            );

            alert("✅ Cập nhật trạng thái thành công!");
        } catch (error) {
            console.error("❌ Cập nhật trạng thái thất bại:", error);
            alert("❌ Cập nhật trạng thái thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#181e29] py-8 px-2 md:px-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-center text-white mb-10 tracking-tight drop-shadow">
                Quản lý trạng thái đơn hàng SEO
            </h1>

            <StatusCardList
                statusCounts={statusCounts}
                filterStatus={filterStatus}
                onCardClick={handleCardClick}
            />

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
                orders={filteredData}
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
