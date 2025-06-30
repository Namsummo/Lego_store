"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Users,
  UserCheck,
  Building,
  TrendingUp,
  UserX,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { DTOUser, Role } from "@/components/types/account.type";
import StatsCard from "./StatsCard";
import AccountTable from "./AccountTable";
import AccountForm from "./AccountForm";
import {
  useAccounts,
  useAccountsByRole,
  useCreateUser,
  useUpdateAccount,
  useSoftDeleteAccount,
  useRoles,
} from "@/hooks/useAccount";
import { ToastProvider } from "@/components/ui/toast-provider";

type TabType = "employee" | "customer" | "inactive";

function UserManagementContent() {
  const [currentTab, setCurrentTab] = useState<TabType>("employee");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<DTOUser | null>(null);

  const { data: employees = [] } = useAccountsByRole("2");
  const { data: customers = [] } = useAccountsByRole("3");
  const { data: roles = [] } = useRoles();

  const inactiveAccounts = [...employees, ...customers].filter(
    (a) => a.trangThai === 0
  );

  let accounts: DTOUser[] = [];
  if (currentTab === "employee") {
    accounts = employees.filter((a) => a.trangThai === 1);
  } else if (currentTab === "customer") {
    accounts = customers.filter((a) => a.trangThai === 1);
  } else {
    accounts = inactiveAccounts;
  }

  const getRoleName = (roleId: number) => {
    return roles.find((r) => r.id === roleId)?.name || `Sai role ID: ${roleId}`;
  };  
  
  const filteredAccounts = accounts.filter((acc) =>
    [acc.ten, acc.email, getRoleName(acc.role_id)].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const createUser = useCreateUser();
  const updateUser = useUpdateAccount();
  const softDelete = useSoftDeleteAccount();
  const { refetch } = useAccounts();

  const handleEditAccount = (account: DTOUser) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleSaveAccount = (accountData: DTOUser) => {
    if (editingAccount) {
      updateUser.mutate(
        {
          id: editingAccount.id!,
          data: {
            ten: accountData.ten,
            email: accountData.email,
            matKhau: accountData.matKhau,
            sdt: accountData.sdt,
            diaChi: accountData.diaChi,
            trangThai: accountData.trangThai,
            role_id: accountData.role_id, // <-- đổi tên nếu cần
          },
        },
        {
          onSuccess: () => {
            toast.success("Cập nhật tài khoản thành công");
            setIsFormOpen(false);
            setEditingAccount(null);
            refetch();
          },
          onError: () => {
            toast.error("Lỗi cập nhật tài khoản");
          },
        }
      );      
    } else {
      createUser.mutate(accountData, {
        onSuccess: () => {
          toast.success("Thêm tài khoản thành công");
          setIsFormOpen(false);
          refetch();
        },
        onError: () => {
          toast.error("Thêm tài khoản thất bại");
        },
      });
    }
  };  

  const handleAddNew = () => {
    setEditingAccount(null);
    setIsFormOpen(true);
  };

  const handleDelete = (account: DTOUser) => {
    if (!confirm("Bạn có chắc chắn muốn ngừng hoạt động tài khoản này?")) return;
  
    softDelete.mutate(
      {
        ...account,
        role: { id: account.role_id },
      },
      {
        onSuccess: () => {
          toast.success("Đã chuyển tài khoản sang trạng thái ngừng hoạt động");
          refetch();
        },
        onError: () => {
          toast.error("Xóa tài khoản thất bại");
        },
      }
    );
  };  

console.log("Employees:", employees);
console.log("Role of first employee:", employees[0]?.role_id);


  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Hệ Thống Quản Lý Người Dùng
          </h1>
          <p className="text-gray-400 text-lg">
            Quản lý nhân viên và khách hàng một cách hiệu quả
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard title="Tổng nhân viên" value={employees.length} icon={Users} color="border-blue-500/60"/>
          <StatsCard title="Nhân viên hoạt động" value={employees.filter((a) => a.trangThai === 1).length} icon={UserCheck} color="border-green-500/60"/>
          <StatsCard title="Tổng khách hàng" value={customers.length} icon={Building} color="border-purple-500/60"/>
          <StatsCard title="Khách hàng hoạt động" value={customers.filter((a) => a.trangThai === 1).length} icon={TrendingUp} color="border-green-500/60"/>
        </motion.div>

        {/* Tabs & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-2xl p-6 border border-blue-500/60"
        >
          <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as TabType)}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
              <TabsList className="bg-slate-800/50 border border-blue-500/20">
                <TabsTrigger value="employee" className="data-[state=active]:bg-blue-600">
                  <Users className="h-4 w-4 mr-2" />
                  Nhân viên
                </TabsTrigger>
                <TabsTrigger value="customer" className="data-[state=active]:bg-purple-600">
                  <Building className="h-4 w-4 mr-2" />
                  Khách hàng
                </TabsTrigger>
                <TabsTrigger value="inactive" className="data-[state=active]:bg-yellow-600">
                  <UserX className="h-4 w-4 mr-2" />
                  Ngừng hoạt động
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email, vai trò..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-blue-500/30 focus:border-blue-400 w-full sm:w-80"
                  />
                </div>
                {currentTab !== "inactive" && (
                  <Button
                    onClick={handleAddNew}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm mới
                  </Button>
                )}
              </div>
            </div>

            <TabsContent value="employee" className="mt-6">
              <AccountTable
                accounts={filteredAccounts as any}
                onEdit={handleEditAccount}
                onDelete={handleDelete}
                roles={roles}
                type="employee"
              />
            </TabsContent>

            <TabsContent value="customer" className="mt-6">
            <AccountTable
              accounts={filteredAccounts as any}
              roles={roles}
              onEdit={handleEditAccount}
              onDelete={handleDelete}
              type={currentTab}
            />

            </TabsContent>

            <TabsContent value="inactive" className="mt-6">
            <AccountTable
              accounts={filteredAccounts as any}   // DTOUserWithId
              roles={roles}                        // ★ TRUYỀN XUỐNG
              onEdit={handleEditAccount}
              onDelete={handleDelete}
              type={currentTab}
            />

            </TabsContent>
          </Tabs>
        </motion.div>

        <AccountForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingAccount(null);
          }}
          account={editingAccount}
          onSave={handleSaveAccount}
          type={currentTab}
        />
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ToastProvider>
      <UserManagementContent />
    </ToastProvider>
  );
}
