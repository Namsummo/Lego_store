// components/cart/CartSummary.tsx
import { Button } from "@/components/ui/button";

interface CartSummaryProps {
  total: number;
}

const CartSummary = ({ total }: CartSummaryProps) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Tóm Tắt Đơn Hàng</h2>
      <div className="flex justify-between mb-2">
        <span>Tiền hàng hoá:</span>
        <span>{total.toLocaleString()}đ</span>
      </div>
      <div className="flex justify-between mb-2">
        <span>Giảm giá:</span>
        <span>0</span>
      </div>
      <div className="flex justify-between text-lg font-bold text-red-600 border-t pt-2">
        <span>Tổng cộng:</span>
        <span>{total.toLocaleString()}đ</span>
      </div>

      <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-3">
        Thanh Toán Ngay
      </Button>
    </div>
  );
};

export default CartSummary;
