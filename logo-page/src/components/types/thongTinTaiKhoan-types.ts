
export interface ThongTinNguoiNhan {
    id?: number;
    hoTen: string;
    sdt: string;
    duong: string;
    xa: string;
    thanhPho: string;
    isMacDinh: number | boolean;
    idUser: number;
}

export interface DTOThongTinNguoiNhan {
    hoTen: string;
    sdt: string;
    duong: string;
    xa: string;
    thanhPho: string;
    isMacDinh: number; // Đổi từ boolean thành number
    idUser: number;
}

