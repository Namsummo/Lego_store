import { z } from "zod";

export const khuyenMaiSchema = z.object({
  tenKhuyenMai: z.string().min(1, "Tên khuyến mãi không được bỏ trống"),
  phanTramKhuyenMai: z.number().min(0).max(60),
  ngayBatDau: z.string(),
  ngayKetThuc: z.string(),
});

export type KhuyenMaiData = z.infer<typeof khuyenMaiSchema>;
