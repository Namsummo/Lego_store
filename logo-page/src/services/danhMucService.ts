import { DanhMuc } from "@/components/types/product.type";

const API_URL = "http://localhost:8080/api/danhmuc";
export const danhMucService = {
  async getDanhMuc(): Promise<DanhMuc[]> {
    try {
      const res = await fetch(`${API_URL}/ReadAll`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Không tìm thấy danh mục");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi" + error);
      throw error;
    }
  },
  //Danh mục chi tiết
  async getDanhMucId(id: number): Promise<DanhMuc> {
    try {
      const res = await fetch(`${API_URL}/ReadOne/${id}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Không tìm thấy danh mục");
      }
      return await res.json();
    } catch (error) {
      throw error;
    }
  },

  //Add
  async addDanhmuc(data: DanhMuc): Promise<DanhMuc> {
    try {
      const res = await fetch(`${API_URL}/Create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Không thể thêm sản phẩm");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi thêm sản phẩm:", error);
      throw error;
    }
  },

  // Sửa
  async editDanhmuc(id: number, data: DanhMuc): Promise<DanhMuc> {
    try {
      const res = await fetch(`${API_URL}/Update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Không thể sửa danh muc");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi sửa danh muc:", error);
      throw error;
    }
  },

  // Xóa
  async xoaDanhMuc(id: number): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/Delete/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Không thể xóa danh múc");
      }
    } catch (error) {
      throw error;
    }
  },
};
