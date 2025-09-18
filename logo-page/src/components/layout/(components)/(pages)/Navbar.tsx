import Link from "next/link";
import React, { useState } from "react";
import { ChevronDown, Gift, Gamepad2 } from "lucide-react";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="w-full">
      {/* Đường dẫn dưới banner */}
      <div className="w-full bg-orange-300 flex gap-6 justify-center py-4  z-[1000]">
        {[
          { href: "/product", label: "Sản phẩm" },
          { href: "/1", label: "Cửa hàng" },
          { href: "/2", label: "Giới thiệu" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="relative text-lg md:text-xl font-semibold text-gray-800 transition-all duration-300 hover:text-black group"
          >
            {item.label}
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-black rounded-full transition-all duration-300 group-hover:w-full"></span>
          </Link>
        ))}

        {/* Dropdown menu cho Games & Rewards */}
        <div
          className="relative group"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button className="relative text-lg md:text-xl font-semibold text-gray-800 transition-all duration-300 hover:text-black flex items-center gap-1">
            Giải trí & Thưởng
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-black rounded-full transition-all duration-300 group-hover:w-full"></span>
          </button>

          {/* Dropdown content */}
          {isDropdownOpen && (
            <>
              {/* Invisible bridge để kết nối button và dropdown */}
              <div
                className="absolute top-full left-0 right-0 h-1.5 z-[1100]"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              />
              <div
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1.5 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[1100] min-w-[200px]"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <Link
                  href="/lucky-wheel"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
                >
                  <Gift className="w-5 h-5" />
                  <span>Vòng quay may mắn</span>
                </Link>
                <Link
                  href="/caro"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
                >
                  <Gamepad2 className="w-5 h-5" />
                  <span>Cờ Caro</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
