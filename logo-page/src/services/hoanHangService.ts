import { PhieuHoanHang, PhieuHoanHangDTO, TrangThaiPhieuHoan, TrangThaiThanhToan } from "@/components/types/hoanHang-types";
import { fetchWithAuth } from "./fetchWithAuth";




const API_URL = "http://localhost:8080/api/lego-store/hoan-hang";

export const hoanHangService = {

    async taophieu(dto: PhieuHoanHangDTO): Promise<PhieuHoanHang> {
        const res = await fetchWithAuth(`${API_URL}/tao-phieu`, {
            method: "Post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto),
        })
        if (!res.ok) {
            let message = "khong the tao phieu hoan don hang";
            try {
                const errordata = res.json();
                JSON.stringify(errordata)
            } catch {
                message = await res.text();
            }
            throw new Error(message);
        }
        return res.json();
    },

    // Duyệt phiếu hoàn hàng
    async duyet(id: number): Promise<string> {
        const res = await fetchWithAuth(`${API_URL}/${id}/duyet`, {
            method: "PUT",
        });

        if (!res.ok) {
            let message = "Không thể duyệt phiếu hoàn hàng";
            try {
                const errorData = await res.json();
                message = errorData.message || JSON.stringify(errorData);
            } catch {
                message = await res.text();
            }
            throw new Error(message);
        }

        return res.text();
    },

    // Từ chối phiếu hoàn hàng
    async tuChoi(id: number, lyDo: string): Promise<string> {
        const url = `${API_URL}/${id}/tu-choi?lyDo=${encodeURIComponent(lyDo)}`;

        const res = await fetchWithAuth(url, { method: "PUT" });

        if (!res.ok) {
            let message = "Không thể từ chối phiếu hoàn hàng";
            try {
                const errorData = await res.json();
                message = errorData.message || JSON.stringify(errorData);
            } catch {
                message = await res.text();
            }
            throw new Error(message);
        }

        return res.text();
    },

    // Cập nhật trạng thái thanh toán
    async capNhatThanhToan(
        id: number,
        trangThai: TrangThaiThanhToan
    ): Promise<string> {
        const url = `${API_URL}/${id}/thanh-toan?trangThai=${trangThai}`;

        const res = await fetchWithAuth(url, { method: "PUT" });

        if (!res.ok) {
            let message = "Không thể cập nhật trạng thái thanh toán";
            try {
                const errorData = await res.json();
                message = errorData.message || JSON.stringify(errorData);
            } catch {
                message = await res.text();
            }
            throw new Error(message);
        }

        return res.text();
    },

    // Lấy danh sách phiếu hoàn hàng theo trạng thái
    async getByTrangThai(
        trangThai: TrangThaiPhieuHoan
    ): Promise<PhieuHoanHang[]> {
        const res = await fetchWithAuth(`${API_URL}/trang-thai/${trangThai}`, {
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Không thể lấy danh sách phiếu hoàn hàng");

        return res.json();
    },

    // Lấy phiếu hoàn hàng theo hóa đơn
    async getByHoaDon(idHoaDon: number): Promise<PhieuHoanHang[]> {
        const res = await fetchWithAuth(`${API_URL}/hoa-don/${idHoaDon}`, {
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Không thể lấy phiếu hoàn hàng theo hóa đơn");

        return res.json();
    },

    // Kiểm tra có thể hoàn hàng hay không
    async kiemTraCoTheHoanHang(
        idHoaDon: number
    ): Promise<{ coTheHoanHang: boolean }> {
        const res = await fetchWithAuth(`${API_URL}/kiem-tra/${idHoaDon}`);

        if (!res.ok) throw new Error("Không thể kiểm tra hoàn hàng");

        return res.json();
    },


};
