export interface DanhGiaResponse {
    id: number;
    tenKH?: string; // Tên khách hàng từ backend
    tieuDe: string;
    textDanhGia: string;
    textPhanHoi?: string;
    soSao: number;
    ngayDanhGia: string | number[]; // LocalDateTime from Java - can be string or array
    ngayPhanHoi?: string | number[]; // LocalDateTime from Java - can be string or array
    userId?: number;
    nvId?: number;
    dhctId?: number;
    spId?: number;
    maSP?: string; // Mã sản phẩm từ backend
    tenSP?: string; // Tên sản phẩm từ backend
    anhUrls?: AnhResponse[];
    video?: AnhResponse;
    // Thêm các field từ file cũ
    tenNguoiDung?: string;
    user?: {
        id: number;
        ten: string;
        email: string;
        ngayTao: number[];
    };
}

export interface AnhResponse {
    id: number;
    url: string;
}

export interface CreateDanhGiaDTO {
    user_id: number;
    sp_id: number;
    tieuDe: string;
    textDanhGia: string;
    soSao: number;
}

export interface ReviewStatsProps {
    reviews: DanhGiaResponse[];
}

export interface ReviewListProps {
    reviews: DanhGiaResponse[];
    filterRating: string;
    filterType: string;
    filterDate: string;
    onUpdateReview: (reviewId: number, updatedReview: DanhGiaResponse) => Promise<void>;
    onDeleteReview: (reviewId: number) => Promise<void>;
}

export interface ReviewItemProps {
    review: DanhGiaResponse;
    onUpdateReview: (reviewId: number, updatedReview: DanhGiaResponse) => Promise<void>;
    onDeleteReview: (reviewId: number) => Promise<void>;
}

export interface ReplyDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => Promise<void>;
    replyText: string;
    setReplyText: (text: string) => void;
    customerName: string;
    hasExistingReply: boolean;
}

export interface DeleteReplyDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    customerName: string;
}

export interface ReviewFilterProps {
    filterRating: string;
    filterType: string;
    filterDate: string;
    onFilterChange: (value: string) => void;
    onFilterTypeChange: (value: string) => void;
    onFilterDateChange: (value: string) => void;
}

export interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    color: string;
}


