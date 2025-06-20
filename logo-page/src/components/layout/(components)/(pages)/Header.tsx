"use client";
import Link from "next/link";
import { SearchIcon, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useSearchStore } from "@/context/useSearch.store";
import { useUserStore } from "@/context/authStore.store";
import UserDropDown from "./UserDropDown";

export default function Header() {
  const { keyword, setKeyword } = useSearchStore();
  const router = useRouter();
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);

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

          <Button className="lego-login-button">
            <ShoppingCart />
          </Button>
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
