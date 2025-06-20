import { KhuyenMai } from "@/components/types/khuyenmai-type";
import { KhuyenMaiService } from "@/services/KhuyenMaiService";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";



export function useKhuyenmai() {
    return useQuery<KhuyenMai[], Error>({
      queryKey: ['KhuyenMais'],
      queryFn: KhuyenMaiService.getKhuyenMai,
    });
  }
  
  export function useKhuyenmaiID(id:number) {
      return useQuery<KhuyenMai>({
          queryKey: ['KhuyenMais', id],
          queryFn: () => KhuyenMaiService.getKhuyenMaiID(id),
      enabled: !!id,
    });
  }
  export function useAddKhuyenMai() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: KhuyenMaiService.addKhuyenMai,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['KhuyenMais'] });
      },
    });
  }
  
  export function useEditKhuyenMai() {
    const queryClient = useQueryClient();
    return useMutation({ 
      mutationFn: ({ id, data }: { id: number; data: KhuyenMai }) =>
        KhuyenMaiService.updateKhuyenMai(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['KhuyenMais'] });
      },
    });
  }
  
  export function useDeleteKhuyenMai() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => KhuyenMaiService.xoaKhuyenMai(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['KhuyenMais'] });
      },
    });
  }  
  