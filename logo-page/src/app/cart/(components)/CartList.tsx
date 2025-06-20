import React from "react";
import CartItem from "./CartItem";

interface Item {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}
interface CartListProps {
  items: Item[];
  onRemove: (id: number) => void;
  onQuanlityChange: (id: number, delta: number) => void;
}
export default function CartList({
  items,
  onRemove,
  onQuanlityChange,
}: CartListProps) {
  return (
    <div className="space-y-6">
      {items.map((item) => (
        <CartItem
          key={item.id}
          {...item}
          onRemove={onRemove}
          onQuantityChange={onQuanlityChange}
        />
      ))}
    </div>
  );
}
