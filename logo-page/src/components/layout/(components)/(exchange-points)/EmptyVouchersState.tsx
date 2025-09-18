import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Gift } from "lucide-react";

export const EmptyVouchersState: React.FC = () => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-lg">
      <CardContent className="p-12 text-center">
        <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <Gift className="h-12 w-12 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-3">
          Hiện tại không có phiếu giảm giá nào để đổi
        </h3>
        <p className="text-gray-600 mb-6 text-lg">
          Các phiếu giảm giá có thể đã hết hạn hoặc hết số lượng
        </p>
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-xl p-6 max-w-lg mx-auto shadow-sm">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
              <span className="text-white text-lg">💡</span>
            </div>
            <h4 className="font-bold text-gray-800">Mẹo hữu ích</h4>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Tích lũy điểm bằng cách tham gia các hoạt động trên website để sẵn sàng đổi phiếu mới!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
