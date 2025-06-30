import { z } from "zod";

export const productSchema = z.object({
  tenSanPham: z
    .string()
    .nonempty("Tên sản phẩm là bắt buộc")
    .max(200, "Tên sản phẩm không được vượt quá 200 ký tự"),
  gia: z.number().min(1000, "Giá bắt đầu từ 1000đ"),
  soLuongTon: z.number().min(0, "Số lượng tồn phải >= 0"),
  trangThai: z.string().nonempty(),
  soLuongManhGhep: z
    .number({ required_error: "Số lương mảnh ghép là bắt buộc" })
    .min(0, "Số lượng mảnh ghép phải lớn hơn 0"),
  moTa: z
    .string()
    .nonempty("Mô tả sản phẩm là bắt buộc")
    .max(1000, "Mô tả không được vượt quá 1000 ký tự"),
  // anhDaiDien: z.string().optional().nullable(),
  doTuoi: z
    .number({ required_error: "Độ tuổi là bắt buộc" })
    .min(6, "Tuổi phải lớn hơn hoặc bằng 6 và nhỏ hơn hoặc bằng 50 ")
    .max(50, "Tuổi phải lớn hơn hoặc bằng 6 và nhỏ hơn hoặc bằng 50 "),
  danhMucId: z.number({ required_error: "Danh mục là bắt buộc" }),
  boSuuTapId: z.number({ required_error: "Bộ sưu tập là bắt buộc" }),
});

export const anhSanPhamSchema = z.object({
  file: z.any().refine((file) => file?.length === 1, "Cần chọn đúng 1 ảnh"),
  thuTu: z.number({ required_error: "Không để trống số thứ tự" }),
  anhChinh: z.boolean(),
  sanPhamId: z.coerce.number().min(1, "Phải có ID sản phẩm"),
  moTa: z.string().optional(),
});

export type ProductData = z.infer<typeof productSchema>;
export type AnhSanPhamData = z.infer<typeof anhSanPhamSchema>;
