"use client";
import Link from "next/link";
import { SearchIcon, ShoppingCart, Heart, Gamepad2 } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useSearchStore } from "@/context/useSearch.store";
import { useUserStore } from "@/context/authStore.store";
import UserDropDown from "./UserDropDown";
import { useState, useEffect } from "react";

export default function Header() {
  const { keyword, setKeyword } = useSearchStore();
  const router = useRouter();
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const getCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
        setCartCount(cart.length); // chỉ đếm số loại sản phẩm
      } catch (error) {
        console.error("Lỗi khi đọc giỏ hàng:", error);
        setCartCount(0);
      }
    };

    getCartCount();
    window.addEventListener("storage", getCartCount);
    window.addEventListener("cartUpdated", getCartCount);

    return () => {
      window.removeEventListener("storage", getCartCount);
      window.removeEventListener("cartUpdated", getCartCount);
    };
  }, []);

  const handleSearch = () => {
    if (pathname !== "/product") {
      router.push("/product");
    }
  };
  console.log(user);

  return (
    <header className="bg-orange-300">
      <div className=" container mx-auto flex h-24 items-center justify-between px-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/" className="flex items-center  gap-2">
            <div className="relative h-12 w-12">
              <Image
                src="/images/logoM.jpg"
                alt="MyKingDom Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold text-black max-w-[150px]">
              LEGO MYKINGDOM
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-6">
          {/* Thanh tìm kiếm */}
          <div className="relative flex gap-2 lego-search-container">
            <Input
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="lego-search-input italic text-black"
            />
            <Button
              onClick={handleSearch}
              className="lego-search-button"
              size="icon"
            >
              <SearchIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Game Button */}
          <Button
            className="lego-login-button"
            size="icon"
            onClick={() => router.push("/caro")}
            title="Chơi cờ caro"
          >
            <Gamepad2 className="h-5 w-5" />
          </Button>

          {user && (
            <Button
              className="lego-login-button"
              size="icon"
              onClick={() => router.push("/account/favorites")}
            >
              <Heart className="h-5 w-5" />
            </Button>
          )}
          {pathname !== "/cart" && (
            <Button
              className="lego-login-button"
              onClick={() => router.push("/cart")}
            >
              <div className="relative">
                <ShoppingCart />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {cartCount}
                  </span>
                )}
              </div>
            </Button>
          )}

          {user ? (
            <UserDropDown />
          ) : (
            <Button className="lego-login-button">
              <Link href="/auth/login" className="lego-button-text">
                Đăng nhập
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
