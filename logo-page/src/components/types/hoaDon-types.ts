import { SanPham } from "./product.type";

export interface HoaDonDTO {
  id: number;
  tamTinh: number;
  tongTien: number;
  soTienGiam: number;
  diaChiGiaoHang: string;
  maVanChuyen: string;
  ngayGiao: Date;
  ngayTao: number | Date | string;
  trangThai: TrangThaiHoaDon;
  phuongThucThanhToan: PaymentMethods;
  userId: number;
  ten: string;
  sdt: string;
  nvName: string;
  pggid?: number;
  maPGG?: string;
}
export enum TrangThaiHoaDon {
  PENDING = "Pending",
  PROCESSING = "Processing",
  SHIPPING = "Shipping",
  DELIVERED = "Delivered",
  CANCELLED = "Cancelled",
  RETURNING = "Returning",
  REFUNDED = "Refunded",
}

export enum PaymentMethods {
  CASH = "Tiền mặt",
  BANK_TRANSFER = "Chuyển khoản",
  CASH_ON_DELIVERY = "COD",
}

export interface HoaDonDetailDTO {
  id: number;
  hdId: number;
  spId: number;
  tensp: string;
  masp: string;
  soLuong: number;
  gia: number;
  tongTien: number;
}
