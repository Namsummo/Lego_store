"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { productSchema, ProductData } from "@/lib/sanphamschema";
import { SanPham } from "@/components/types/product.type";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import { useBoSuutap } from "@/hooks/useBoSutap";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  onSubmit: (data: ProductData, id?: number) => void;
  edittingSanPham?: SanPham | null;
  onSucces?: () => void;
}

export default function SanPhamForm({
  onSubmit,
  edittingSanPham,
  onSucces,
}: Props) {
  const form = useForm<ProductData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      tenSanPham: "",
      moTa: "",
      danhMucId: undefined,
      boSuuTapId: undefined,
      gia: 1000,
      trangThai: "Còn hàng",
      anhDaiDien: "",
      soLuongTon: 1,
      soLuongManhGhep: undefined,
    },
  });

  const [preview, setPreview] = useState<string | null>(null);

  const { data: danhMucList = [], isLoading: isLoadingDanhMuc } = useDanhMuc();
  const { data: BoSuuTapList = [], isLoading: isLoadingBoSuuTap } =
    useBoSuutap();

  useEffect(() => {
    if (edittingSanPham) {
      form.reset({
        tenSanPham: edittingSanPham.tenSanPham,
        moTa: edittingSanPham.moTa ?? "",
        danhMucId: edittingSanPham.idDanhMuc,
        boSuuTapId: edittingSanPham.idBoSuuTap,
        soLuongTon: edittingSanPham.soLuongTon,
        gia: edittingSanPham.gia,
        soLuongManhGhep: edittingSanPham.soLuongManhGhep,
        trangThai: edittingSanPham.trangThai,
        anhDaiDien: edittingSanPham.anhDaiDien ?? "",
      });
      setPreview(edittingSanPham.anhDaiDien ?? null);
    } else {
      form.reset();
      setPreview(null);
    }
  }, [edittingSanPham, form]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      const sl = values.soLuongTon ?? 0;
      const expectedTrangThai = sl > 0 ? "Còn hàng" : "Hết hàng";

      if (values.trangThai !== expectedTrangThai) {
        form.setValue("trangThai", expectedTrangThai);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          await onSubmit(data, edittingSanPham?.id);
          setPreview(null);
          onSucces?.();
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="tenSanPham"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên sản phẩm</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên sản phẩm" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="moTa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Input placeholder="Nhập mô tả sản phẩm" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-4">
          <FormField
            control={form.control}
            name="danhMucId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                    disabled={isLoadingDanhMuc}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {danhMucList.map((dm) => (
                        <SelectItem key={dm.id} value={dm.id.toString()}>
                          {dm.tenDanhMuc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="boSuuTapId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bộ Sưu Tập</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                    disabled={isLoadingBoSuuTap}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn bộ sưu tập" />
                    </SelectTrigger>
                    <SelectContent>
                      {BoSuuTapList.map((bst) => (
                        <SelectItem key={bst.id} value={bst.id.toString()}>
                          {bst.tenBoSuuTap}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(+e.target.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="soLuongTon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số lượng tồn</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(+e.target.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="soLuongManhGhep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số lượng mảnh ghép</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(+e.target.value)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trangThai"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Còn hàng">Còn hàng</SelectItem>
                      <SelectItem value="Hết hàng">Hết hàng</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="anhDaiDien"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ảnh đại diện</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setPreview(url);
                      field.onChange(url);
                    }
                  }}
                />
              </FormControl>
              {preview && (
                <div className="mt-2 w-40 h-40 relative">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit">
            {edittingSanPham ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
          </Button>
          {edittingSanPham && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setPreview(null);
              }}
            >
              Hủy chỉnh sửa
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
