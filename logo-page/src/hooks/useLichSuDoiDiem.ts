import { useQuery } from '@tanstack/react-query';
import { lichSuDoiDiemService, LichSuDoiDiemResponse } from '@/services/lichSuDoiDiemService';

export const useLichSuDoiDiem = (userId?: number) => {
  return useQuery<LichSuDoiDiemResponse[]>({
    queryKey: ['lichSuDoiDiem', userId],
    queryFn: () => lichSuDoiDiemService.getLichSuDoiDiem(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
};
