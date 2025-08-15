"use client";

import React, { useEffect, useState } from "react";
import { HoaDonService } from "@/services/hoaDonService";
import {
  HoaDonChiTietDTO,
  HoaDonDTO,
  PaymentMethods,
  TrangThaiHoaDon,
} from "@/components/types/hoaDon-types";
import { useSanPham } from "@/hooks/useSanPham";
import { useAccounts } from "@/hooks/useAccount";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import HoaDonChiTiet from "./HoaDonChiTiet";
import HoaDonTable from "./HoaDonTable";
import HoaDonFilter from "./hoaDonFilter";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/layout/(components)/(pages)/Modal";
import LichSuLogTimeline from "@/shared/LichSuLogTimeline";
import { PlusIcon, Repeat2 } from "lucide-react";

const PAGE_SIZE = 10;

function isValidTrangThaiTransition(current: string, next: string): boolean {
  const currentKey = Object.keys(TrangThaiHoaDon).find(
    (key) => TrangThaiHoaDon[key as keyof typeof TrangThaiHoaDon] === current
  );
  const nextKey = Object.keys(TrangThaiHoaDon).find(
    (key) => TrangThaiHoaDon[key as keyof typeof TrangThaiHoaDon] === next
  );

  if (!currentKey || !nextKey) return false;

  switch (currentKey) {
    case "PENDING":
      return nextKey === "PROCESSING" || nextKey === "CANCELLED";
    case "PROCESSING":
      return nextKey === "PACKING";
    case "PACKING":
      return nextKey === "SHIPPED";
    case "SHIPPED":
      return nextKey === "DELIVERED" || nextKey === "FAILED";
    case "DELIVERED":
      //   // Cho phép chuyển sang Hoàn hàng hoặc Hoàn tất sau khi đã giao
      return nextKey === "COMPLETED";
    // || nextKey === "RETURN"
    // case "RETURN":
    //   // Sau khi hoàn hàng xong có thể kết thúc quy trình
    //   return nextKey === "COMPLETED";
    case "FAILED":
      return nextKey === "PENDING" || nextKey === "CANCELLED";
    default:
      return false;
  }
}

function parseBackendDateToDate(date: unknown): Date | null {
  if (!date) return null;
  if (Array.isArray(date) && date.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = date;
    return new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
      Math.floor(nano / 1e6)
    );
  }
  const d = new Date(date as string);
  return isNaN(d.getTime()) ? null : d;
}

const mapStatusToKey = (
  status: string
): keyof typeof TrangThaiHoaDon | undefined =>
  Object.keys(TrangThaiHoaDon).find(
    (key) => TrangThaiHoaDon[key as keyof typeof TrangThaiHoaDon] === status
  ) as keyof typeof TrangThaiHoaDon | undefined;

const mapPaymentToKey = (
  method: string
): keyof typeof PaymentMethods | undefined =>
  Object.keys(PaymentMethods).find(
    (key) => PaymentMethods[key as keyof typeof PaymentMethods] === method
  ) as keyof typeof PaymentMethods | undefined;

