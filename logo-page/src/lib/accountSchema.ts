import { z } from "zod";

export const accountSchema = z.object({
  ten: z.string().min(1, "Vui lòng nhập tên"),
  email: z.string().email("Email không hợp lệ"),
  matKhau: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  sdt: z.string().min(10, "SĐT phải có ít nhất 10 số").regex(/^\d+$/, "SĐT chỉ được chứa số"),
  diaChi: z.string().min(1, "Vui lòng nhập địa chỉ"),
  roleId: z.number({
    required_error: "Vui lòng chọn vai trò",
  }),
  trangThai: z.number(),
});

export type AccountFormData = z.infer<typeof accountSchema>;