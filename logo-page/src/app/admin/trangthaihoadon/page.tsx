"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { HoaDonService } from "@/services/hoaDonService";
import { HoaDonDTO, TrangThaiHoaDon } from "@/components/types/hoaDon-types";
import OrderFilter from "./OrderFilter";
import StatusCardList from "./StatusCardList";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import OrderTable from "./OrderTable";
import TabHeader from "./TabHeader"; // import tab
import ReturnOrderManager from "./ReturnOrderManager";

export default function TrangThaiHoaDonPage() {
  const [tabIndex, setTabIndex] = useState(0); // tab quản lý

  // Đơn hàng state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPayment, setFilterPayment] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [hoaDonData, setHoaDonData] = useState<{
    content: HoaDonDTO[];
    totalPages: number;
  } | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  // Đơn hàng fetch
  const fetchHoaDons = useCallback(() => {
    setLoading(true);
    HoaDonService.getPagedHoaDons(0, 1000)
      .then((res) => setHoaDonData({ content: res.content, totalPages: res.totalPages }))
      .catch((err) => {
        console.error("Lỗi khi tải hóa đơn:", err);
        toast.error("Không thể tải dữ liệu hóa đơn.");
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchStatusCounts = useCallback(() => {
    HoaDonService.getStatusCounts()
      .then((res) => setStatusCounts(res))
      .catch((err) => {
        console.error("Lỗi thống kê trạng thái:", err);
        toast.error("Không thể lấy thống kê trạng thái.");
      });
  }, []);

  useEffect(() => {
    if (tabIndex === 0) {
      fetchHoaDons();
      fetchStatusCounts();
    }
    // Nếu tabIndex === 1, có thể fetch dữ liệu hoàn hàng ở đây sau này
  }, [fetchHoaDons, fetchStatusCounts, tabIndex]);

  // Lọc & phân trang đơn hàng
  const filteredList = useMemo(() => {
    if (!hoaDonData) return [];
    const searchText = search.toLowerCase();
    return hoaDonData.content.filter((o) => {
      const statusKey = Object.entries(TrangThaiHoaDon).find(
        ([, label]) => label === o.trangThai
      )?.[0];
      const matchesStatus = filterStatus === "ALL" || statusKey === filterStatus;
      const matchesPayment = filterPayment === "ALL" || o.phuongThucThanhToan === filterPayment;
      const matchesSearch =
        !search ||
        o.ten?.toLowerCase().includes(searchText) ||
        o.maHD?.toLowerCase().includes(searchText) ||
        o.phuongThucThanhToan?.toLowerCase().includes(searchText) ||
        o.maVanChuyen?.toLowerCase().includes(searchText);
      return matchesStatus && matchesPayment && matchesSearch;
    });
  }, [hoaDonData, filterStatus, filterPayment, search]);

  const pagedData = useMemo(() => {
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredList.slice(start, end);
  }, [filteredList, page, PAGE_SIZE]);

  const totalFilteredPages = useMemo(() => {
    return Math.ceil(filteredList.length / PAGE_SIZE) || 1;
  }, [filteredList, PAGE_SIZE]);

  const handleCardClick = (status: string) => {
    setFilterStatus((prev) => (prev === status ? "ALL" : status));
    setPage(0);
  };

  const handleStatusUpdate = async (
    id: number,
    currentStatus: string,
    newStatus: string
  ) => {
    const currentHoaDon = hoaDonData?.content.find((hd) => hd.id === id);
    if (!currentHoaDon) {
      toast.error("Không tìm thấy hóa đơn.");
      return;
    }
    if (currentHoaDon.trangThai === newStatus) {
      toast.warning("Trạng thái mới giống trạng thái hiện tại.");
      return;
    }
    if (!isValidTrangThaiTransition(currentHoaDon.trangThai, newStatus)) {
      toast.error("Chuyển trạng thái không hợp lệ.");
      return;
    }
    try {
      await HoaDonService.updateTrangThai(id, newStatus);
      toast.success("Cập nhật trạng thái thành công.");
      fetchHoaDons();
      fetchStatusCounts();
    } catch (error: any) {
      console.error("Lỗi cập nhật trạng thái:", error);
      toast.error(error?.message || "Không thể cập nhật trạng thái.");
    }
  };

  function isValidTrangThaiTransition(current: string, next: string): boolean {
    if (!current || !next) return false;
    const keyMap = Object.entries(TrangThaiHoaDon).reduce((acc, [key, value]) => {
      acc[value] = key;
      return acc;
    }, {} as Record<string, string>);
    const currentKey = keyMap[current];
    const nextKey = keyMap[next];
    if (!currentKey || !nextKey) return false;
    if (currentKey === "PENDING") {
      return nextKey === "PROCESSING" || nextKey === "CANCELLED";
    } else if (currentKey === "PROCESSING") {
      return nextKey === "PACKING";
    } else if (currentKey === "PACKING") {
      return nextKey === "SHIPPED";
    } else if (currentKey === "SHIPPED") {
      return nextKey === "DELIVERED" || nextKey === "FAILED";
    } else if (currentKey === "DELIVERED") {
      return nextKey === "COMPLETED";
    } else if (currentKey === "COMPLETED" || currentKey === "CANCELLED") {
      return false;
    } else if (currentKey === "FAILED") {
      return nextKey === "PENDING" || nextKey === "CANCELLED";
    }
    return false;
  }

  // ----------- Giao diện
  return (
    <div className="w-full h-full">
      {/* Tab chuyển đổi */}
      <TabHeader tabIndex={tabIndex} setTabIndex={setTabIndex} />
      <Card className="p-4 bg-gray-800 shadow-md w-full h-full">
        {/* Tab Đơn Hàng */}
        {tabIndex === 0 && (
          <>
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
                filterPayment={filterPayment}
                setFilterPayment={setFilterPayment}
                orders={hoaDonData?.content || []}
                setPage={setPage}
                PAGE_SIZE={PAGE_SIZE}
              />
            </div>
            <OrderTable
              data={{
                content: pagedData,
                totalPages: totalFilteredPages,
              }}
              page={page}
              setPage={setPage}
              PAGE_SIZE={PAGE_SIZE}
              isValidTrangThaiTransition={isValidTrangThaiTransition}
              handleStatusUpdate={handleStatusUpdate}
            />
          </>
        )}
        {/* Tab Hoàn Hàng */}
        {tabIndex === 1 && (
          <div className="p-8 text-center text-lg font-semibold text-[#2176ff]">
            {tabIndex === 1 && <ReturnOrderManager />}
          </div>
        )}
      </Card>
    </div>
  );
}