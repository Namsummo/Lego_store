"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/ConfirmDialog";
import { CartItemType } from "@/components/types/cart";
import { CartItem } from "./(components)/CartItem";
import CartSummary from "./(components)/CartSummary";
import { useUserStore } from "@/context/authStore.store";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItemType[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [discount, setDiscount] = useState(0);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const { user } = useUserStore();
  const userId = user?.id;

  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const fixedCart = cart.map((item: any) => ({
        id: Number(item.id) || 0,
        name: item.name || item.tenSanPham || "Sản phẩm không tên",
        price:
          Number(item.price) ||
          Number(item.gia) ||
          Number(item.giaKhuyenMai) ||
          0,
        quantity: Number(item.quantity) || Number(item.soLuong) || 1,
        maxQuantity: Number(item.maxQuantity) || Number(item.soLuongTon) || 20,
        image: item.image || item.anh || "",
      }));

      setItems(fixedCart);
      setSelectedIds(fixedCart.map((item: CartItemType) => item.id));
    } catch (err) {
      console.error("Lỗi khi parse localStorage:", err);
    }
  }, []);

  const handleQuantityChange = (id: number, delta: number) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(
                item.maxQuantity ?? 20,
                Math.max(1, item.quantity + delta)
              ),
            }
          : item
      );
      localStorage.setItem("cartItems", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemove = (id: number) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    localStorage.setItem("cartItems", JSON.stringify(updated));
    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    toast.success("Đã xóa sản phẩm!");
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allSelected = items.length > 0 && selectedIds.length === items.length;
    setSelectedIds(allSelected ? [] : items.map((item) => item.id));
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalAfterDiscount = Math.max(0, subtotal - discount);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm!");
      return;
    }

    const updatedItems = selectedItems.map((item) => ({
      ...item,
      finalPrice:
        discount > 0
          ? item.price - item.price * (discount / subtotal)
          : item.price,
    }));

    localStorage.setItem("checkoutItems", JSON.stringify(updatedItems));
    localStorage.setItem("checkoutDiscount", String(totalAfterDiscount));
    router.push("/cart/checkout");
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount) + "đ";

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn sản phẩm để xóa!");
      return;
    }
    setDeleteSelectedOpen(true);
  };

  const confirmDeleteSelected = () => {
    const updated = items.filter((item) => !selectedIds.includes(item.id));
    setItems(updated);
    localStorage.setItem("cartItems", JSON.stringify(updated));
    setSelectedIds([]);
    setDeleteSelectedOpen(false);
    toast.success(`Đã xóa ${selectedItems.length} sản phẩm!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Breadcrumb */}
      <div className="w-full">
        <div className="bg-gray-200 shadow-sm border-b border-gray-100 p-4">
          <div className="max-w-7xl mx-auto">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Trang Chủ
              </Link>
              <span className="text-gray-400">{">"}</span>
              <span className="text-gray-900 font-medium truncate">Giỏ hàng</span>
            </nav>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Main Content */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left Section */}
          <div className="flex-1 space-y-6">
            {/* Control Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={handleSelectAll}
                    className="bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 hover:text-orange-800 hover:from-orange-200 hover:to-yellow-200 rounded-xl px-6 py-3 font-medium transition-all duration-200 shadow-md"
                  >
                    {selectedIds.length === items.length && items.length > 0
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả"}
                  </Button>

                  {selectedIds.length > 0 && (
                    <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                      {selectedIds.length} sản phẩm đã chọn
                    </div>
                  )}
                </div>

                {selectedIds.length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={handleDeleteSelected}
                    className="bg-gradient-to-r from-red-100 to-pink-100 text-red-700 hover:text-red-800 hover:from-red-200 hover:to-pink-200 rounded-xl px-6 py-3 font-medium transition-all duration-200 shadow-md flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa đã chọn
                  </Button>
                )}
              </div>
            </div>

            {/* Product List Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6" />
                  Danh sách sản phẩm
                </h2>
                <p className="text-orange-100 mt-1">
                  Xem lại các sản phẩm trong giỏ hàng
                </p>
              </div>

              <CartItem
                items={items}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="xl:w-96 w-full space-y-6">
            {/* Summary Card */}
            <CartSummary
              selectedItems={selectedItems}
              onCheckout={handleCheckout}
              formatCurrency={formatCurrency}
              userId={userId}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteSelectedOpen}
        onConfirm={confirmDeleteSelected}
        onCancel={() => setDeleteSelectedOpen(false)}
        title="Xác nhận xóa sản phẩm"
        description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn khỏi giỏ hàng?`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}
