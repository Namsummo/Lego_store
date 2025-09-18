import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, CheckCircle } from "lucide-react";

interface StatsCardsProps {
  totalVouchers: number;
  affordableVouchers: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalVouchers,
  affordableVouchers,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-medium opacity-95">Tổng phiếu có thể đổi</div>
              <div className="text-3xl font-bold">{totalVouchers}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-medium opacity-95">Có thể đổi ngay</div>
              <div className="text-3xl font-bold">{affordableVouchers}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
