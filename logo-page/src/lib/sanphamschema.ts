import { z } from "zod";

export const productSchema = z.object({
  tenSanPham: z.string().nonempty("Tên sản phẩm là bắt buộc"),
  gia: z.number().min(1000, "Giá phải lớn hơn 1000đ"),
  soLuongTon: z.number().min(0, "Số lượng tồn phải >= 0"),
  trangThai: z.string().nonempty("Trạng thái là bắt buộc"),
  soLuongManhGhep: z.number().optional(),
  moTa: z.string().nonempty("Không để trống mô tả"),
  anhDaiDien: z.string().optional().nullable(),
  doTuoi: z.number().optional(),  
  danhMucId: z.number({ required_error: "Danh mục là bắt buộc" }),
  boSuuTapId: z.number({ required_error: "Bộ sưu tập là bắt buộc" }),
});

export type ProductData = z.infer<typeof productSchema>;
