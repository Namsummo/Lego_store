# Chức năng Quản lý Đánh giá và Phản hồi

## Tổng quan
Chức năng này cho phép admin quản lý đánh giá của khách hàng và phản hồi lại cho họ.

## Các chức năng chính

### 1. Xem danh sách đánh giá
- Hiển thị tất cả đánh giá từ khách hàng
- Thông tin bao gồm: tên khách hàng, số sao, ngày đánh giá, nội dung, hình ảnh/video đính kèm
- Sắp xếp theo ngày đánh giá mới nhất

### 2. Lọc đánh giá
- Lọc theo số sao (1-5 sao hoặc tất cả)
- Lọc theo loại: có hình ảnh, có video, có phản hồi
- Kết hợp nhiều bộ lọc

### 3. Phản hồi đánh giá

#### Thêm phản hồi mới
- Click vào nút "Phản hồi" trong dropdown menu
- Nhập nội dung phản hồi (tối đa 1000 ký tự)
- Click "Gửi phản hồi" để lưu

#### Sửa phản hồi
- Click vào nút "Sửa phản hồi" trong dropdown menu hoặc icon bút chì
- Chỉnh sửa nội dung phản hồi
- Click "Cập nhật" để lưu thay đổi

#### Xóa phản hồi
- Click vào icon thùng rác bên cạnh phản hồi
- Xác nhận xóa trong dialog
- Hoặc xóa bằng cách để trống nội dung và lưu

### 4. Xóa đánh giá
- Click vào "Xóa đánh giá" trong dropdown menu
- Xác nhận xóa

## Logic xử lý phản hồi

### API Endpoint
Tất cả các thao tác phản hồi đều sử dụng endpoint `PUT /api/lego-store/danh-gia/update/{idDanhGia}/{idNv}`

### Các trường hợp:
1. **Thêm phản hồi**: Gửi `phanHoi` với nội dung
2. **Sửa phản hồi**: Gửi `phanHoi` với nội dung mới
3. **Xóa phản hồi**: Gửi `phanHoi` với giá trị rỗng `""`

### Hiển thị phản hồi
- Chỉ hiển thị phản hồi khi `textPhanHoi` có giá trị và không rỗng
- Nếu `textPhanHoi` là `null`, `undefined`, hoặc chuỗi rỗng thì không hiển thị

## Validation

### Phản hồi
- Không được để trống khi thêm/sửa
- Tối đa 1000 ký tự
- Tự động trim khoảng trắng đầu cuối

### Error Handling
- Hiển thị thông báo lỗi cụ thể
- Loading state khi đang xử lý
- Disable button khi đang submit

## Cấu trúc dữ liệu

```typescript
interface DanhGiaResponse {
    id: number;
    tieuDe: string;
    textDanhGia: string;
    textPhanHoi?: string; // null/undefined/empty = không có phản hồi
    soSao: number;
    ngayDanhGia: string | number[];
    // ... các field khác
}
```

## Components chính

- `ReviewList`: Hiển thị danh sách đánh giá
- `ReviewItem`: Hiển thị từng đánh giá và phản hồi
- `ReplyDialog`: Dialog để thêm/sửa phản hồi
- `DeleteReplyDialog`: Dialog xác nhận xóa phản hồi
- `ReviewFilter`: Bộ lọc đánh giá
- `ReviewStats`: Thống kê đánh giá

## Hooks

- `useReviews`: Lấy danh sách đánh giá
- `useUpdateDanhGia`: Cập nhật phản hồi
- `useDeleteDanhGia`: Xóa đánh giá

## Service

- `danhGiaService.update()`: Xử lý tất cả thao tác phản hồi
- Validation và error handling
- Tự động trim và kiểm tra độ dài 