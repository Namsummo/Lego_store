import { DanhMuc } from "@/components/types/product.type";

const API_URL = "http://localhost:8080/api";
export const danhMucService = {
  async getDanhMuc(): Promise<DanhMuc[]> {
    try {
      const res = await fetch(`${API_URL}/danhmuc/ReadAll`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Không tìm thấy danh mục");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi" + error);
      throw error;
    }
  },
};
