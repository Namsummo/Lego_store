export interface KhuyenMaiDTO {
  maKhuyenMai?: string;
  tenKhuyenMai: string;
  phanTramKhuyenMai: number;
  ngayBatDau: string; // ISO hoặc "dd-MM-yyyy HH:mm:ss"
  ngayKetThuc: string;
  ngayTao?: string;
  trangThai?: string;
}

export interface KhuyenMaiSanPhamDTO {
  khuyenMaiId: number;
  listSanPhamId: number[];
}

// SanPhamKMResponse.ts
export interface SanPhamKMResponse {
  id: number;
  tenSanPham: string;
  maSanPham: string;
  doTuoi: number | null;
  moTa: string | null;
  gia: number;
  soLuongManhGhep: number | null;
  soLuongTon: number;
  soLuongVote: number;
  danhGiaTrungBinh: number;
  idDanhMuc: number | null;
  idBoSuuTap: number | null;
  trangThai: string;
  giaKhuyenMai: number | null;
  phanTramKhuyenMai: number | null;
}
