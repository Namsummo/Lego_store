export interface viPhieuGiamGia {
    id: Number,
    userId: Number,
    voucherId: number,
    ngayNhan: string | Date,

}
export interface vuocher {
    id: number;
    ngayNhan: string | Date;
    maPhieu: string;
    tenPhieu: string;
    soLuong: number;
    loaiPhieuGiam: string;
    giaTriToiThieu: number;
    giaTriGiam: number;
    giamTriToiDa: number;
    ngayBatDau: string;
    ngayKetThuc: string;
    trangThaiThucTe: string;
}