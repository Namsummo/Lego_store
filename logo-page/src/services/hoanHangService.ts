import { PhieuHoanHang, PhieuHoanHangDTO, TrangThaiPhieuHoan, TrangThaiThanhToan } from "@/components/types/hoanHang-types";
import { fetchWithAuth } from "./fetchWithAuth";



const API_URL = "http://localhost:8080/api/lego-store/hoan-hang";

// Function test API endpoint
async function testApiEndpoint() {
    try {
        const token = localStorage.getItem("access_token");
        if (!token) {
            console.log("❌ No token for test");
            return false;
        }

        console.log("🧪 Testing API endpoint...");
        const testRes = await fetch("http://localhost:8080/api/lego-store/hoan-hang/trang-thai/CHO_DUYET", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("🧪 Test response status:", testRes.status);
        if (testRes.ok) {
            console.log("✅ API endpoint accessible");
            return true;
        } else {
            console.log("❌ API endpoint not accessible");
            return false;
        }
    } catch (error) {
        console.error("❌ Test API error:", error);
        return false;
    }
}

export const hoanHangService = {

    async taophieu(dto: PhieuHoanHangDTO): Promise<PhieuHoanHang> {
        const res = await fetchWithAuth(`${API_URL}/tao-phieu`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto),
        })
        if (!res.ok) {
            let message = "Không thể tạo phiếu hoàn hàng";
            try {
                const errorData = await res.json();
                message = errorData.message || JSON.stringify(errorData);
            } catch {
                message = await res.text();
            }
            throw new Error(message);
        }
        return res.json();
    },

    // Duyệt phiếu hoàn hàng
    async duyet(id: number): Promise<string> {
        console.log(`🔄 Duyệt phiếu hoàn hàng ID: ${id}`);

        // Debug: Kiểm tra token trước khi gửi
        const token = localStorage.getItem("access_token");
        if (!token) {
            throw new Error("Không tìm thấy token, vui lòng đăng nhập lại");
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log("🔑 Token payload:", payload);
            console.log("⏰ Token exp:", new Date(payload.exp * 1000));
            console.log("👤 User role:", payload.role || payload.roles || payload.authorities);
        } catch (error) {
            console.error("❌ Lỗi khi parse token:", error);
        }

        // Test API endpoint trước
        const canAccess = await testApiEndpoint();
        if (!canAccess) {
            throw new Error("Không thể truy cập API, vui lòng kiểm tra token và quyền");
        }

        const res = await fetchWithAuth(`${API_URL}/${id}/duyet`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log(`Response status cho duyet: ${res.status}`);

        if (!res.ok) {
            let message = "Không thể duyệt phiếu hoàn hàng";
            try {
                const errorData = await res.json();
                message = errorData.message || errorData.error || JSON.stringify(errorData);
                console.error("Error data từ duyet:", errorData);
            } catch {
                const textError = await res.text();
                message = textError || message;
                console.error("Text error từ duyet:", textError);
            }
            throw new Error(message);
        }

        // Sửa ở đây: lấy message từ object trả về
        const data = await res.json();
        console.log("Success data từ duyet:", data);
        return data.message || "Duyệt phiếu hoàn hàng thành công";
    },

    // Từ chối phiếu hoàn hàng
    async tuChoi(id: number, lyDo: string): Promise<string> {
        console.log(`Từ chối phiếu hoàn hàng ID: ${id}, Lý do: ${lyDo}`);

        const url = `${API_URL}/${id}/tu-choi?lyDo=${encodeURIComponent(lyDo)}`;

        const res = await fetchWithAuth(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log(`Response status cho tuChoi: ${res.status}`);

        if (!res.ok) {
            let message = "Không thể từ chối phiếu hoàn hàng";
            try {
                const errorData = await res.json();
                message = errorData.message || errorData.error || JSON.stringify(errorData);
                console.error("Error data từ tuChoi:", errorData);
            } catch {
                const textError = await res.text();
                message = textError || message;
                console.error("Text error từ tuChoi:", textError);
            }
            throw new Error(message);
        }

        // Sửa ở đây: lấy message từ object trả về
        const data = await res.json();
        console.log("Success data từ tuChoi:", data);
        return data.message || "Từ chối phiếu hoàn hàng thành công";
    },

    // Cập nhật trạng thái thanh toán
    async capNhatThanhToan(
        id: number,
        trangThai: TrangThaiThanhToan
    ): Promise<string> {
        console.log(`Cập nhật thanh toán phiếu hoàn hàng ID: ${id}, Trạng thái: ${trangThai}`);

        const url = `${API_URL}/${id}/thanh-toan?trangThai=${trangThai}`;

        const res = await fetchWithAuth(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log(`Response status cho capNhatThanhToan: ${res.status}`);

        if (!res.ok) {
            let message = "Không thể cập nhật trạng thái thanh toán";
            try {
                const errorData = await res.json();
                message = errorData.message || errorData.error || JSON.stringify(errorData);
                console.error("Error data từ capNhatThanhToan:", errorData);
            } catch {
                const textError = await res.text();
                message = textError || message;
                console.error("Text error từ capNhatThanhToan:", textError);
            }
            throw new Error(message);
        }

        // Sửa ở đây: lấy message từ object trả về
        const data = await res.json();
        console.log("Success data từ capNhatThanhToan:", data);
        return data.message || "Cập nhật trạng thái thanh toán thành công";
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

    // Tạo phiếu hoàn hàng có file ảnh và video
    async taoPhieu2(
        dto: PhieuHoanHangDTO,
        fileAnh: File[], // hoặc: FileList
        fileVid?: File
    ): Promise<any> {
        // Nếu không có file, sử dụng endpoint đơn giản
        if ((!fileAnh || fileAnh.length === 0) && !fileVid) {
            console.log("Không có file, sử dụng endpoint tao-phieu");
            return this.taophieu(dto);
        }

        const formData = new FormData();

        // Thêm các trường của dto vào formData
        Object.entries(dto).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                // Nếu là chiTietHoanHangs (array object)
                value.forEach((item, idx) => {
                    Object.entries(item).forEach(([k, v]) => {
                        formData.append(`chiTietHoanHangs[${idx}].${k}`, v as any);
                    });
                });
            } else if (value !== undefined && value !== null) {
                formData.append(key, value as any);
            }
        });

        // Thêm file ảnh (nhiều file)
        if (fileAnh && fileAnh.length > 0) {
            fileAnh.forEach((file) => {
                formData.append("fileAnh", file);
            });
        }

        // Thêm file video (nếu có)
        if (fileVid) {
            formData.append("fileVid", fileVid);
        }

        console.log("Gửi request với FormData đến tao-phieu-2");
        const res = await fetchWithAuth(`${API_URL}/tao-phieu-2`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            let message = "Không thể tạo phiếu hoàn hàng (có file)";
            try {
                const errorData = await res.json();
                message = errorData.message || JSON.stringify(errorData);
            } catch {
                message = await res.text();
            }
            throw new Error(message);
        }

        return res.json();
    },

};


