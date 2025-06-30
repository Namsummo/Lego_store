"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-picker";
import { khuyenMaiSchema, KhuyenMaiData } from "@/lib/khuyenmaischema";
import { useAddKhuyenMai, useEditKhuyenMai } from "@/hooks/useKhuyenmai";
import { KhuyenMaiDTO } from "@/components/types/khuyenmai-type";
import { useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  editing: KhuyenMaiDTO | null;
  setEditing: (data: KhuyenMaiDTO | null) => void;
  onSucces: () => void;
}
export default function KhuyenMaiForm({ editing, setEditing }: Props) {
  const form = useForm<KhuyenMaiData>({
    resolver: zodResolver(khuyenMaiSchema),
    defaultValues: {
      tenKhuyenMai: "",
      phanTramKhuyenMai: 10,
      ngayBatDau: new Date(),
      ngayKetThuc: new Date(),
    },
  });
  const parseDate = (dateString: string) => {
    const pared = parse(dateString, "dd-MM-YYYY HH:mm:ss", new Date());
    return isNaN(pared.getTime()) ? new Date() : pared;
  };
  useEffect(() => {
    if (editing) {
      form.reset({
        tenKhuyenMai: editing.tenKhuyenMai,
        phanTramKhuyenMai: editing.phanTramKhuyenMai,
        ngayBatDau: parseDate(editing.ngayBatDau),
        ngayKetThuc: parseDate(editing.ngayKetThuc),
      });
    }
  }, [editing, form]);

  const addKhuyenMai = useAddKhuyenMai();
  const editKhuyenMai = useEditKhuyenMai();

  const onSubmit = (data: KhuyenMaiData) => {
    const now = new Date();
    if (data.ngayBatDau < now) {
      toast.error("Ngày bắt đầu phải từ hôm nay trở đi");
      return;
    }
    const payload = {
      ...data,
      ngayBatDau: format(data.ngayBatDau, "dd-MM-yyyy HH:mm:ss"),
      ngayKetThuc: format(data.ngayKetThuc, "dd-MM-yyyy HH:mm:ss"),
    };
    if (editing) {
      editKhuyenMai.mutate(
        {
          id: editing.id,
          data: {
            ...payload,
            id: editing.id,
            trangThai: editing.trangThai,
          },
        },
        {
          onSuccess: () => {
            toast.success("Sửa khuyến mãi thành công!");
            setEditing(null);
            form.reset();
          },
          onError: () => {
            toast.error("Sửa thất bại");
          },
        }
      );
    } else {
      addKhuyenMai.mutate(payload, {
        onSuccess: () => {
          toast.success("Thêm khuyến mãi thành công");
          form.reset();
        },
        onError: () => {
          toast.error("Thêm khuyến mãi thất bại");
        },
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="glass-card p-6 mb-8 rounded-md border border-white/20 bg-[#10123c]"
    >
      <Form {...form}>
        <p className="text-2xl font-bold">Khuyến mãi</p>
        <form className="space-y-6 mt-2" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Tên khuyến mãi */}
          <FormField
            control={form.control}
            name="tenKhuyenMai"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên Khuyến Mãi</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên khuyến mãi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phần trăm */}
          <FormField
            control={form.control}
            name="phanTramKhuyenMai"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phần trăm khuyến mãi (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0 - 60"
                    {...field}
                    onChange={(e) => field.onChange(+e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ngày bắt đầu - kết thúc */}
          <div className="flex gap-3">
            <FormField
              control={form.control}
              name="ngayBatDau"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày bắt đầu</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ngayKetThuc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày kết thúc</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-2">
            <Button type="submit">
              {editing ? "Sửa khuyến mãi" : "Thêm khuyến mãi"}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(null);
                  form.reset({
                    tenKhuyenMai: "",
                    phanTramKhuyenMai: 10,
                    ngayBatDau: new Date(),
                    ngayKetThuc: new Date(),
                  });
                }}
              >
                Hủy chỉnh sửa
              </Button>
            )}
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
