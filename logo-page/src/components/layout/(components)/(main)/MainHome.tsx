"use client";
import { useSanPham } from "@/hooks/useSanPham";
import React from "react";
import SanPhamList from "./SanPhamList";
import Navbar from "../(pages)/Navbar";
import { useDanhMuc } from "@/hooks/useDanhMuc";
const CATEGORY_NAMES = ["Siêu anh hùng", "Ninjago"];

export default function MainHome() {
  const {
    data: products,
    isLoading: isLoadingProduct,
    error: errorProducts,
  } = useSanPham();
  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: errorCategories,
  } = useDanhMuc();

  //Lấy các danh mục
  const selectedCategories = categories
    ? categories.filter((cat) => CATEGORY_NAMES.includes(cat.tenDanhMuc))
    : [];

  // Lọc sản phẩm theo danh mục id
  const productByCategory = (categoryID: number) =>
    products
      ? products.filter((product) => product.danhMucId === categoryID)
      : [];

  return (
    <div className="text-black ">
      <Navbar />
      <div className="items-center font-bold text-center text-3xl mt-2">
        Những sản phẩm nổi bật
      </div>
      {isLoadingCategories || isLoadingProduct ? (
        <div>Loading...</div>
      ) : errorCategories || errorProducts ? (
        <div>
          Error: {errorCategories?.message} || {errorCategories?.message} ||
        </div>
      ) : (
        selectedCategories.map((category) => (
          <div key={category.id} className="px-5 mt-10">
            <h1 className="text-xl font-bold mb-2">{category.tenDanhMuc}</h1>
            <SanPhamList products={productByCategory(category.id)} />
          </div>
        ))
      )}
    </div>
  );
}
