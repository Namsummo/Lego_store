import { HoaDonDTO, CreateHoaDonDTO, HoaDonChiTietDTO, TrangThaiHoaDon } from "@/components/types/hoaDon-types";
import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = "http://localhost:8080/api/lego-store/hoa-don";

// Đặt ngoài object HoaDonService
export async function getCurrentUserId(): Promise<number | null> {
    // Ưu tiên lấy từ 'lego-store', sau đó thử 'auth', sau đó 'state'
    let state = localStorage.getItem('lego-store');
    if (!state) state = localStorage.getItem('auth');
    if (!state) state = localStorage.getItem('state');
    if (state) {
        try {
            const parsedState = JSON.parse(state);
            // Ưu tiên lấy từ .state.user.id nếu có, sau đó user.id, sau đó id
            const id = parsedState.state?.user?.id || parsedState.user?.id || parsedState.id || null;
            console.log('Lấy id nhân viên từ localStorage:', id);
            return id;
        } catch (error) {
            console.error('Lỗi khi phân tích cú pháp localStorage:', error);
            return null;
        }
    }
    console.error('Không tìm thấy thông tin user trong localStorage');
    return null;
}

export const HoaDonService = {
    // Create new order
    async createHoaDon(orderData: CreateHoaDonDTO): Promise<HoaDonDTO> {
        try {
            console.log('Sending order data:', orderData);
            const res = await fetchWithAuth(`${API_URL}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(orderData),
            });

            if (!res.ok) {
                let errorMessage = 'Không thể tạo hóa đơn';
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await res.json();
                    errorMessage = Array.isArray(errorData)
                        ? errorData.join(', ')
                        : errorData.message || JSON.stringify(errorData);
                } else {
                    const errorText = await res.text();
                    errorMessage = errorText || 'Không thể tạo hóa đơn';
                }
                throw new Error(errorMessage);
            }

            return await res.json();
        } catch (error) {
            console.error('Lỗi tạo hóa đơn:', error);
            throw error;
        }
    },

    async getAllHoaDons(): Promise<HoaDonDTO[]> {
        try {
            const res = await fetchWithAuth(`${API_URL}/get-all-hoa-don`, {
                cache: 'no-store',
            });

            if (!res.ok) {
                throw new Error('Không thể tải danh sách hóa đơn');
            }

            return await res.json();
        } catch (error) {
            console.error('Lỗi:', error);
            throw error;
        }
    },

    // Hàm lấy tất cả hóa đơn (có phân trang)
    async getPagedHoaDons(page: number = 0, size: number = 10): Promise<{
        content: HoaDonDTO[];
        totalPages: number;
        totalElements: number;
        number: number;
    }> {
        try {
            const res = await fetchWithAuth(`${API_URL}/paging?page=${page}&size=${size}`, {
                cache: 'no-store',
            });

            if (!res.ok) {
                throw new Error('Không thể tải danh sách hóa đơn');
            }

            return await res.json();
        } catch (error) {
            console.error('Lỗi:', error);
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

    async updateTrangThai(id: number, trangThai: keyof typeof TrangThaiHoaDon | string): Promise<HoaDonDTO> {
        try {
            const nvId = await getCurrentUserId();
            console.log('Current employee ID:', nvId);

            if (!nvId) {
                throw new Error('No logged-in employee found. Please log in again.');
            }

            // Validate trangThai using TrangThaiHoaDon enum values
            const validStatuses = Object.values(TrangThaiHoaDon);
            if (!validStatuses.includes(trangThai)) {
                throw new Error(`Invalid status: ${trangThai}. Valid statuses are: ${validStatuses.join(', ')}`);
            }

            const requestBody = {
                hoaDonIds: [id],
                trangThai,
                idNV: nvId
            };
            console.log('Request body for status update:', requestBody);

            const res = await fetchWithAuth(`${API_URL}/${id}/trang-thai`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('Response status:', res.status);
            console.log('Response headers:', {
                authorization: res.headers.get('authorization'),
                contentType: res.headers.get('content-type')
            });

            if (!res.ok) {
                let errorMessage = 'Failed to update order status';
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await res.json();
                    errorMessage = errorData?.message || JSON.stringify(errorData);
                } else {
                    const errorText = await res.text();
                    errorMessage = errorText || `HTTP ${res.status}: ${res.statusText}`;
                }
                throw new Error(errorMessage);
            }

            try {
                const data = await res.json();
                return data;
            } catch {
                // Fallback if response is not JSON
                return { id, trangThai } as HoaDonDTO;
            }
        } catch (error) {
            console.error(`Error updating status for order ID ${id}:`, error);
            throw error;
        }
    },

    async getStatusCounts(): Promise<Record<string, number>> {
        const res = await fetchWithAuth(`${API_URL}/status-count`, { cache: "no-store" });
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
                cache: 'no-store',
            });

            if (!res.ok) {
                throw new Error('Không thể tải lịch sử mua hàng');
            }

            return await res.json();
        } catch (error) {
            console.error('Lỗi:', error);
            throw error;
        }
    },
};













