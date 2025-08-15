export enum TrangThaiPhieuHoan {
    CHO_DUYET = "CHO_DUYET",
    DA_DUYET = "DA_DUYET",
    TU_CHOI = "TU_CHOI",
}

export enum TrangThaiThanhToan {
    CHUA_HOAN = "CHUA_HOAN",
    DA_HOAN = "DA_HOAN",

}

export interface PhieuHoanHangDTO {
    id?: number;
    idHoaDon: number;
    lyDoHoan: string;
    soTienHoan: number;
    trangThai?: TrangThaiPhieuHoan;
    trangThaiThanhToan?: TrangThaiThanhToan;
    ngayTao?: string;
}

export interface ErrorResponse {
    status: number;
    message: string;
}

export interface PhieuHoanHang {
    id: number;
    idHoaDon: number;
    lyDoHoan: string;
    soTienHoan: number;
    trangThai: TrangThaiPhieuHoan;
    trangThaiThanhToan: TrangThaiThanhToan;
    ngayTao: string;
}