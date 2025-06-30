"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/use-toast"; // Sử dụng useToast từ context
import { useLocalStorage } from "@/context/useLocalStorage"; // Giả sử đường dẫn đúng
import AccountForm from "./AccountForm"; // Sử dụng đường dẫn tương đối
import AccountTable from "./AccountTable"; // Sử dụng đường dẫn tương đối
import StatsCard from "./StatsCard"; // Sử dụng đường dẫn tương đối
import {
  Users,
  UserCheck,
  Search,
  Plus,
  Building,
  Phone,
  Mail,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { ToastProvider } from "@/components/ui/toast-provider"; // Import ToastProvider
import { Account } from "@/components/types/account.type";

function UserManagementContent() {
  const [employees, setEmployees] = useLocalStorage("employees", []);
  const [customers, setCustomers] = useLocalStorage("customers", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [currentTab, setCurrentTab] = useState("employees");

  const { toast } = useToast(); // Gọi hook useToast

  const handleSaveAccount = (accountData: Account) => {
    if (currentTab === "employees") {
      if (editingAccount) {
        setEmployees((prev: Account[]) =>
          prev.map((emp: Account) =>
            emp.id === editingAccount!.id ? accountData : emp
          )
        );
      } else {
        setEmployees((prev: Account[]) => [...prev, accountData]);
      }
    } else {
      if (editingAccount) {
        setCustomers((prev: Account[]) =>
          prev.map((cust: Account) =>
            cust.id === editingAccount!.id ? accountData : cust
          )
        );
      } else {
        setCustomers((prev: Account[]) => [...prev, accountData]);
      }
    }
    setEditingAccount(null);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleDeleteAccount = (accountId: string) => {
    if (currentTab === "employees") {
      setEmployees((prev: Account[]) =>
        prev.filter((emp: Account) => emp.id !== accountId)
      );
    } else {
      setCustomers((prev: Account[]) =>
        prev.filter((cust: Account) => cust.id !== accountId)
      );
    }

    toast({
      message: "Tài khoản đã được xóa thành công!",
      type: "success", // Hoặc "error" nếu có lỗi, "destructive" không phải là type chuẩn của context
    });
  };

  const handleAddNew = () => {
    setEditingAccount(null);
    setIsFormOpen(true);
  };

  const filterAccounts = (accounts: Account[]): Account[] => {
    if (!searchTerm) return accounts;
    return accounts.filter(
      (account) =>
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getActiveEmployees = (): number =>
    employees.filter((emp: Account) => emp.status === "Hoạt động").length;
  const getActiveCustomers = (): number =>
    customers.filter((cust: Account) => cust.status === "Hoạt động").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Hệ Thống Quản Lý Tài Khoản
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
          <StatsCard
            title="Tổng nhân viên"
            value={employees.length}
            icon={Users}
            color="border-blue-500/20"
            trend={12}
          />
          <StatsCard
            title="Nhân viên hoạt động"
            value={getActiveEmployees()}
            icon={UserCheck}
            color="border-green-500/20"
            trend={8}
          />
          <StatsCard
            title="Tổng khách hàng"
            value={customers.length}
            icon={Building}
            color="border-purple-500/20"
            trend={15}
          />
          <StatsCard
            title="Khách hàng hoạt động"
            value={getActiveCustomers()}
            icon={TrendingUp}
            color="border-pink-500/20"
            trend={20}
          />
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-2xl p-6 border border-blue-500/20"
        >
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
              <TabsList className="bg-slate-800/50 border border-blue-500/20">
                <TabsTrigger
                  value="employees"
                  className="data-[state=active]:bg-blue-600"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Nhân viên
                </TabsTrigger>
                <TabsTrigger
                  value="customers"
                  className="data-[state=active]:bg-purple-600"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Khách hàng
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
                <Button
                  onClick={handleAddNew}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm mới
                </Button>
              </div>
            </div>

            <TabsContent value="employees" className="mt-6">
              <AccountTable
                accounts={filterAccounts(employees)}
                onEdit={handleEditAccount}
                onDelete={handleDeleteAccount}
                type="employee"
              />
            </TabsContent>

            <TabsContent value="customers" className="mt-6">
              <AccountTable
                accounts={filterAccounts(customers)}
                onEdit={handleEditAccount}
                onDelete={handleDeleteAccount}
                type="customer"
              />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Account Form Modal */}
        <AccountForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingAccount(null);
          }}
          account={editingAccount}
          onSave={handleSaveAccount}
          type={currentTab === "employees" ? "employee" : "customer"}
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <UserManagementContent />
    </ToastProvider>
  );
}
