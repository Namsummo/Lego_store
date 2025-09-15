"use client";
import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCartIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartItemType } from "@/components/types/cart";
import { updateCartItem } from "@/context/cartLocal";

interface CartProps {
  items: CartItemType[];
  selectedIds: number[];
  onSelect: (id: number) => void;
  onQuantityChange: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  formatCurrency: (amount: number) => string;
}

export function CartItem({
  items,
  selectedIds,
  onSelect,
  onQuantityChange,
  onRemove,
  formatCurrency,
}: CartProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  console.log("ListCart:", items);
  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 3000);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center gap-6 py-12">
        <div className="flex items-center gap-3 mb-4">
          <ShoppingCartIcon className="w-10 h-10 text-gray-600" />
          <p className="text-gray-800 font-semibold text-2xl">
            Giỏ hàng của bạn đang trống
          </p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
          onClick={() => router.push("/product")}
        >
          Tiếp tục mua sắm
        </Button>
      </div>
    );
  }

  const handleQuantityChange = (id: number, delta: number) => {
    const item = items.find((item) => item.id === id);
    if (!item) return;

    const newQty = item.quantity + delta;
    const result = updateCartItem(
      { ...item, quantity: newQty },
      item.maxQuantity ?? 20,
      { override: true }
    );

    if (!result.success) {
      showError(result.message || "Có lỗi xảy ra!");
    } else {
      onQuantityChange(id, delta);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-200 text-red-600 p-3 rounded-lg shadow-md animate-fade-in">
          {errorMessage}
        </div>
      )}
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
        >
          <Checkbox
            checked={selectedIds.includes(item.id)}
            onCheckedChange={() => onSelect(item.id)}
            className="border-gray-400 w-5 h-5 data-[state=checked]:bg-orange-500"
            aria-label={`Chọn sản phẩm ${item.name}`}
          />

          <Link
            href={`/product/${item.id}`}
            className="w-20 h-20 relative group flex-shrink-0"
          >
            <Image
              src={"/images/placeholder-product.png"}
              alt={item.name}
              fill
              className="object-cover rounded-md group-hover:opacity-90 transition-opacity duration-200"
            />
          </Link>

          <div className="flex-1 min-w-0 space-y-1">
            <Link href={`/product/${item.id}`}>
              <h3 className="font-medium text-gray-800 line-clamp-2 hover:text-orange-600 transition-colors duration-200">
                {item.name}
              </h3>
            </Link>
            <div className="text-lg font-semibold text-orange-600">
              {formatCurrency(item.price)}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-yellow-100 rounded-lg p-1">
            <Button
              size="sm"
              onClick={() => handleQuantityChange(item.id, -1)}
              disabled={item.quantity <= 1}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md w-8 h-8 transition-colors duration-200"
              aria-label="Giảm số lượng"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-8 text-center text-gray-800 font-medium">
              {item.quantity}
            </span>
            <Button
              size="sm"
              onClick={() => handleQuantityChange(item.id, 1)}
              disabled={item.quantity >= (item.maxQuantity ?? 20)}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-md w-8 h-8 transition-colors duration-200"
              aria-label="Tăng số lượng"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => onRemove(item.id)}
            className="bg-red-100 hover:bg-red-200 text-red-600 rounded-md w-8 h-8 transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
