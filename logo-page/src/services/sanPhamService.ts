// src/services/sanPhamService.ts

import { AnhSanPham, SanPham } from "@/components/types/product.type";

const API_URL = "http://localhost:8080/api";

export const sanPhamService = {
  async getSanPhams(): Promise<SanPham[]> {
    try {
      const res = await fetch(`${API_URL}/sanpham/ReadAll`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Không tìm thấy danh sách sản phẩm");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi:", error);
      throw error;
    }
  },

  async getSanPhamID(id: number): Promise<SanPham> {
    try {
      const res = await fetch(`${API_URL}/sanpham/ReadOne/${id}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Không tìm thấy sản phẩm với ID ${id}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`Lỗi ID ${id}:`, error);
      throw error;
    }
  },

  async getAnhSanPhams(maSanPham: number): Promise<AnhSanPham[]> {
    try {
      const res = await fetch(`${API_URL}/anhsp?maSanPham=${maSanPham}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`Không tìm thấy ảnh của sản phẩm với mã ${maSanPham}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`Lỗi lấy ảnh sản phẩm với mã ${maSanPham}:`, error);
      throw error;
    }
  },
};
