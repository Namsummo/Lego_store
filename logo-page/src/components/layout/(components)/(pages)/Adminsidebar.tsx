"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Users,
  BarChart3,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Star,
} from "lucide-react";
import { adminRoutes } from "@/lib/route";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const iconMap = {
  "layout-dashboard": LayoutDashboard,
  package: Package,
  "shopping-cart": ShoppingCart,
  tag: Tag,
  users: Users,
  "bar-chart-3": BarChart3,
  star: Star,
};

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <>
      {/* Nút mở sidebar trên mobile */}
      <button
        className="fixed z-50 top-4 left-4 md:hidden bg-white p-2 rounded-md shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay nền đen khi sidebar mở trên mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar chính */}
      <aside
        className={cn(
          "fixed md:static top-0 left-0 z-40 min-h-screen",
          "border-r bg-white dark:bg-gray-900 transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo và tiêu đề */}
        <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
          <Image
            src="/images/logoM.jpg"
            alt="Logo"
            width={120}
            height={32}
            className="h-8 object-contain"
          />
          {!collapsed && <h1 className="text-sm font-bold">LEGO MYKINGDOM</h1>}
          <Button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block"
            variant="ghost"
          >
            <Menu size={20} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {adminRoutes.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const hasChildren = !!item.children;
            const isOpen = openMenus.includes(item.label);

            return (
              <div key={item.label}>
                {hasChildren ? (
                  // Mục có submenu
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={cn(
                      "w-full flex items-center px-3 py-2.5 rounded-md transition-colors",
                      "text-left",
                      pathname === item.href
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    {Icon && <Icon size={20} />}
                    {!collapsed && (
                      <>
                        <span className="ml-3 flex-1">{item.label}</span>
                        {isOpen ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </>
                    )}
                  </button>
                ) : (
                  // Mục không có submenu (sử dụng Link để điều hướng)
                  <Link
                    href={item.href || "#"}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-md transition-colors",
                      pathname === item.href
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {Icon && <Icon size={20} />}
                    {!collapsed && (
                      <span className="ml-3 flex-1">{item.label}</span>
                    )}
                  </Link>
                )}

                {/* Menu con nếu có */}
                {hasChildren && isOpen && !collapsed && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block px-3 py-2 rounded-md text-sm",
                            isChildActive
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-800 dark:text-white"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          )}
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
