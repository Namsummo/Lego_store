import { AnhSanPhamChiTiet } from "@/components/types/product.type";

const API_URL = "http://localhost:8080/api/anhsp";
export const anhSanPhamSevice = {
  async getAnhSanPham(): Promise<AnhSanPhamChiTiet[]> {
    try {
      const res = await fetch(`${API_URL}/ReadAll`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Không tìm thấy danh sách ảnh sản phẩm");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi: ", error);
      throw error;
    }
  },
  //  Ảnh chi tiết
  async getAnhSanPhamID(id: number): Promise<AnhSanPhamChiTiet> {
    try {
      const res = await fetch(`${API_URL}/Readone/${id}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Không tìm thấy ảnh sản phẩm với ${id}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`Lỗi ID ${id}`, error);
      throw error;
    }
  },

  // Add Ảnh sản phẩm
  async addAnhSanPham(data: {
    files: File[];
    thuTu: number;
    anhChinh: boolean;
    sanPhamId: number;
    moTa?: string;
  }): Promise<AnhSanPhamChiTiet[]> {
    try {
      const formData = new FormData();
      data.files.forEach((file) => formData.append("files", file)); // Sửa thành files
      formData.append("thuTu", data.thuTu.toString());
      formData.append("anhChinh", data.anhChinh.toString());
      formData.append("sanPhamId", data.sanPhamId.toString());
      if (data.moTa) {
        formData.append("moTa", data.moTa);
      }
      const res = await fetch(`${API_URL}/upload-images`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          `HTTP ${res.status}: ${errorData || "Không thể thêm ảnh"}`
        );
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi thêm ảnh: ", error);
      throw error;
    }
  },
  //   Sửa ảnh
  async editAnhSanPham(
    id: number,
    data: {
      file?: File;
      thuTu: number;
      anhChinh: boolean;
      sanPhamId: number;
      moTa?: string;
    }
  ): Promise<AnhSanPhamChiTiet> {
    const formData = new FormData();
    if (data.file) formData.append("file", data.file);
    formData.append("thuTu", data.thuTu.toString());
    formData.append("anhChinh", data.anhChinh.toString());
    formData.append("sanpham", data.sanPhamId.toString());
    if (data.moTa) formData.append("moTa", data.moTa);

    const res = await fetch(`${API_URL}/update-image/${id}`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) throw new Error("Không thể sửa ảnh");
    return res.json();
  },

  //   Xóa
  async deleteAnhSanPham(id: number): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/Delete/${id}`, {
        method: "DELETE",
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Không thể xóa");
      }
      return;
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      throw error;
    }
  },

  // Lấy danh sách ảnh theo sản phẩm
  async getAnhSanPhamTheoSanPhamId(id: number): Promise<AnhSanPhamChiTiet[]> {
    const res = await fetch(`${API_URL}/sanpham/${id}`, {
      credentials: "include",
    });

    if (!res.ok) throw new Error("Không thể tải ảnh theo sản phẩm");
    return res.json();
  },
};
