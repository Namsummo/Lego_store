import { AnhSanPhamChiTiet } from "@/components/types/product.type";
import { anhSanPhamSevice } from "@/services/anhSanPhamService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAnhSanPham() {
  return useQuery<AnhSanPhamChiTiet[], Error>({
    queryKey: ["anhSanPhams"],
    queryFn: anhSanPhamSevice.getAnhSanPham,
  });
}
export function useAnhSanPhamID(id: number) {
  return useQuery<AnhSanPhamChiTiet>({
    queryKey: ["anhSanPhams", id],
    queryFn: () => anhSanPhamSevice.getAnhSanPhamID(id),
    enabled: !!id,
  });
}
// add
// export function useAddAnhSanPham() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (data: {
//       file: File;
//       thuTu: number;
//       anhChinh: boolean;
//       sanPhamId: number;
//       moTa?: string;
//     }) => anhSanPhamSevice.addAnhSanPham(data),
//     onSuccess() {
//       queryClient.invalidateQueries({ queryKey: ["anhSanPhams"] });
//     },
//   });
// }
export function useAddAnhSanPham() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      files: File[];
      thuTu: number;
      anhChinh: boolean;
      sanPhamId: number;
      moTa?: string;
    }) => anhSanPhamSevice.addAnhSanPham(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["anhSanPhams"] });
      queryClient.invalidateQueries({
        queryKey: ["anhSanPhams", "sanpham", variables.sanPhamId],
      });
    },
    onError: (error: Error) => {
      console.error("Lỗi thêm ảnh: ", error.message);
    },
  });
}

// edit
export function useSuaAnhSanPham() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        file?: File;
        thuTu: number;
        anhChinh: boolean;
        sanPhamId: number;
        moTa?: string;
      };
    }) => anhSanPhamSevice.editAnhSanPham(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anhSanPhams"] });
    },
  });
}

//  Xóa
export function useXoaAnhSanPham() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => anhSanPhamSevice.deleteAnhSanPham(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anhSanPhams"] });
    },
  });
}

export function useAnhSanPhamTheoSanPhamId(id: number) {
  return useQuery<AnhSanPhamChiTiet[]>({
    queryKey: ["anhSanPhams", "sanpham", id],
    queryFn: () => anhSanPhamSevice.getAnhSanPhamTheoSanPhamId(id),
    enabled: !!id,
  });
}
