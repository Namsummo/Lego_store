"use client";
import { ShoppingBag, Package, ArrowLeft, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ThanhToanThanhCongPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header Success */}
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Thanh toán thành công!</h1>
          <p className="text-orange-100">Đơn hàng #DH20241001</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Thank you message */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Cảm ơn bạn đã mua LEGO! 🧱✨
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Bộ LEGO tuyệt vời của bạn đã được xác nhận và sẽ nhanh
              chóng được vận chuyển đến tay bạn để bắt đầu cuộc
              phiêu lưu xây dựng!
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-orange-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">🧱 LEGO Creator Expert:</span>
              </div>
              <span className="font-bold text-gray-800">2.450.000 VNĐ</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức:</span>
                <span className="text-gray-800 font-medium">Thẻ tín dụng</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời gian giao hàng:</span>
                <span className="text-orange-600 font-medium">2-3 ngày</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package className="w-3 h-3 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-1">📦 Thông tin vận chuyển</h3>
                <p className="text-sm text-gray-600">
                  Bộ LEGO của bạn sẽ được đóng gói cẩn thận và gửi
                  thông tin theo dõi qua email khi bắt đầu vận chuyển.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium">
              📄 Xem chi tiết đơn hàng
            </Button>

            <Button
              // variant="outline"
              className="w-full border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại trang chủ
            </Button>
          </div>

          {/* Support */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Cần hỗ trợ?</p>
            <div className="flex justify-center gap-6">
              <button className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600">
                <Phone className="w-4 h-4" />
                Hotline: 1900-1234
              </button>
              <button className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600">
                <MessageCircle className="w-4 h-4" />
                Chat hỗ trợ
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
