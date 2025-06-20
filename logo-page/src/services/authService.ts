interface LoginResponse {
  id: number;
  ten: string;
  email: string;
  message: string;
}

interface RegisterResponse {
  message: string;
}

const API_BASE_URL = "http://localhost:8080/api/lego-store/user";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Đã có lỗi xảy ra");
  }
  return data;
}

export const authenService = {
  // Đăng ký
  async register(
    user_name: string,
    email: string,
    matKhau: string
  ): Promise<RegisterResponse> {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        ten: user_name,
        email,
        matKhau,
      }),
    });

    return handleResponse<RegisterResponse>(res);
  },

  // Đăng nhập
  async login(email: string, matKhau: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, matKhau }),
    });

    return handleResponse<LoginResponse>(res);
  },
};
