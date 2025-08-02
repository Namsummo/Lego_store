import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { danhGiaService } from "@/services/danhGiaService";
import { DanhGiaResponse, CreateDanhGiaDTO } from "@/components/types/danhGia-type";

export const useDanhGia = (spId: number) => {
    return useQuery({
        queryKey: ["danhGia", spId],
        queryFn: () => danhGiaService.getBySanPham(spId),
        staleTime: 5 * 60 * 1000, // 5 phút
    });
};

export const useReviews = () => {
    return useQuery<DanhGiaResponse[]>({
        queryKey: ["reviews"],
        queryFn: async () => {
            try {
                const data = await danhGiaService.getAllReviews();
                return data;
            } catch (error) {
                console.log("API error:", error);
                return [];
            }
        },
        staleTime: 5 * 60 * 1000, // 5 phút
    });
};

export const useAddDanhGiaWithImages = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ data, images, video }: { data: CreateDanhGiaDTO; images: File[]; video?: File }) =>
            danhGiaService.createWithImages(data, images, video),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["danhGia", variables.data.sp_id] });
        },
        onError: (error) => {
            console.error("❌ Error adding review:", error);
        },
    });
};

export const useUpdateDanhGia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ idDanhGia, idNv, phanHoi }: { idDanhGia: number; idNv: number; phanHoi: string }) =>
            danhGiaService.update(idDanhGia, idNv, phanHoi),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
        },
        onError: (error) => {
            console.error("❌ Error updating review:", error);
        },
    });
};

export const useDeleteDanhGia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ idDanhGia, idNv }: { idDanhGia: number; idNv: number }) =>
            danhGiaService.delete(idDanhGia, idNv),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
        },
        onError: (error) => {
            console.error("❌ Error deleting review:", error);
        },
    });
};

