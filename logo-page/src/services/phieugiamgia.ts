import { fetchWithAuth } from "./fetchWithAuth";
import {
  ChitietPhieuGiamGia,
  PhieuGiamGia,
  PhieuGiamGiaCreate,
} from "@/components/types/phieugiam.type";

const API_URL = "http://localhost:8080/api/phieugiamgia";

export const phieuGiamGiaService = {
  async getPhieuGiamGia(): Promise<PhieuGiamGia[]> {
    const res = await fetchWithAuth(`${API_URL}/ReadAll`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không tìm thấy phiếu giảm giá");
    return res.json();
  },

  async addPhieuGiamGia(data: PhieuGiamGiaCreate): Promise<PhieuGiamGia> {
    const res = await fetchWithAuth(`${API_URL}/Create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Không thể thêm phiếu giảm giá: ${errorText}`);
    }
    return res.json();
  },
  async suaPhieuGiamGia(id: number, data: PhieuGiamGia): Promise<PhieuGiamGia> {
    const res = await fetchWithAuth(`${API_URL}/Update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể sửa phiếu giảm giá");
    return res.json();
  },

  async xoaPhieuGiamGia(id: number): Promise<void> {
    const res = await fetchWithAuth(`${API_URL}/Delete/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể xóa phiếu giảm giá");
  },

  async getChitietPhieuGiamGia(id: number): Promise<ChitietPhieuGiamGia> {
    const res = await fetchWithAuth(`${API_URL}/getDetail/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        "getChiTietPhieuKhuyenMai - API error:",
        res.status,
        errorText
      );
      throw new Error("Không thể lấy chi tiết phiếu giảm giá");
    }
    const data = await res.json();
    return data;
  },

  async getPhieuGiamGiaNoiBat(): Promise<PhieuGiamGia[]> {
    const res = await fetchWithAuth(`${API_URL}/get-phieu-noi-bat?isNoiBat=1`, {
      cache: "no-store",
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Lỗi khi lấy phiếu giảm giá nổi bật:", errorText);
      throw new Error("Không thể lấy phiếu giảm giá nổi bật");
    }
    return res.json();
  },
};
