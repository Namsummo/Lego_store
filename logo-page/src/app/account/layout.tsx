"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";

const menus = [
  { label: "Tài khoản", href: "/account/info" },
  { label: "Lịch sử mua hàng", href: "/account/history" },
  { label: "Đổi mật khẩu ", href: "/account/change-password" },
];

export default function Accountlayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      <aside className="">
        {menus.map((item) => (
          <Link href={item.href} key={item.href}>
            <Button
              variant={pathname === item.href ? "default" : "ghost"}
              className="w-full justify-start"
            >
              {item.label}
            </Button>
          </Link>
        ))}
      </aside>
      <main>{children}</main>
    </div>
  );
}
