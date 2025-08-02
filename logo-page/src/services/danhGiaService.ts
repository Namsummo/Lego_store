import { DanhGiaResponse, CreateDanhGiaDTO } from "@/components/types/danhGia-type";
import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/lego-store/danh-gia";

export const danhGiaService = {
    async getBySanPham(spId: number): Promise<DanhGiaResponse[]> {
        try {
            const res = await fetchWithAuth(`${API_URL}/${spId}`);

            if (!res.ok) {
                throw new Error(`Failed to fetch reviews: ${res.status}`);
            }

            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("❌ Error fetching reviews:", error);
            return [];
        }
    },

    async getAllReviews(): Promise<DanhGiaResponse[]> {
        try {
            const res = await fetchWithAuth(`${API_URL}/getAll`);

            if (!res.ok) {
                throw new Error(`Failed to fetch all reviews: ${res.status}`);
            }

            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("❌ Error fetching all reviews:", error);
            return [];
        }
    },

    async createWithImages(data: CreateDanhGiaDTO, images: File[], video?: File): Promise<DanhGiaResponse> {
        try {
            const formData = new FormData();
            formData.append('tieuDe', data.tieuDe);
            formData.append('textDanhGia', data.textDanhGia);
            formData.append('soSao', data.soSao.toString());
            formData.append('user_id', data.user_id.toString());
            formData.append('sp_id', data.sp_id.toString());

            if (images.length > 0) {
                images.forEach((image) => {
                    formData.append('fileAnh', image);
                });
            }

            if (video) {
                formData.append('fileVid', video);
            }

            const res = await fetchWithAuth(`${API_URL}/CreateWithFileImages`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Lỗi khi tạo đánh giá");
            }

            return await res.json();
        } catch (error) {
            console.error("❌ Error creating review:", error);
            throw error;
        }
    },

    async update(idDanhGia: number, idNv: number, phanHoi: string): Promise<DanhGiaResponse> {
        try {
            // Validation
            if (!idDanhGia || !idNv) {
                throw new Error("Thiếu thông tin cần thiết để cập nhật đánh giá");
            }

            // Nếu phản hồi rỗng hoặc chỉ có khoảng trắng, coi như xóa phản hồi
            const trimmedPhanHoi = phanHoi.trim();

            // Kiểm tra độ dài nếu có nội dung
            if (trimmedPhanHoi.length > 0 && trimmedPhanHoi.length > 1000) {
                throw new Error("Phản hồi không được vượt quá 1000 ký tự");
            }

            const formData = new FormData();
            formData.append('phanHoi', trimmedPhanHoi);

            const res = await fetchWithAuth(`${API_URL}/update/${idDanhGia}/${idNv}`, {
                method: 'PUT',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Lỗi khi cập nhật đánh giá");
            }

            return await res.json();
        } catch (error) {
            console.error("❌ Error updating review:", error);
            throw error;
        }
    },

    async delete(idDanhGia: number, idNv: number): Promise<string> {
        try {
            // Validation
            if (!idDanhGia || !idNv) {
                throw new Error("Thiếu thông tin cần thiết để xóa đánh giá");
            }

            const res = await fetchWithAuth(`${API_URL}/delete/${idDanhGia}/${idNv}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Lỗi khi xóa đánh giá");
            }

            const result = await res.json();
            return result.message || "Xóa đánh giá thành công";
        } catch (error) {
            console.error("❌ Error deleting review:", error);
            throw error;
        }
    },

    getImageUrl(fileName: string): string {
        return `${API_URL}/images/${fileName}`;
    },

    getVideoUrl(fileName: string): string {
        return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/lego-store/danh-gia/videos/${fileName}`;
    },


};