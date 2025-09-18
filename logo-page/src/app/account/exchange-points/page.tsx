"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useGetPhieuGiamGiaNoiBat } from "@/hooks/usePhieuGiam";
import { useDoiDiemLayPhieu, useGetViPhieuGiamGiaTheoUser } from "@/hooks/useViPhieuGiamGia";
import { useLichSuDoiDiem } from "@/hooks/useLichSuDoiDiem";
import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/context/authStore.store";
import { PhieuGiamGia } from "@/components/types/phieugiam.type";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { SuccessNotification } from "@/components/ui/success-notification";
import { ExchangePointsHeader } from "@/components/layout/(components)/(exchange-points)/ExchangePointsHeader";
import { StatsCards } from "@/components/layout/(components)/(exchange-points)/StatsCards";
import { VoucherCard } from "@/components/layout/(components)/(exchange-points)/VoucherCard";
import { ConfirmExchangeDialog } from "@/components/layout/(components)/(exchange-points)/ConfirmExchangeDialog";
import { ErrorNotification } from "@/components/layout/(components)/(exchange-points)/ErrorNotification";
import { EmptyVouchersState } from "@/components/layout/(components)/(exchange-points)/EmptyVouchersState";
import { LichSuDoiDiemModal } from "@/components/layout/(components)/(exchange-points)/LichSuDoiDiemModal";
import { LichSuButton } from "@/components/layout/(components)/(exchange-points)/LichSuButton";

