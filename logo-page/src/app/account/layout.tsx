"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactNode, useState, useEffect } from "react";
import { useUserStore } from "@/context/authStore.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { User, ShoppingBag, MapPin, Tag, Lock, Heart, Gift } from "lucide-react";
import Header from "@/components/layout/(components)/(pages)/Header";
import Footer from "@/components/layout/(components)/(pages)/Footer";

const menus = [
  {
    label: "Thông tin tài khoản",
    href: "/account/info",
    icon: User,
    bgColor: "bg-orange-100"
  },
  {
    label: "Đơn hàng",
    href: "/account/history",
    icon: ShoppingBag,
    bgColor: "bg-orange-100"
  },
  {
    label: "Sản phẩm yêu thích",
    href: "/account/favorites",
    icon: Heart,
    bgColor: "bg-red-100"
  },
  {
    label: "Địa chỉ nhận hàng",
    href: "/account/address",
    icon: MapPin,
    bgColor: "bg-orange-100"
  },
  {
    label: "Phiếu giảm giá",
    href: "/account/vouchers",
    icon: Tag,
    bgColor: "bg-orange-100"
  },
  {
    label: "Đổi điểm lấy phiếu",
    href: "/account/exchange-points",
    icon: Gift,
    bgColor: "bg-gradient-to-r from-orange-100 to-red-100"
  },
  {
    label: "Đổi mật khẩu",
    href: "/account/change-password",
    icon: Lock,
    bgColor: "bg-orange-100"
  },
];

export default function Accountlayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);
  const userName = user?.ten || "";
  const currentMenu = menus.find((m) => pathname?.startsWith(m.href));
  const currentLabel = currentMenu?.label || "Tài khoản";
  
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Nếu scroll xuống dưới và vượt quá 100px thì ẩn header
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } 
      // Nếu scroll lên trên thì hiện header
      else if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <Header />
      </div>

      {/* Breadcrumb */}
      <div className="w-full pt-24 relative z-10">
        <div className="bg-gray-200 shadow-sm border-b border-gray-100 p-4">
          <div className="max-w-6xl mx-auto">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Trang Chủ
              </Link>
              <span className="text-gray-400">{">"}</span>
              <span className="text-gray-900 font-medium truncate">
                {currentLabel}
              </span>
            </nav>
          </div>
        </div>
      </div>

      <div className="flex flex-1 h-[calc(40vh-40px)] pt-0"> {/* Fixed height minus header; breadcrumb already offsets header height */}
        {/* Sidebar - User Profile Card - Fixed width */}
        <aside className="w-80 min-w-80 min-h-screen bg-white shadow-sm flex flex-col">
          {/* Back to Home Button */}
          {/* <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              className="w-full justify-start text-sm font-medium h-10 text-gray-600 hover:bg-gray-50 hover:text-orange-600"
            >
              <ArrowLeft className="w-4 h-2 mr-2" />
              Quay lại trang chủ
            </Button>
          </div> */}

          {/* Profile Section - Circular Gradient */}
          <div className="mt-7 bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500 p-6 text-white relative overflow-hidden flex-shrink-0 rounded-full w-56 h-56 mx-auto flex flex-col items-center justify-center text-center">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full opacity-20"></div>
              <div className="absolute bottom-8 left-8 w-12 h-12 bg-white rounded-full opacity-15"></div>
              <div className="absolute top-1/2 right-8 w-8 h-8 bg-white rounded-full opacity-25"></div>
            </div>

            {/* Avatar with rounded background */}
            <div className="flex justify-center mb-6 relative z-10 text-center">
              <div className="bg-orange-300/30 p-4 rounded-2xl backdrop-blur-sm">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/avatar-placeholder.png" alt="Avatar" />
                  <AvatarFallback className="bg-white/20 text-white text-lg font-bold backdrop-blur-sm">
                    {userName.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            {/* Username moved below circle */}
            {/* VIP Badge
            <div className="flex justify-center mb-4 relative z-10">
              <span className="text-sm text-orange-100 font-medium">
                Khách hàng VIP
              </span>
            </div>

            {/* Premium Badge */}
            {/* <div className="flex justify-center relative z-10">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">Premium</span>
              </div>
            </div> */}
          </div>

          {/* Username under avatar circle */}
          <div className="px-6 mt-5 mb-2 text-center">
            <h2 className="text-lg font-bold text-gray-800">
              {userName || "Nguyễn Văn A"}
            </h2>
          </div>

          <Separator />

          {/* Navigation Menu - Scrollable */}
          <ScrollArea className="flex-1 px-6">
            <nav className="py-6">
              <div className="space-y-3">
                {menus.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link href={item.href} key={item.href}>
                      <div className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${isActive
                        ? "bg-orange-50 border border-orange-200"
                        : "hover:bg-gray-50"
                        }`}>
                        <div className={`p-2 rounded-lg ${item.bgColor} flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${isActive ? "text-orange-600" : "text-orange-500"
                            }`} />
                        </div>
                        <span className={`font-medium ${isActive ? "text-orange-600" : "text-gray-700"
                          }`}>
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </ScrollArea>
        </aside>

        {/* Vertical separator between sidebar and main content */}
        <Separator orientation="vertical" className="h-full  bg-gray-200/60" />

        {/* Main content - Scrollable */}
        <main className="flex-1 bg-white overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-8">
              {children}
            </div>
          </ScrollArea>
        </main>
      </div>

      <Footer />
    </div>
  );
}







