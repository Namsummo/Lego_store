"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema, AccountFormData } from "@/lib/accountSchema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DTOUser, Role } from "@/components/types/account.type";
import { useRoles } from "@/hooks/useAccount";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DTOUser) => void;
  account?: DTOUser | null;
  type: "employee" | "customer" | "inactive";
}

const AccountForm: React.FC<AccountFormProps> = ({
  isOpen,
  onClose,
  onSave,
  account,
  type,
}) => {
  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      ten: "",
      email: "",
      matKhau: "",
      sdt: "",
      diaChi: "",
      roleId: 0,
      trangThai: 1,
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const { data: roles = [] } = useRoles();

  useEffect(() => {
    if (account) {
      // account.role_id là số rồi
      form.reset({
        ten: account.ten || "",
        email: account.email || "",
        matKhau: account.matKhau || "",
        sdt: account.sdt || "",
        diaChi: account.diaChi || "",
        roleId: account.role_id ?? 0,
        trangThai: account.trangThai ?? 1,
      });
    } else {
      form.reset({
        ten: "",
        email: "",
        matKhau: "",
        sdt: "",
        diaChi: "",
        roleId: type === "employee" ? 2 : 3, // default role id
        trangThai: 1,
      });
    }
  }, [account, type, form]);

  const handleSubmit = (data: AccountFormData) => {
    // Tạo payload DTOUser với role_id là số
    const accountPayload: DTOUser = {
      ten: data.ten,
      email: data.email,
      matKhau: data.matKhau,
      sdt: data.sdt,
      diaChi: data.diaChi,
      trangThai: data.trangThai,
      role_id: data.roleId,
    };

    onSave(accountPayload);
  };

  // Lọc role chỉ lấy những id 2, 3 (hoặc thêm role hiện tại nếu có)
  const filteredRoles = React.useMemo(() => {
    let allowed = roles.filter((r) => r.id === 2 || r.id === 3);
    if (account?.role_id && !allowed.find((r) => r.id === account.role_id)) {
      const currentRole = roles.find((r) => r.id === account.role_id);
      if (currentRole) allowed = [...allowed, currentRole];
    }
    return allowed;
  }, [roles, account]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-3xl rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-6 shadow-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-bold mb-6 text-white">
              {account ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
            </h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="grid gap-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Họ tên */}
                  <FormField
                    control={form.control}
                    name="ten"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Họ tên</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-slate-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-slate-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Mật khẩu */}
                  <FormField
                    control={form.control}
                    name="matKhau"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel className="text-white">Mật khẩu</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              {...field}
                              className="bg-slate-700 text-white pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-white"
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* SĐT */}
                  <FormField
                    control={form.control}
                    name="sdt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Số điện thoại</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-slate-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Địa chỉ */}
                  <FormField
                    control={form.control}
                    name="diaChi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Địa chỉ</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-slate-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Vai trò */}
                  <FormField
                    control={form.control}
                    name="roleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Vai trò</FormLabel>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(val) => field.onChange(Number(val))}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 text-white">
                              <SelectValue>
                                {filteredRoles.find((r) => r.id === field.value)?.name ||
                                  "Chọn vai trò"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-700 text-white">
                            {filteredRoles.map((role) => (
                              <SelectItem key={role.id} value={role.id.toString()}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Trạng thái */}
                  <FormField
                    control={form.control}
                    name="trangThai"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Trạng thái</FormLabel>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(val) => field.onChange(Number(val))}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 text-white">
                              <SelectValue>
                                {field.value === 1 ? "Hoạt động" : "Ngừng hoạt động"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-700 text-white">
                            <SelectItem value="1">Hoạt động</SelectItem>
                            <SelectItem value="0">Ngừng hoạt động</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Hủy
                  </Button>
                  <Button type="submit">Lưu</Button>
                </div>
              </form>
            </Form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AccountForm;