export default function ExchangePointsPage() {
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const [selectedVoucher, setSelectedVoucher] = useState<PhieuGiamGia | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [voucherToExchange, setVoucherToExchange] = useState<PhieuGiamGia | null>(null);
  const [showLichSuModal, setShowLichSuModal] = useState(false);

  const { data: vouchers = [], isLoading } = useGetPhieuGiamGiaNoiBat();
  const { data: userVouchers = [] } = useGetViPhieuGiamGiaTheoUser(user?.id, "active");
  const { data: lichSuDoiDiem = [], isLoading: isLoadingLichSu } = useLichSuDoiDiem(user?.id);
  const doiDiemMutation = useDoiDiemLayPhieu();

  // Lấy danh sách ID phiếu giảm giá mà user đã đổi
  const exchangedVoucherIds = userVouchers.map(userVoucher => userVoucher.id);

  // Lọc phiếu giảm giá có thể đổi bằng điểm (có diemDoi > 0), còn hạn sử dụng và chưa được user đổi
  const exchangeableVouchers = vouchers.filter((voucher) => {
    // Kiểm tra user đã đổi phiếu này chưa
    if (exchangedVoucherIds.includes(voucher.id)) {
      return false;
    }

    if (!voucher.diemDoi || voucher.diemDoi <= 0 || voucher.soLuong <= 0) {
      return false;
    }

    // Kiểm tra hạn sử dụng
    try {
      const now = new Date();
      // Parse ngày từ format "15-09-2025 00:00:00" thành Date object
      let endDate: Date;
      if (voucher.ngayKetThuc.includes('-')) {
        // Format: "15-09-2025 00:00:00" -> "2025-09-15T00:00:00"
        const [datePart, timePart] = voucher.ngayKetThuc.split(' ');
        const [day, month, year] = datePart.split('-');
        const isoDateString = `${year}-${month}-${day}T${timePart || '00:00:00'}`;
        endDate = new Date(isoDateString);
      } else {
        endDate = new Date(voucher.ngayKetThuc);
      }
      
      return endDate > now; // Chỉ lấy phiếu còn hạn
    } catch {
      return false; // Nếu không parse được ngày thì loại bỏ
    }
  });

  const handleExchange = async () => {
    if (!selectedVoucher || !user?.id) return;

    try {
      await doiDiemMutation.mutateAsync({
        userId: user.id,
        phieuGiamGiaId: selectedVoucher.id,
      });

      // Cập nhật điểm user trong store (trừ điểm đã đổi)
      if (user.diemTichLuy && selectedVoucher.diemDoi) {
        const newPoints = user.diemTichLuy - selectedVoucher.diemDoi;
        useUserStore.getState().updateUser({ diemTichLuy: newPoints });
      }

      // Refresh cache để cập nhật danh sách phiếu giảm giá và user data
      await queryClient.invalidateQueries({ queryKey: ["viPhieuGiamGiaTheoUser"] });
      await queryClient.invalidateQueries({ queryKey: ["phieuGiamGiaNoiBat"] });
      await queryClient.invalidateQueries({ queryKey: ["lichSuDoiDiem"] });
      
      // Refresh user data từ server để đảm bảo đồng bộ
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      setNotificationMessage(`✅ Đổi phiếu thành công! 🎉 Bạn đã đổi thành công phiếu "${selectedVoucher.tenPhieu}". Phiếu đã được thêm vào ví của bạn!`);
      setShowSuccessNotification(true);
      setSelectedVoucher(null);

      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 3000);
    } catch (error: unknown) {
      let errorMessage = "Có lỗi xảy ra khi đổi phiếu";
      
      if (error instanceof Error) {
        const errorText = error.message;
        
        // Xử lý các lỗi cụ thể
        if (errorText.includes("Bạn đã nhận phiếu này rồi")) {
          errorMessage = "Bạn đã đổi phiếu giảm giá này rồi! Vui lòng chọn phiếu khác.";
        } else if (errorText.includes("Không đủ điểm")) {
          errorMessage = "Bạn không đủ điểm để đổi phiếu này!";
        } else if (errorText.includes("Phiếu đã hết hạn")) {
          errorMessage = "Phiếu giảm giá này đã hết hạn sử dụng!";
        } else if (errorText.includes("Phiếu đã hết số lượng")) {
          errorMessage = "Phiếu giảm giá này đã hết số lượng!";
        } else if (errorText.includes("400")) {
          errorMessage = "Yêu cầu không hợp lệ. Vui lòng thử lại!";
        } else if (errorText.includes("500")) {
          errorMessage = "Lỗi server. Vui lòng thử lại sau!";
        } else {
          // Nếu là JSON error, parse để lấy message
          try {
            const jsonMatch = errorText.match(/\{.*\}/);
            if (jsonMatch) {
              const errorObj = JSON.parse(jsonMatch[0]);
              if (errorObj.message) {
                errorMessage = errorObj.message;
              }
            } else {
              errorMessage = errorText;
            }
          } catch {
            errorMessage = errorText;
          }
        }
      }
      
      setNotificationMessage(`❌ ${errorMessage}`);
      setShowErrorNotification(true);

      // Tự động ẩn thông báo sau 4 giây
      setTimeout(() => {
        setShowErrorNotification(false);
      }, 4000);
    }
  };

  const canAfford = (voucher: PhieuGiamGia) => {
    return user?.diemTichLuy && voucher.diemDoi
      ? user.diemTichLuy >= voucher.diemDoi
      : false;
  };

  const formatDate = (dateString: string) => {
    try {
      let date: Date;
      if (dateString.includes('-')) {
        // Format: "15-09-2025 00:00:00" -> "2025-09-15T00:00:00"
        const [datePart, timePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('-');
        const isoDateString = `${year}-${month}-${day}T${timePart || '00:00:00'}`;
        date = new Date(isoDateString);
      } else {
        date = new Date(dateString);
      }
      return format(date, "dd/MM/yyyy", { locale: vi });
    } catch {
      return dateString;
    }
  };

  const getDiscountText = (voucher: PhieuGiamGia) => {
    if (voucher.loaiPhieuGiam === "theo_phan_tram") {
      return `Giảm ${voucher.giaTriGiam}%`;
    }
    return `Giảm ${voucher.giaTriGiam.toLocaleString()}₫`;
  };

  const handleVoucherClick = (voucher: PhieuGiamGia) => {
    setVoucherToExchange(voucher);
    setShowConfirmDialog(true);
  };

  const handleConfirmExchange = async () => {
    setShowConfirmDialog(false);
    if (voucherToExchange) {
      setSelectedVoucher(voucherToExchange);
      await handleExchange();
    }
    setVoucherToExchange(null);
  };

  const handleCloseDialog = () => {
    setShowConfirmDialog(false);
    setVoucherToExchange(null);
  };

  return (
    <>
      {/* Thông báo thành công */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        message={notificationMessage}
        onClose={() => setShowSuccessNotification(false)}
      />

      {/* Thông báo lỗi */}
      <ErrorNotification
        isVisible={showErrorNotification}
        message={notificationMessage}
      />

      {/* Popup xác nhận đổi phiếu */}
      <ConfirmExchangeDialog
        isOpen={showConfirmDialog}
        voucher={voucherToExchange}
        currentPoints={user?.diemTichLuy || 0}
        isExchanging={doiDiemMutation.isPending}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmExchange}
        formatDate={formatDate}
        getDiscountText={getDiscountText}
      />

      {/* Modal lịch sử đổi điểm */}
      <LichSuDoiDiemModal
        isOpen={showLichSuModal}
        onClose={() => setShowLichSuModal(false)}
        lichSuData={lichSuDoiDiem}
        isLoading={isLoadingLichSu}
      />

      <div className="min-h-screen bg-gradient-to-br">
        {/* Header */}
        <ExchangePointsHeader currentPoints={user?.diemTichLuy || 0} />

        <div className="container mx-auto px-4 py-8">
          {/* Thống kê */}
          <StatsCards
            totalVouchers={exchangeableVouchers.length}
            affordableVouchers={exchangeableVouchers.filter(v => canAfford(v)).length}
          />

          {/* Nút xem lịch sử đổi điểm */}
          <div className="mb-8 flex justify-end">
            <LichSuButton 
              onClick={() => setShowLichSuModal(true)}
            />
          </div>

          {/* Danh sách phiếu giảm giá */}
          {isLoading ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <span className="ml-2">Đang tải phiếu giảm giá...</span>
                </div>
              </CardContent>
            </Card>
          ) : exchangeableVouchers.length === 0 ? (
            <EmptyVouchersState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exchangeableVouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  affordable={canAfford(voucher)}
                  onVoucherClick={handleVoucherClick}
                  formatDate={formatDate}
                  getDiscountText={getDiscountText}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
