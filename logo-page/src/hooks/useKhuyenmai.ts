// hooks/useKhuyenMai.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  KhuyenMaiDTO,
  KhuyenMaiSanPhamDTO,
  KhuyenMaiTheoSanPham,
} from "@/components/types/khuyenmai-type";
import {
  KhuyenMaiPayLoad,
  khuyenMaiService,
} from "@/services/khuyenMaiService1";
import { toast } from "sonner";

export function useKhuyenMai() {
  return useQuery<KhuyenMaiDTO[]>({
    queryKey: ["khuyenmais"],
    queryFn: khuyenMaiService.getKhuyenMai,
  });
}

export function useKhuyenMaiID(id: number) {
  return useQuery<KhuyenMaiDTO>({
    queryKey: ["khuyenmai", id],
    queryFn: () => khuyenMaiService.getKhuyenMaiID(id),
    enabled: !!id,
  });
}

export function useAddKhuyenMai() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: KhuyenMaiPayLoad) => khuyenMaiService.addKhuyenMai(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["khuyenmais"] });
    },
  });
}

export function useEditKhuyenMai() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: KhuyenMaiDTO }) =>
      khuyenMaiService.suaKhuyenMai(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["khuyenmais"] });
    },
  });
}

export function useDeleteKhuyenMai() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => khuyenMaiService.xoaKhuyenMai(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["khuyenmais"] });
    },
  });
}
// Thêm khuyến mãi
export function useAddKhuyenMaiVaoSanPham() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: KhuyenMaiSanPhamDTO) =>
      khuyenMaiService.ThemKhuyenMaiVaoSanPham(data),
    onSuccess: () => {
      toast.success("Áp dụng thành công!");
      queryClient.invalidateQueries({ queryKey: ["sanPhams"] });
    },
    onError: () => {
      toast.error("Không thể áp dụng khuyến mãi");
    },
  });
}

// List Sản phẩm theo khuyến mãi
export function useListKhuyenMaiTheoSanPham() {
  return useQuery<KhuyenMaiTheoSanPham[]>({
    queryKey: ["sanPhams"],
    queryFn: khuyenMaiService.ListSanPhamTheoKhuyenMai,
  });
}
