import {
  HoaDonDTO,
  CreateHoaDonDTO,
  HoaDonChiTietDTO,
  TrangThaiHoaDon,
} from "@/components/types/hoaDon-types";
import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = "http://localhost:8080/api/lego-store/hoa-don";

// Đặt ngoài object HoaDonService
export async function getCurrentUserId(): Promise<number | null> {
  // Ưu tiên lấy từ 'lego-store', sau đó thử 'auth', sau đó 'state'
  let state = localStorage.getItem("lego-store");
  if (!state) state = localStorage.getItem("auth");
  if (!state) state = localStorage.getItem("state");
  if (state) {
    try {
      const parsedState = JSON.parse(state);
      // Ưu tiên lấy từ .state.user.id nếu có, sau đó user.id, sau đó id
      const id =
        parsedState.state?.user?.id ||
        parsedState.user?.id ||
        parsedState.id ||
        null;
      console.log("Lấy id nhân viên từ localStorage:", id);
      return id;
    } catch (error) {
      console.error("Lỗi khi phân tích cú pháp localStorage:", error);
      return null;
    }
  }
  console.error("Không tìm thấy thông tin user trong localStorage");
  return null;
}

export const HoaDonService = {
  // Create new order
  async createHoaDon(orderData: CreateHoaDonDTO): Promise<HoaDonDTO> {
    try {
      console.log("Sending order data:", orderData);
      const res = await fetchWithAuth(`${API_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        let errorMessage = "Không thể tạo hóa đơn";
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          errorMessage = Array.isArray(errorData)
            ? errorData.join(", ")
            : errorData.message || JSON.stringify(errorData);
        } else {
          const errorText = await res.text();
          errorMessage = errorText || "Không thể tạo hóa đơn";
        }
        throw new Error(errorMessage);
      }

      return await res.json();
    } catch (error) {
      console.error("Lỗi tạo hóa đơn:", error);
      throw error;
    }
  },

  async getAllHoaDons(): Promise<HoaDonDTO[]> {
    try {
      const res = await fetchWithAuth(`${API_URL}/get-all-hoa-don`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Không thể tải danh sách hóa đơn");
      }

      return await res.json();
    } catch (error) {
      console.error("Lỗi:", error);
      throw error;
    }
  },

  // Hàm lấy tất cả hóa đơn (có phân trang)
  async getPagedHoaDons(
    page: number = 0,
    size: number = 10
  ): Promise<{
    content: HoaDonDTO[];
    totalPages: number;
    totalElements: number;
    number: number;
  }> {
    try {
      const res = await fetchWithAuth(
        `${API_URL}/paging?page=${page}&size=${size}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error("Không thể tải danh sách hóa đơn");
      }

      return await res.json();
    } catch (error) {
      console.error("Lỗi:", error);
      throw error;
    }
  },

  // Lấy chi tiết hóa đơn theo ID
  async getHoaDonById(id: number) {
    const res = await fetchWithAuth(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Không thể lấy chi tiết hóa đơn");
    return res.json();
  },
  ///  update trangg thai

  async updateTrangThai(
    ids: number | number[], // Cho phép truyền 1 ID hoặc nhiều ID
    trangThai: keyof typeof TrangThaiHoaDon | string
  ): Promise<any> {
    try {
      const nvId = await getCurrentUserId();
      if (!nvId) {
        throw new Error("Không tìm thấy nhân viên đang đăng nhập. Vui lòng đăng nhập lại.");
      }

      // Kiểm tra trạng thái hợp lệ
      const validStatuses = Object.values(TrangThaiHoaDon);
      if (!validStatuses.includes(trangThai)) {
        throw new Error(
          `Trạng thái không hợp lệ: ${trangThai}. Các trạng thái hợp lệ: ${validStatuses.join(", ")}`
        );
      }

      // Luôn đảm bảo gửi dạng mảng
      const hoaDonIds = Array.isArray(ids) ? ids : [ids];

      const requestBody = {
        hoaDonIds,
        trangThai,
        idNV: nvId,
      };

      const res = await fetchWithAuth(`${API_URL}/trang-thai`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        let errorMessage = "Cập nhật trạng thái hóa đơn thất bại";
        if (contentType?.includes("application/json")) {
          const errorData = await res.json();
          errorMessage = errorData?.message || JSON.stringify(errorData);
        } else {
          errorMessage = await res.text();
        }
        throw new Error(errorMessage);
      }

      // BE có thể trả về object { thanhCong: [...], loi: [...] }
      return await res.json();
    } catch (error) {
      console.error(`Lỗi khi cập nhật trạng thái hóa đơn [${ids}]:`, error);
      throw error;
    }
  },


  async getStatusCounts(): Promise<Record<string, number>> {
    const res = await fetchWithAuth(`${API_URL}/status-count`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể lấy thống kê trạng thái");
    return res.json();
  },

  async getChiTietSanPhamByHoaDonId(id: number): Promise<HoaDonChiTietDTO[]> {
    const res = await fetchWithAuth(
      `http://localhost:8080/api/lego-store/hoa-don-chi-tiet/hoaDon/${id}`
    );
    if (!res.ok) throw new Error("Không thể lấy chi tiết sản phẩm hóa đơn");
    return res.json();
  },

  // Lấy lịch sử mua hàng của user
  async getHoaDonByUserId(userId: number): Promise<HoaDonDTO[]> {
    try {
      const res = await fetchWithAuth(`${API_URL}/user/${userId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Không thể tải lịch sử mua hàng");
      }

      return await res.json();
    } catch (error) {
      console.error("Lỗi:", error);
      throw error;
    }
  },

  async getPhiShip(
    diaChi: string,
    isFast: number = 0
  ): Promise<{ phiShip: number; soNgayGiao: number }> {
    const params = new URLSearchParams();
    params.append("diaChi", diaChi);
    params.append("isFast", isFast.toString());

    const url = `${API_URL}/get-phi-ship?${params.toString()}`;

    const res = await fetchWithAuth(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      let errorMessage = "Không thể lấy phí ship";
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || JSON.stringify(errorData);
      } catch {
        const text = await res.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return res.json();
  },
};
