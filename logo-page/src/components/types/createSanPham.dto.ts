// src/types/createSanPham.dto.ts
export interface CreateSanPhamDto {
  tenSanPham: string;
  moTa?: string;
  gia: number;
  soLuongTon: number;
  trangThai: string;
  anhDaiDien?: string | null;
  danhMucId: number;
  boSuuTapId: number;
  doTuoi?: number;
  soLuongManhGhep?: number;
}
