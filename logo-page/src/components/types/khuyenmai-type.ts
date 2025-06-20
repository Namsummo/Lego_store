export interface KhuyenMai {
    id: number;
    maKhuyenMai: string;
    soLuong: number;
    giaTriGiam: number;
    giaTriToiDa: number;
    moTa: string;
    phanTramGiam: number;
    ngayBatDau: string;
    ngayKetThuc: string;
    trangThai: TrangThaiKhuyenMai;
    sanPhamApDung: string;
   
}

export enum TrangThaiKhuyenMai {
    DangHoatDong = 'Đang hoạt động',
    SapHoatDong = 'Sắp hoạt động',
    DaKetThuc = 'Đã kết thúc',
}
