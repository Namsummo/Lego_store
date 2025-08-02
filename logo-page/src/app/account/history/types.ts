
export interface SanPham {
    id: number;
    maSanPham: string;
    tenSanPham: string;
    gia: number;
}

export interface ChiTietSanPham {
    spId: number | { id: number };
    soLuong: number;
    gia?: number;
    sanPham?: SanPham | null;
}

export interface BaseOrder {
    id: number;
    maHD: string;
    ngayTao: string;
    trangThai: string;
    tongTien: number;
    diaChiGiaoHang?: string;
    loaiVanChuyen?: number;
    isFast?: number;
    phiShip?: number;
    tenNguoiNhan?: string;
    sdt?: string;
    tamTinh?: number;
    soTienGiam?: number;
    phuongThucThanhToan?: string;
}

export type EnrichedOrder = BaseOrder & { chiTietSanPham: ChiTietSanPham[] };
