export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
    const token = localStorage.getItem("access_token");
    const headers = {
        ...(init.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(input, { ...init, headers });
    console.log("Fetch URL:", input);
    if (res.status === 401) {
        // Tự động logout khi token hết hạn
        localStorage.removeItem("access_token");
        // Nếu dùng zustand:
        try {
            const { useUserStore } = await import("@/context/authStore.store");
            useUserStore.getState().clearUser();
        } catch { }
        window.location.href = "/auth/login";
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
    }
    return res;
} 