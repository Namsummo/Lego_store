import { viPhieuGiamGia } from "@/components/types/viPhieuGiam-types";

const API_URL = "http://localhost:8080/api/lego-store/vi-phieu-giam-gia";

export const viPhieuGiamService = {
    async themPhieuGiamChoUser(data: { userId: number; phieuGiamGiaId: number }) {
        const res = await fetch("http://localhost:8080/api/lego-store/vi-phieu-giam-gia/them", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error("Không thể thêm phiếu giảm giá: " + JSON.stringify(error));
        }

        return res.json();
    },
    async layPhieuGiamTheoUser(userId: number, trangThai: string = "active") {
        const res = await fetch(`${API_URL}/user/${userId}?trangThai=${trangThai}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error("Không thể lấy phiếu giảm giá cho user: " + JSON.stringify(error));
        }

        return res.json() as Promise<viPhieuGiamGia[]>;
    }
};