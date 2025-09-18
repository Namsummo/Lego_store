"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUserStore } from "@/context/authStore.store";

export default function SocialCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loadingText, setLoadingText] = useState("Đang xử lý đăng nhập...");

  useEffect(() => {
    const code = searchParams.get("code");
    const provider = window.location.pathname.includes("google")
      ? "google"
      : "facebook";

    if (!code) {
      setLoadingText("Lỗi: Không tìm thấy mã xác thực");
      setTimeout(() => {
        router.push("/auth/login?error=no-code");
      }, 2000);
      return;
    }

    const fetchToken = async () => {
      try {
        setLoadingText(
          `Đang xác thực với ${
            provider === "google" ? "Google" : "Facebook"
          }...`
        );

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/lego-store/user/auth/social/callback?code=${code}&login-type=${provider}`
        );

        if (!res.ok) throw new Error(`Lỗi callback ${provider}`);

        const data = await res.json();

        setLoadingText("Đang lưu thông tin tài khoản...");

        // Lưu token & user info vào localStorage
        useUserStore.getState().setUser({
          id: data.id,
          ten: data.ten,
          email: data.email,
          sdt: data.sdt ?? "",
          ngaySinh: data.ngaySinh ?? "",
          diaChi: data.diaChi ?? "",
          roleId: data.roleId,
          message: data.message,
          token: data.token,
          diemTichLuy: data.diemTichLuy ?? 0,
        });

        localStorage.setItem("access_token", data.token);

        setLoadingText("Đăng nhập thành công! Đang chuyển hướng...");

        setTimeout(() => {
          router.push("/"); // hoặc dashboard tùy role
        }, 1000);
      } catch (error) {
        console.error("Social login callback error:", error);
        setLoadingText("Đăng nhập thất bại!");
        setTimeout(() => {
          router.push("/auth/login?error=social-failed");
        }, 2000);
      }
    };

    fetchToken();
  }, [searchParams, router]);

  const getProviderIcon = () => {
    const provider = window.location.pathname.includes("google")
      ? "google"
      : "facebook";

    if (provider === "google") {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-8 h-8 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    }
  };

  const getProviderColor = () => {
    const provider = window.location.pathname.includes("google")
      ? "google"
      : "facebook";
    return provider === "google"
      ? "from-red-500 to-yellow-500"
      : "from-blue-600 to-blue-700";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        {/* Provider Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`w-16 h-16 bg-gradient-to-r ${getProviderColor()} rounded-full flex items-center justify-center`}
          >
            {getProviderIcon()}
          </div>
        </div>

        {/* Loading animation */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-1">
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>

        {/* Dynamic text */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {loadingText}
          </h3>
          <p className="text-gray-600 text-sm">
            Vui lòng chờ trong giây lát...
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            Bảo mật SSL
          </div>
        </div>
      </div>
    </div>
  );
}
