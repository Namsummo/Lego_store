import { z } from "zod";

export const phieuGiamGiaSchema = z
  .object({
    soLuong: z
      .number({ required_error: "Số lượng không được để trống" })
      .min(1, { message: "Số lượng phải lớn hơn hoặc bằng 1" }),

    loaiPhieuGiam: z.enum(["Theo %", "Theo số tiền"], {
      required_error: "Không để trống loại phiếu giảm",
    }),

    giaTriGiam: z
      .number({ required_error: "Giá trị giảm không được để trống" })
      .gt(0, { message: "Giá trị giảm phải lớn hơn 0" }),

    giamToiDa: z.number().nullable().optional(),

    giaTriToiThieu: z
      .number({ required_error: "Giá trị tối thiểu không được để trống" })
      .min(0, { message: "Giá trị tối thiểu phải lớn hơn hoặc bằng 0" }),

    ngayBatDau: z.date({ required_error: "Vui lòng chọn ngày bắt đầu" }),
    ngayKetThuc: z.date({ required_error: "Vui lòng chọn ngày kết thúc" }),
  })
  .refine((data) => data.ngayKetThuc > data.ngayBatDau, {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["ngayKetThuc"],
  })
  .refine(
    (data) => {
      if (data.loaiPhieuGiam === "Theo %") {
        return data.giaTriGiam < 100;
      }
      return true;
    },
    {
      message: "Giá trị giảm (%) phải nhỏ hơn 100",
      path: ["giaTriGiam"],
    }
  )
  .refine(
    (data) => {
      if (data.loaiPhieuGiam === "Theo %") {
        return data.giamToiDa != null && data.giamToiDa > 0;
      }
      return true;
    },
    {
      message: "Giảm tối đa phải lớn hơn 0 (với phiếu giảm theo %)",
      path: ["giamToiDa"],
    }
  )
  .refine(
    (data) => {
      if (data.loaiPhieuGiam === "Theo số tiền" && data.giamToiDa != null) {
        return data.giaTriGiam <= data.giamToiDa;
      }
      return true;
    },
    {
      message: "Giá trị giảm không được lớn hơn giảm tối đa",
      path: ["giaTriGiam"],
    }
  );

export type PhieuGiamGiaData = z.infer<typeof phieuGiamGiaSchema>;
