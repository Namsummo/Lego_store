import { CartItemType } from "@/components/types/cart";
import { PhieuGiamGiaResponse } from "@/components/types/vi-phieu-giam-gia";
import { AlertCircle } from "lucide-react";
import Image from "next/image";

// Utility functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}
interface OrderItemsProps {
  checkoutItems: CartItemType[];
}
interface OrderSummaryProps {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
}
// Components
export default function OrderItems({ checkoutItems }: OrderItemsProps) {
  if (checkoutItems.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Không có sản phẩm nào trong đơn hàng</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {checkoutItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          {/* Product Image */}
          <div className="flex-shrink-0">
            <Image
              src={"/images/placeholder-product.png"}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-lg border border-gray-100"
              width={64}
              height={64}
            />
          </div>

          {/* Product Info - Takes up available space */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-base leading-tight line-clamp-2 mb-1">
              {item.name}
            </h4>
            <p className="text-sm text-gray-500">
              {formatCurrency(item.price)} × {item.quantity}
            </p>
          </div>

          {/* Total Price - Right aligned */}
          <div className="flex-shrink-0 text-right">
            <span className="font-semibold text-gray-900 text-lg">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderSummary({
  subtotal,
  discount,
  shippingFee,
  total,
}: OrderSummaryProps) {
  return (
    <div className="space-y-3 pt-4 border-t border-gray-200">
      <div className="flex justify-between text-gray-600">
        <span>Tạm tính:</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>Phí vận chuyển:</span>
        <span>{formatCurrency(shippingFee)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-orange-600">Giảm giá:</span>
          <span className="font-semibold text-orange-600">
            -{formatCurrency(discount)}
          </span>
        </div>
      )}
      <div className="flex justify-between text-lg font-bold text-gray-800 pt-3 border-t border-gray-200">
        <span>Tổng cộng:</span>
        <span className="text-orange-600">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
