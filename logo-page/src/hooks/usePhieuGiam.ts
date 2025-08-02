import {
  ChitietPhieuGiamGia,
  PhieuGiamGia,
  PhieuGiamGiaCreate,
} from "@/components/types/phieugiam.type";
import { phieuGiamGiaService } from "@/services/phieugiamgia";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const PHIEU_GIAM_QUERY_KEY = ["phieuGiamGias"];

// Get all
export function useGetPhieuGiam() {
  return useQuery<PhieuGiamGia[], Error>({
    queryKey: PHIEU_GIAM_QUERY_KEY,
    queryFn: phieuGiamGiaService.getPhieuGiamGia,
  });
}

// Add
export function useAddPhieuGiamGia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (phieu: PhieuGiamGiaCreate) =>
      phieuGiamGiaService.addPhieuGiamGia(phieu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHIEU_GIAM_QUERY_KEY });
    },
  });
}

// Update
export function useEditPhieuGiamGia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PhieuGiamGia }) =>
      phieuGiamGiaService.suaPhieuGiamGia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHIEU_GIAM_QUERY_KEY });
    },
  });
}

// Delete
export function useXoaPhieuGiamGia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => phieuGiamGiaService.xoaPhieuGiamGia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHIEU_GIAM_QUERY_KEY });
    },
  });
}

export function useHistoryPhieuGiamGia(id: number) {
  return useQuery<ChitietPhieuGiamGia>({
    queryKey: ["chitietPhieuGiam", id],
    queryFn: async () => {
      const result = await phieuGiamGiaService.getChitietPhieuGiamGia(id);
      return result;
    },
    enabled: !!id,
  });
}
// LAY PHIEU GIAM NOI BAT
export function useGetPhieuGiamGiaNoiBat() {
  return useQuery<PhieuGiamGia[]>({
    queryKey: ["phieuGiamGiaNoiBat"],
    queryFn: async () => {
      const res = await phieuGiamGiaService.getPhieuGiamGiaNoiBat();
      return res;
    },
  });
}
