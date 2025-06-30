"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/context/use-toast"; // Sửa import toast
import { X } from "lucide-react";
import { Account } from "@/components/types/account.type";

type AccountFormProps = {
  isOpen: boolean;
  onClose: () => void;
  account?: Account | null; // account có thể là Account hoặc null
  onSave: (accountData: Account) => void;
  type: "employee" | "customer";
};

const AccountForm: React.FC<AccountFormProps> = ({
  isOpen,
  onClose,
  account,
  onSave,
  type,
}) => {
  const { toast } = useToast(); // Sử dụng hook useToast

  // Khởi tạo state với kiểu dữ liệu rõ ràng
  const initialFormData: Omit<Account, "id" | "createdAt"> = {
    name: "",
    email: "",
    phone: "",
    role: type === "employee" ? "Nhân viên" : "Khách hàng",
    department: "",
    status: "Hoạt động",
    avatar: "",
  };
  const [formData, setFormData] =
    useState<Omit<Account, "id" | "createdAt">>(initialFormData);

  useEffect(() => {
    if (account) {
      const { id, createdAt, ...editableAccountData } = account;
      setFormData(editableAccountData);
    } else {
      setFormData({
        ...initialFormData,
        role: type === "employee" ? "Nhân viên" : "Khách hàng",
      });
    }
  }, [account, type]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast({
        message: "Vui lòng điền đầy đủ thông tin bắt buộc!",
        type: "error",
      });
      return;
    }

    const accountData = {
      ...formData,
      id: account?.id || Date.now().toString(),
      createdAt: account?.createdAt || new Date().toISOString(),
    };

    onSave(accountData);
    onClose();

    toast({
      message: `${account ? "Cập nhật" : "Thêm"} tài khoản thành công!`,
      type: "success",
    });
  };

  const handleInputChange = (
    field: keyof Omit<Account, "id" | "createdAt">,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass-effect border-gray-700/50 bg-gray-900/70 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {account
              ? "Chỉnh sửa tài khoản"
              : `Thêm ${type === "employee" ? "nhân viên" : "khách hàng"} mới`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-blue-200">
                Họ và tên *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-slate-800/50 border-blue-500/30 focus:border-blue-400"
                placeholder="Nhập họ và tên"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-200">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-slate-800/50 border-blue-500/30 focus:border-blue-400"
                placeholder="Nhập email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-blue-200">
                Số điện thoại
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="bg-slate-800/50 border-blue-500/30 focus:border-blue-400"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-blue-200">Vai trò</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger className="bg-slate-800/50 border-blue-500/30 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700/50 p-2">
                  {type === "employee" ? (
                    <>
                      <SelectItem value="Quản lý">Quản lý</SelectItem>
                      <SelectItem value="Nhân viên">Nhân viên</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Khách hàng VIP">
                        Khách hàng VIP
                      </SelectItem>
                      <SelectItem value="Khách hàng">Khách hàng</SelectItem>
                      <SelectItem value="Khách hàng mới">
                        Khách hàng mới
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {type === "employee" && (
              <div className="space-y-2">
                <Label htmlFor="department" className="text-blue-200">
                  Phòng ban
                </Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  className="bg-slate-800/50 border-blue-500/30 focus:border-blue-400"
                  placeholder="Nhập phòng ban"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-blue-200">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger className="bg-slate-800/50 border-blue-500/30 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700/50 p-2">
                  <SelectItem value="Hoạt động">Hoạt động</SelectItem>
                  <SelectItem value="Tạm khóa">Tạm khóa</SelectItem>
                  <SelectItem value="Ngừng hoạt động">
                    Ngừng hoạt động
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-500 text-gray-300 hover:bg-gray-700"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              {account ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccountForm;
