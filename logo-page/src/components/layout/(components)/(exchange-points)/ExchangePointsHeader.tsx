import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Coins } from "lucide-react";

interface ExchangePointsHeaderProps {
  currentPoints: number;
}

export const ExchangePointsHeader: React.FC<ExchangePointsHeaderProps> = ({
  currentPoints,
}) => {
  return (
    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg rounded-2xl overflow-hidden">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Gift className="h-8 w-8" />
                Đổi Điểm Lấy Phiếu Giảm Giá
              </h1>
              <p className="text-orange-100 mt-1">
                Sử dụng điểm tích lũy để đổi phiếu giảm giá nổi bật còn hạn sử dụng
              </p>
            </div>
          </div>

          {/* Điểm hiện tại */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Coins className="h-6 w-6 text-yellow-300" />
                <div>
                  <div className="text-sm text-orange-100">Điểm hiện tại</div>
                  <div className="text-2xl font-bold text-white">
                    {currentPoints}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
