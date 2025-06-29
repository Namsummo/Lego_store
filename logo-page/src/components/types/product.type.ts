export interface AnhSanPhamChiTiet {
  id: number;
  url: string;
  moTa: string;
  thuTu: number;
  anhChinh: boolean;
  sanPhamId?: number;
}

export interface DanhMuc {
  id: number;
  tenDanhMuc: string;
  moTa: string;
}

export interface BoSuuTap {
  id: number;
  tenBoSuuTap: string;
  moTa: string;
  namPhatHanh: number;
  ngayTao: number;
}

export interface SanPham {
  id: number;
  tenSanPham: string;
  maSanPham?: string;
  doTuoi?: number;
  moTa?: string;
  gia: number;
  giaKhuyenMai?: number | null;
  soLuong?: number; //
  soLuongManhGhep?: number;
  soLuongTon: number;
  anhDaiDien?: string | null;
  soLuongVote?: number;
  danhGiaTrungBinh?: number;
  ngayTao?: number | string;
  ngaySua?: number | string;
  khuyenMaiId?: number | null;
  trangThai: string;
  idDanhMuc: number;
  idBoSuuTap: number;
  anhSps?: AnhSanPhamChiTiet[];
}
