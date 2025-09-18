import {
    PhieuHoanHangDTO,
    TrangThaiPhieuHoan,
    TrangThaiThanhToan,
    TaoPhieuHoanHangWithFileParams, // thêm dòng này
} from "@/components/types/hoanHang-types";
import { hoanHangService } from "@/services/hoanHangService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Query keys để quản lý cache
const queryKeys = {
    all: ["phieuHoanHang"] as const,
    byTrangThai: (trangThai: TrangThaiPhieuHoan) =>
        [...queryKeys.all, "trangThai", trangThai] as const,
    byHoaDon: (idHoaDon: number) =>
        [...queryKeys.all, "hoaDon", idHoaDon] as const,
};

// Hook lấy danh sách phiếu hoàn hàng theo trạng thái
export function usePhieuHoanByTrangThai(trangThai: TrangThaiPhieuHoan) {
    return useQuery({
        queryKey: queryKeys.byTrangThai(trangThai),
        queryFn: () => hoanHangService.getByTrangThai(trangThai),
    });
}

// Hook lấy phiếu hoàn hàng theo hóa đơn
export function usePhieuHoanByHoaDon(idHoaDon: number) {
    return useQuery({
        queryKey: queryKeys.byHoaDon(idHoaDon),
        queryFn: () => hoanHangService.getByHoaDon(idHoaDon),
        enabled: !!idHoaDon, // chỉ gọi khi có idHoaDon
    });
}

// Hook tạo phiếu hoàn hàng
export function useTaoPhieuHoanHang() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: PhieuHoanHangDTO) => hoanHangService.taophieu(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.all });
        },
    });
}

// Hook tạo phiếu hoàn hàng có file (dùng cho /tao-phieu-2)
export function useTaoPhieuHoanHangWithFile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ dto, fileAnh, fileVid }: TaoPhieuHoanHangWithFileParams) =>
            hoanHangService.taoPhieu2(dto, fileAnh, fileVid),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.all });
        },
    });
}

// Hook duyệt phiếu hoàn hàng
export function useDuyetPhieuHoanHang() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => hoanHangService.duyet(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.all });
        },
    });
}

// Hook từ chối phiếu hoàn hàng
export function useTuChoiPhieuHoanHang() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, lyDo }: { id: number; lyDo: string }) =>
            hoanHangService.tuChoi(id, lyDo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.all });
        },
    });
}

// Hook cập nhật trạng thái thanh toán
export function useCapNhatThanhToanPhieuHoanHang() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            trangThai,
        }: {
            id: number;
            trangThai: TrangThaiThanhToan;
        }) => hoanHangService.capNhatThanhToan(id, trangThai),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.all });
        },
    });
}

// Hook kiểm tra có thể hoàn hàng
export function useKiemTraCoTheHoanHang(idHoaDon: number) {
    return useQuery({
        queryKey: ["kiemTraHoanHang", idHoaDon],
        queryFn: () => hoanHangService.kiemTraCoTheHoanHang(idHoaDon),
        enabled: !!idHoaDon,
    });
}

