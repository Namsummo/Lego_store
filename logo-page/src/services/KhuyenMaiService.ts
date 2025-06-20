import { KhuyenMai } from "@/components/types/khuyenmai-type";

// Đảm bảo URL API đúng
const API_URL = "http://localhost:8080/api/khuyenmai";

// Hàm chuyển đổi định dạng ngày từ yyyy-MM-dd sang dd-MM-yyyy
const formatDateForAPI = (dateString: string): string => {
  if (!dateString) return "";
  
  try {
    // Chuyển từ yyyy-MM-dd sang dd-MM-yyyy
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    
    // Đảm bảo định dạng dd-MM-yyyy
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  } catch (error) {
    console.error("Lỗi chuyển đổi ngày:", error);
    return dateString;
  }
};

export const KhuyenMaiService = {
  async getKhuyenMai(): Promise<KhuyenMai[]> {
    try {
      const res = await fetch(`${API_URL}/ReadAll`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Không tìm thấy danh sách khuyến mãi");
      }
      return await res.json();
    } catch (error) {
      console.error("Lỗi:", error);
      throw error;
    }
  },

  async getKhuyenMaiID(id: number): Promise<KhuyenMai> {
    try {
      const res = await fetch(`${API_URL}/ReadOne/${id}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Không tìm thấy khuyến mãi với ID ${id}`);
      }
      return await res.json();
    } catch (error) {   
      console.error(`Lỗi ID ${id}:`, error);
      throw error;
    }
  },

  async addKhuyenMai(data: KhuyenMai): Promise<KhuyenMai> {
    try {
      // Tạo bản sao của dữ liệu để không ảnh hưởng đến dữ liệu gốc
      const formattedData = {
        ...data,
        ngayBatDau: formatDateForAPI(data.ngayBatDau),
        ngayKetThuc: formatDateForAPI(data.ngayKetThuc)
      };
      
      console.log("Đang gửi dữ liệu:", JSON.stringify(formattedData));
      const res = await fetch(`${API_URL}/Create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
        cache: "no-store",
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Lỗi response:", errorText);
        throw new Error(`Không thể thêm khuyến mãi: ${res.status} ${errorText}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error("Lỗi thêm khuyến mãi:", error);
      throw error;
    }
  },

  async updateKhuyenMai(id: number, data: KhuyenMai): Promise<KhuyenMai> {
    try {
      // Tạo bản sao của dữ liệu để không ảnh hưởng đến dữ liệu gốc
      const formattedData = {
        ...data,
        ngayBatDau: formatDateForAPI(data.ngayBatDau),
        ngayKetThuc: formatDateForAPI(data.ngayKetThuc)
      };
      
      console.log("Đang cập nhật dữ liệu:", id, JSON.stringify(formattedData));
      console.log("Định dạng ngày:", formattedData.ngayBatDau, formattedData.ngayKetThuc);
      
      const res = await fetch(`${API_URL}/Update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
        cache: "no-store",
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Lỗi response:", errorText);
        throw new Error(`Không thể cập nhật khuyến mãi: ${res.status} ${errorText}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error("Lỗi cập nhật khuyến mãi:", error);
      throw error;
    }
  },

  async xoaKhuyenMai(id: number): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/Delete/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Không thể xóa khuyến mãi: ${res.status} ${errorText}`);
      }
    } catch (error) {
      console.error("Lỗi xóa khuyến mãi:", error);
      throw error;
    }
  },
}
