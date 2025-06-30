// services/khuyenMaiService.ts
import {
  KhuyenMaiDTO,
  KhuyenMaiSanPhamDTO,
  KhuyenMaiTheoSanPham,
} from "@/components/types/khuyenmai-type";

export interface KhuyenMaiPayLoad {
  tenKhuyenMai: string;
  phanTramKhuyenMai: number;
  ngayBatDau: string;
  ngayKetThuc: string;
}

const API_URL = "http://localhost:8080/api/khuyenmai";
const API_URL_KM = "http://localhost:8080/api/lego-store/khuyen-mai-san-pham";
const API_URL_SP_List = "http://localhost:8080/api/sanpham";

export const khuyenMaiService = {
  async getKhuyenMai(): Promise<KhuyenMaiDTO[]> {
    const res = await fetch(`${API_URL}/ReadAll`, { cache: "no-store" });
    if (!res.ok) throw new Error("Không tìm thấy danh sách khuyến mãi");
    return res.json();
  },

  async getKhuyenMaiID(id: number): Promise<KhuyenMaiDTO> {
    const res = await fetch(`${API_URL}/ReadOne/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Không tìm thấy khuyến mãi");
    return res.json();
  },

  async addKhuyenMai(data: KhuyenMaiPayLoad): Promise<KhuyenMaiPayLoad> {
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
        throw new Error("Không thể thêm khuyến mãi ");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi thêm :", error);
      throw error;
    }
  },

  async suaKhuyenMai(id: number, data: KhuyenMaiDTO): Promise<KhuyenMaiDTO> {
    const res = await fetch(`${API_URL}/Update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể sửa khuyến mãi");
    return res.json();
  },

  async xoaKhuyenMai(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/Delete/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể xóa khuyến mãi");
  },

  //
  async ThemKhuyenMaiVaoSanPham(
    data: KhuyenMaiSanPhamDTO
  ): Promise<KhuyenMaiSanPhamDTO | string> {
    try {
      const res = await fetch(`${API_URL_KM}/apply-Khuyen-mai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        cache: "no-store",
      });
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await res.json();
      } else {
        return await res.text();
      }
    } catch (error) {
      console.error("Lỗi thêm sản phẩm:", error);
      throw error;
    }
  },
  // Get All List SanPham theo khuyến mãi
  async ListSanPhamTheoKhuyenMai(): Promise<KhuyenMaiTheoSanPham[]> {
    try {
      const res = await fetch(`${API_URL_SP_List}/ReadAllV2`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Không tìm thấy danh sách sản phẩm");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi:", error);
      throw error;
    }
  },
};
