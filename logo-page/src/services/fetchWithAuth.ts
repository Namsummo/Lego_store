// Function kiểm tra token có hợp lệ không
function isTokenValid(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp > currentTime;
    } catch {
        return false;
    }
}

// Function refresh token
async function refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    try {
        const response = await fetch("http://localhost:8080/api/lego-store/auth/refresh", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("access_token", data.access_token);
            if (data.refresh_token) {
                localStorage.setItem("refresh_token", data.refresh_token);
            }
            return data.access_token;
        }
    } catch (error) {
        console.error("Lỗi khi refresh token:", error);
    }
    return null;
}

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
    let token = localStorage.getItem("access_token");


    // Kiểm tra token có tồn tại không
    if (!token) {
        console.error("Không tìm thấy access token");
        throw new Error("Bạn cần đăng nhập để thực hiện thao tác này");
    }

    // Kiểm tra token có hết hạn không
    if (!isTokenValid(token)) {
        console.log("Token hết hạn, đang thử refresh...");
        const newToken = await refreshToken();
        if (newToken) {
            token = newToken;
            console.log("Refresh token thành công");
        } else {
            // Refresh thất bại, logout
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            try {
                const { useUserStore } = await import("@/context/authStore.store");
                useUserStore.getState().clearUser();
            } catch { }
            window.location.href = "/auth/login";
            throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
        }
    }

    const headers = {
        ...(init.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };


    const res = await fetch(input, { ...init, headers });
    if (res.status === 401) {
        // Tự động logout khi token hết hạn
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        // Nếu dùng zustand:
        try {
            const { useUserStore } = await import("@/context/authStore.store");
            useUserStore.getState().clearUser();
        } catch { }
        window.location.href = "/auth/login";
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
    }

    if (res.status === 400) {
        // Xử lý lỗi 400 Bad Request (thường là Authentication failed)
        let errorMessage = "Lỗi xác thực";
        try {
            const errorData = await res.json();
            console.log("🚨 400 Error data:", errorData);
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
            const textError = await res.text();
            console.log("🚨 400 Text error:", textError);
            errorMessage = textError || errorMessage;
        }
        throw new Error(errorMessage);
    }

    if (res.status === 403) {
        // Xử lý lỗi 403 Forbidden
        let errorMessage = "Bạn không có quyền thực hiện thao tác này";
        try {
            const errorData = await res.json();
            console.log("🚨 403 Error data:", errorData);
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
            const textError = await res.text();
            console.log("🚨 403 Text error:", textError);
            errorMessage = textError || errorMessage;
        }
        throw new Error(errorMessage);
    }

    return res;
} 