const HoaDonManagement = () => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{
    content: HoaDonDTO[];
    totalPages: number;
  } | null>(null);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<HoaDonDTO | null>(null);
  const [chiTietSanPham, setChiTietSanPham] = useState<HoaDonChiTietDTO[]>([]);
  const [isOpenLog, setIsOpenLog] = useState(false);

  const {
    data: sanPhams = [],
    error: sanPhamError,
    isLoading: loadingSanPhams,
  } = useSanPham();
  const {
    data: users = [],
    error: userError,
    isLoading: loadingUsers,
  } = useAccounts();

  const [filters, setFilters] = useState({
    keyword: "",
    trangThai: "all" as keyof typeof TrangThaiHoaDon | "all",
    phuongThuc: "all" as keyof typeof PaymentMethods | "all",
    from: "",
    to: "",
  });

  useEffect(() => {
    if (sanPhamError) toast.error("Lỗi khi tải danh sách sản phẩm");
    if (userError) toast.error("Lỗi khi tải danh sách người dùng");
  }, [sanPhamError, userError]);

  const fetchData = async () => {
    try {
      const allPaged = await HoaDonService.getPagedHoaDons(0, 1000);
      let filtered = allPaged.content.map((hd: HoaDonDTO) => ({
        ...hd,
        trangThai: mapStatusToKey(hd.trangThai)
          ? TrangThaiHoaDon[mapStatusToKey(hd.trangThai)!]
          : hd.trangThai,
        phuongThucThanhToan:
          mapPaymentToKey(hd.phuongThucThanhToan || "") ||
          hd.phuongThucThanhToan,
      }));

      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        filtered = filtered.filter((hd) => {
          const user = users.find((u) => u.id === hd.user?.id);
          return (
            user?.ten?.toLowerCase().includes(kw) ||
            hd.maHD?.toLowerCase().includes(kw) ||
            user?.sdt?.includes(kw) ||
            (hd.id + "").includes(kw)
          );
        });
      }

      if (filters.trangThai !== "all") {
        const trangThaiValue = TrangThaiHoaDon[filters.trangThai];
        filtered = filtered.filter((hd) => hd.trangThai === trangThaiValue);
      }

      if (filters.phuongThuc !== "all") {
        filtered = filtered.filter(
          (hd) => hd.phuongThucThanhToan === filters.phuongThuc
        );
      }

      if (filters.from) {
        const fromDate = new Date(filters.from);
        filtered = filtered.filter((hd) => {
          const d = parseBackendDateToDate(hd.ngayTao || "");
          return d && d >= fromDate;
        });
      }

      if (filters.to) {
        const toDate = new Date(filters.to);
        filtered = filtered.filter((hd) => {
          const d = parseBackendDateToDate(hd.ngayTao || "");
          return d && d <= toDate;
        });
      }

      const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
      const content = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
      setData({ content, totalPages });
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Lỗi không xác định";
      toast.error(`Lỗi tải dữ liệu: ${errorMessage}`);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, filters, users]);

  const handleViewDetail = async (id: number) => {
    try {
      const chiTiet = await HoaDonService.getChiTietSanPhamByHoaDonId(id);
      const hoaDon = data?.content.find((hd) => hd.id === id);

      if (hoaDon) {
        setDetail(hoaDon); // set detail cho HoaDonChiTiet
        setChiTietSanPham(chiTiet || []);
        setOpen(true);
      } else {
        toast.error("Không tìm thấy hóa đơn.");
      }
    } catch {
      toast.error("Lỗi khi tải chi tiết hóa đơn.");
    }
  };

  const handleStatusChange = async (
    id: number,
    current: string,
    next: string
  ) => {
    if (!isValidTrangThaiTransition(current, next)) {
      toast.error(`Không thể chuyển từ "${current}" sang "${next}"`);
      return;
    }
    try {
      await HoaDonService.updateTrangThai(id, next);
      toast.success(`Cập nhật trạng thái thành công`);
      fetchData();
    } catch (e: any) {
      // Log lỗi chi tiết
      console.error("Lỗi cập nhật trạng thái:", e);
      toast.error(`Cập nhật trạng thái thất bại: ${e?.message || ""}`);
    }
  };

  return (
    <div className="space-y-6">
      {loadingSanPhams || loadingUsers ? (
        <div className="text-center py-16 text-gray-300">Đang tải...</div>
      ) : (
        <>
          <Card className="p-4 bg-gray-800 shadow-md w-full h-full">
            <HoaDonFilter
              filters={filters}
              setFilters={setFilters}
              setPage={setPage}
              hoaDons={data?.content || []}
            />

            <Button
              onClick={() => setIsOpenLog(true)}
              variant="destructive"
              className="w-[150px] "
            >
              <PlusIcon />
              Xem lịch sử
            </Button>
            {/* Modal xem lịch sử log */}
            <Modal
              open={isOpenLog}
              onOpenChange={() => setIsOpenLog(false)}
              title="Lịch sử thay đổi"
              className="max-w-6xl"
              scrollContentOnly
            >
              <LichSuLogTimeline bang="hoaDon" title="Lịch sử user log" />
            </Modal>



            <HoaDonTable
              data={data}
              page={page}
              setPage={setPage}
              handleViewDetail={handleViewDetail}
              handleStatusChange={handleStatusChange}
              PAGE_SIZE={PAGE_SIZE}
              isValidTrangThaiTransition={isValidTrangThaiTransition}
              onReload={fetchData}
            />

            <HoaDonChiTiet
              open={open}
              onOpenChange={setOpen}
              detail={detail}
              chiTietSanPham={chiTietSanPham}
              sanPhams={sanPhams}
              users={users}
              loadingDetail={false}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default HoaDonManagement;
