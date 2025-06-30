import { SanPham } from "@/components/types/product.type";
import { ProductData } from "@/lib/sanphamschema";

import { sanPhamService } from "@/services/sanPhamService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// All
export function useSanPham() {
  return useQuery<SanPham[], Error>({
    queryKey: ["sanPhams"],
    queryFn: sanPhamService.getSanPhams,
  });
}

//SPCT
export function useSanPhamID(id: number) {
  return useQuery<SanPham>({
    queryKey: ["sanPhams", id],
    queryFn: () => sanPhamService.getSanPhamID(id),
    enabled: !!id,
  });
}

//Add
export function useAddSanPham() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductData) => sanPhamService.addSanPham(data),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["sanPhams"] });
    },
  });
}
// Sửa
export function useEditSanPham() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductData }) =>
      sanPhamService.editSanPham(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sanPhams"] });
    },
  });
}

//  Xóa
export function useXoaSanPham() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sanPhamService.xoaSanPham(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sanPhams"] });
    },
  });
}
