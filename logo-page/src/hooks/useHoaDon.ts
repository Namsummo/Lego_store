import { HoaDonDTO } from "@/components/types/hoaDon-types";
import { HoaDonService } from "@/services/hoaDonService";
import { useQuery } from "@tanstack/react-query";

interface PagedHoaDonResponse {
    content: HoaDonDTO[];
    totalPages: number;
    totalElements: number;
    number: number;
}

const FIVE_MINUTES = 1000 * 60 * 5;

export function useHoaDonPaging(page: number, size: number = 10) {
    return useQuery<PagedHoaDonResponse, Error>({
        queryKey: ['hoaDons', page, size],
        queryFn: () => HoaDonService.getPagedHoaDons(page, size),
        keepPreviousData: true,
        staleTime: FIVE_MINUTES,
    });
}
