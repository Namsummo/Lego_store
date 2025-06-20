import Image from "next/image";

interface CartItemProps {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  onRemove: (id: number) => void;
  onQuantityChange: (id: number, delta: number) => void;
}

const CartItem = ({
  id,
  name,
  image,
  price,
  quantity,
  onRemove,
  onQuantityChange,
}: CartItemProps) => {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div className="flex gap-4">
        <Image
          src={image}
          alt={name}
          width={120}
          height={80}
          className="rounded-lg object-contain"
        />
        <div>
          <p className="font-semibold">{name}</p>
          <div className="flex items-center mt-2 space-x-2">
            <span>Số lượng:</span>
            <button
              onClick={() => onQuantityChange(id, -1)}
              className="border rounded-full px-2 text-red-600 font-bold"
            >
              -
            </button>
            <span className="px-2">{quantity}</span>
            <button
              onClick={() => onQuantityChange(id, 1)}
              className="border rounded-full px-2 text-red-600 font-bold"
            >
              +
            </button>
          </div>
          <button
            onClick={() => onRemove(id)}
            className="text-sm text-red-500 mt-2 underline"
          >
            Xoá
          </button>
        </div>
      </div>
      <p className="font-bold text-pink-600">{price.toLocaleString()}đ</p>
    </div>
  );
};

export default CartItem;
