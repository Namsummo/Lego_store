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
    route.push("/");
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
      <DropdownMenuContent sideOffset={8} align="end">
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => route.push("profile")}>
          Tài khoản
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="text-red-50">
          <LogOut className="w-4 h-4 mr-2" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
