"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { History, Coins, Gift, Calendar, X } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { LichSuDoiDiemResponse } from "@/services/lichSuDoiDiemService";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LichSuDoiDiemModalProps {
  isOpen: boolean;
  onClose: () => void;
  lichSuData: LichSuDoiDiemResponse[];
  isLoading: boolean;
}

export const LichSuDoiDiemModal: React.FC<LichSuDoiDiemModalProps> = ({
  isOpen,
  onClose,
  lichSuData,
  isLoading,
}) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "Không xác định";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-white border-2 border-blue-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600 text-xl">
            <History className="h-6 w-6" />
            Lịch Sử Đổi Điểm
            {!isLoading && lichSuData && (
              <Badge variant="default" className="ml-2">
                {lichSuData.length} giao dịch
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-2 bg-gray-50 rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-500 text-lg">Đang tải lịch sử...</span>
            </div>
          ) : !lichSuData || lichSuData.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Chưa có lịch sử đổi điểm nào</p>
              <p className="text-gray-400 text-sm mt-2">
                Hãy đổi điểm để lấy phiếu giảm giá đầu tiên!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lichSuData.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Gift className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>

                  {/* Nội dung */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          {item.moTa}
                        </p>
                        {item.maPhieu && (
                          <Badge variant="outline" className="text-xs">
                            Mã phiếu: {item.maPhieu}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-red-600 font-semibold text-lg">
                          <Coins className="h-5 w-5" />
                          -{item.diemDaDoi.toLocaleString()} điểm
                        </div>
                      </div>
                    </div>

                    {/* Thời gian */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                      <Calendar className="h-4 w-4" />
                      {formatDate(item.ngayDoi)}
                    </div>
                  </div>

                  {/* Số thứ tự */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-200 bg-white">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
