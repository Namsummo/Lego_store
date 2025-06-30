import { HoaDonDTO } from "@/components/types/hoaDon-types";


const API_URL = "http://localhost:8080/api/lego-store/hoa-don";

export const HoaDonService = {
    // Hàm lấy tất cả hóa đơn (có phân trang)
    async getPagedHoaDons(page: number = 0, size: number = 10): Promise<{
        content: HoaDonDTO[];
        totalPages: number;
        totalElements: number;
        number: number;
    }> {
        try {
            const res = await fetch(`${API_URL}/paging?page=${page}&size=${size}`, {
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
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Không thể lấy chi tiết hóa đơn");
        return res.json();
    },

    async updateTrangThai(id: number, trangThai: string) {
        const res = await fetch(`${API_URL}/${id}/trang-thai?trangThai=${trangThai}`, {
            method: "PUT",
        });

        if (!res.ok) throw new Error("Không thể cập nhật trạng thái hóa đơn");
        return res.json();
    },
    // Lấy chi tiết sản phẩm của hóa đơn
    async getChiTietSanPhamByHoaDonId(id: number) {
        const res = await fetch(`http://localhost:8080/api/lego-store/hoa-don-chi-tiet/hoaDon/${id}`);
        if (!res.ok) throw new Error("Không thể lấy chi tiết sản phẩm hóa đơn");
        return res.json();
    },
};
