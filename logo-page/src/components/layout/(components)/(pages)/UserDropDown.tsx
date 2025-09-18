import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/context/authStore.store";
import { LogOut, User2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function UserDropDown() {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const route = useRouter();
  const handleLogout = () => {
    clearUser();
    route.push("/auth/login");
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="lego-login-button">
          <DropdownMenuLabel>
            <span className="font-semibold flex gap-2 items-center ">
              <User2 />
              {user?.ten}
            </span>
          </DropdownMenuLabel>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={8}
        align="end"
        className="z-[3000] bg-white text-gray-900 border border-gray-200 rounded-lg shadow-lg"
      >
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => route.push("/account")}
          className="text-gray-700 cursor-pointer hover:bg-orange-50 hover:text-orange-600 data-[highlighted]:bg-orange-50 data-[highlighted]:text-orange-600 transition-colors duration-200"
        >          
          Tài khoản
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 cursor-pointer hover:bg-red-50 hover:text-red-700 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4 mr-2 text-red-600" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
