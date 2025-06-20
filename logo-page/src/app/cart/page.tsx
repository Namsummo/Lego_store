"use client";
import React, { useState } from "react";
import CartList from "./(components)/CartList";
import CartSummary from "./(components)/CartSummary";

export default function CartPage() {
  const [items, setItems] = useState([
    {
      id: 1,
      name: "Đò chơi Lego",
      image: "/images/lego1.jpg",
      price: 560000,
      quantity: 2,
    },
    {
      id: 2,
      name: "Đò chơi Lego",
      image: "/images/lego1.jpg",
      price: 560000,
      quantity: 2,
    },
  ]);
  const handleQuantityChange = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };
  const handleRemove = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <div className="max-w-6xl text-black mx-auto p-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8  ">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-4">Giỏ Hàng</h1>
          <CartList
            items={items}
            onRemove={handleRemove}
            onQuanlityChange={handleQuantityChange}
          />
        </div>
        <CartSummary total={total} />
      </div>
    </>
  );
}
