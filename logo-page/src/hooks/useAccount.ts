"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountService } from "@/services/accountService";
import { DTOUser, Role } from "@/components/types/account.type";

// Lấy danh sách tất cả tài khoản
export const useAccounts = (keyword?: string) =>
  useQuery<DTOUser[], Error>({
    queryKey: ["accounts", keyword],
    queryFn: () => accountService.getAccounts(keyword),
  });

// Lấy danh sách tài khoản theo vai trò
export const useAccountsByRole = (roleId: string) =>
  useQuery<DTOUser[], Error>({
    queryKey: ["accounts", "role", roleId],
    queryFn: () => accountService.getAccountsByRole(roleId),
    enabled: !!roleId,
  });

// Lấy danh sách vai trò
export const useRoles = () =>
  useQuery<Role[], Error>({
    queryKey: ["roles"],
    queryFn: accountService.getRoles,
  });

// Thêm tài khoản
export const useAddAccount = () => {
  const queryClient = useQueryClient();
  return useMutation<DTOUser, Error, Partial<DTOUser>>({
    mutationFn: accountService.addAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

// Tạo user mới
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<DTOUser, Error, DTOUser>({
    mutationFn: accountService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

// Cập nhật tài khoản
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation<DTOUser, Error, { id: number; data: DTOUser }>({
    mutationFn: ({ id, data }) => accountService.updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

// ✅ Cập nhật để nhận full DTOUser có role object
export const useSoftDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation<DTOUser, Error, DTOUser>({
    mutationFn: async (data) => {
      const updatedData = {
        ...data,
        trangThai: 0,
      };
      return accountService.updateAccount(data.id!, updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};


