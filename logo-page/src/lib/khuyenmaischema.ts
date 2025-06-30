// lib/khuyenmaischema.ts
import { z } from "zod";

export const khuyenMaiSchema = z
  .object({
    tenKhuyenMai: z
      .string()
      .min(1, "Tên khuyến mãi không được để trống")
      .max(200, "Tên khuyến mãi không được vượt quá 200 ký tự"),

    phanTramKhuyenMai: z
      .number({
        required_error: "Phần trăm giảm là bắt buộc",
        invalid_type_error: "Phần trăm phải là số",
      })
      .min(0, "Phần trăm giảm phải lớn hơn hoặc bằng 0")
      .max(60, "Phần trăm giảm không được vượt quá 60"),

    ngayBatDau: z.date({ required_error: "Vui lòng chọn ngày bắt đầu" }),
    ngayKetThuc: z.date({ required_error: "Vui lòng chọn ngày kết thúc" }),
  })
  .refine((data) => data.ngayBatDau <= data.ngayKetThuc, {
    message: "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc",
    path: ["ngayKetThuc"],
  });

export type KhuyenMaiData = z.infer<typeof khuyenMaiSchema>;
