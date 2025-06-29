"use client";

import { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

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
      idDanhMuc: undefined,
      idBoSuuTap: undefined,
      gia: 1000,
      doTuoi: undefined,
      trangThai: "Đang kinh doanh",
      // anhDaiDien: "",
      soLuongTon: undefined,
      soLuongManhGhep: undefined,
    },
  });

  const { data: danhMucList = [], isLoading: isLoadingDanhMuc } = useDanhMuc();
  const { data: BoSuuTapList = [], isLoading: isLoadingBoSuuTap } =
    useBoSuutap();

  useEffect(() => {
    if (edittingSanPham) {
      form.reset({
        tenSanPham: edittingSanPham.tenSanPham,
        moTa: edittingSanPham.moTa ?? "",
        idDanhMuc: edittingSanPham.idDanhMuc,
        idBoSuuTap: edittingSanPham.idBoSuuTap,
        soLuongTon: edittingSanPham.soLuongTon,
        gia: edittingSanPham.gia,
        doTuoi: edittingSanPham.doTuoi,
        soLuongManhGhep: edittingSanPham.soLuongManhGhep,
        trangThai: edittingSanPham.trangThai,
      });
    } else {
      form.reset();
    }
  }, [edittingSanPham, form]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      const sl = values.soLuongTon ?? 0;
      const current = values.trangThai;

      const expected = sl > 0 ? "Đang kinh doanh" : "Ngừng kinh doanh";

      if (current !== expected) {
        form.setValue("trangThai", expected);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          console.log("Submit update:", data, edittingSanPham?.id);
          await onSubmit(data, edittingSanPham?.id);
          onSucces?.();
        })}
        className="gap-2 p-2 flex-col flex "
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
                <Textarea
                  placeholder="Nhập mô tả sản phẩm"
                  {...field}
                  className="h-30"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap  gap-4">
          <div className="basis-full sm:basis-1/2 lg:basis-1/3">
            <FormField
              control={form.control}
              name="idDanhMuc"
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
          </div>
          <div className="basis-full sm:basis-1/2 lg:basis-1/3">
            <FormField
              control={form.control}
              name="idBoSuuTap"
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
          </div>
          <div className="basis-full sm:basis-1/2 lg:basis-1/3">
            <FormField
              control={form.control}
              name="doTuoi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Độ tuổi</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : +value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="basis-full sm:basis-1/2 lg:basis-1/3">
            <FormField
              control={form.control}
              name="gia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : +value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="basis-full sm:basis-1/2 lg:basis-1/3">
            <FormField
              control={form.control}
              name="soLuongTon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng tồn</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : +value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="basis-full sm:basis-1/2 lg:basis-1/3">
            <FormField
              control={form.control}
              name="soLuongManhGhep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng mảnh ghép</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : +value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className=" basis-full sm:basis-1/2 lg:basis-1/3">
            <FormField
              control={form.control}
              name="trangThai"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled
                      className="bg-gray-200 text-gray-200"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex gap-3 items-center mt-4 mb-2 ">
          <span> Nổi bật</span>
          <Switch />
        </div>

        <div className="flex gap-2">
          <Button type="submit">
            {edittingSanPham ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
          </Button>
          {edittingSanPham && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onSucces?.();
                form.reset();
                // setPreview(null);
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
