import { fetchWithAuth } from './fetchWithAuth';

export interface LichSuDoiDiemResponse {
  id: number;
  diemDaDoi: number;
  ngayDoi: string;
  moTa: string;
  maPhieu?: string;
}

export const lichSuDoiDiemService = {
  // Lấy lịch sử đổi điểm của user
  getLichSuDoiDiem: async (userId: number): Promise<LichSuDoiDiemResponse[]> => {
    const response = await fetchWithAuth(`http://localhost:8080/api/lego-store/vi-phieu-giam-gia/lich-su/${userId}`);
    if (!response.ok) {
      console.error('Lỗi khi lấy lịch sử đổi điểm:', response.status, response.statusText);
      throw new Error('Không thể lấy lịch sử đổi điểm');
    }
    return response.json();
  }
};
