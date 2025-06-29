import { AnhSanPhamChiTiet } from "@/components/types/product.type";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddAnhSanPham,
  useAnhSanPhamTheoSanPhamId,
  useSuaAnhSanPham,
  useXoaAnhSanPham,
} from "@/hooks/useAnhSanPham";
import { AnhSanPhamData, anhSanPhamSchema } from "@/lib/sanphamschema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@radix-ui/react-dialog";
import { Edit, EyeIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
interface Props {
  sanPhamId: number;
  maSanPham: string;
  tenSanPham: string;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (val: boolean) => void;
}
const soThuTu = [1, 2, 3, 4, 5];
export default function AnhSanPhamManager({
  sanPhamId,
  maSanPham,
  tenSanPham,
  trigger = <EyeIcon size={4} />,
  open,
  onOpenChange,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const { mutate: addAnhSanPham, isPending } = useAddAnhSanPham();
  const { mutate: suaAnhSanPham } = useSuaAnhSanPham();
  const { mutate: xoaAnh } = useXoaAnhSanPham();
  const { data: anhSp = [] } = useAnhSanPhamTheoSanPhamId(sanPhamId);
  const [editMode, setEditMode] = useState(false);
  const [anhDangSua, setAnhDangSua] = useState<AnhSanPhamChiTiet | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const useOrders = anhSp.map((a) => a.thuTu);
  const availableOrders = soThuTu.filter((stt) => !useOrders.includes(stt));

  console.log(anhSp);
  const form = useForm<AnhSanPhamData>({
    resolver: zodResolver(anhSanPhamSchema),
    defaultValues: {
      sanPhamId,
      anhChinh: false,
    },
  });
  function onSubmit(data: AnhSanPhamData) {
    if (editMode && anhDangSua?.id) {
      const formData = new FormData();
      formData.append("thuTu", data.thuTu?.toString() ?? "");
      formData.append("anhChinh", data.anhChinh ? "true" : "false");
      formData.append("sanPhamId", data.sanPhamId.toString());
      if (data.file?.[0]) {
        formData.append("file", data.file[0]);
      }
      suaAnhSanPham(
        {
          id: anhDangSua.id,
          data: {
            file: data.file?.[0],
            thuTu: data.thuTu,
            anhChinh: data.anhChinh,
            sanPhamId,
          },
        },
        {
          onSuccess: () => {
            toast.success("Cập nhật thành công");
            form.reset();
            setAnhDangSua(null);
            setEditMode(false);
            setPreview(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          },
        }
      );
    } else {
      if (data.thuTu && useOrders.includes(data.thuTu)) {
        form.setError("thuTu", {
          message: `Só thứ tự ${data.thuTu} đã được sử dụng`,
        });
        return;
      }
      if (data.file?.[0]) {
        const xetAnhChinh = anhSp.some((img) => img.anhChinh);
        if (data.anhChinh && xetAnhChinh) {
          confirm(
            "Có ảnh chính hiện tại. Bạn có muốn thay đổi ảnh chính không?"
          );
        }
        addAnhSanPham(
          {
            files: [data.file[0]],
            sanPhamId,
            thuTu: data.thuTu,
            anhChinh: data.anhChinh,
          },
          {
            onSuccess: () => {
              form.reset({
                sanPhamId,
                anhChinh: false,
                thuTu: undefined,
                file: undefined,
                moTa: "",
              });
              setPreview(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
              toast.success("Thêm ảnh thành công");
            },
          }
        );
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="bg-gray-900 max-w-none w-[98vw] xl:w-[1800px] rounded-xl overflow-y-auto"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Quản lý ảnh sản phẩm với mã {maSanPham}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Tên sản phẩm: {tenSanPham ?? "Không rõ"}
          </p>

          {/* Form Ảnh */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ảnh</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPreview(URL.createObjectURL(file));
                            field.onChange(e.target.files);
                          }
                        }}
                      />
                    </FormControl>
                    {preview && (
                      <Image
                        src={preview}
                        alt="preview"
                        width={128}
                        height={128}
                        unoptimized
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thuTu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ tự</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn số thứ tự" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOrders.length === 0 ? (
                            <p className="text-sm px-4 py-2 text-muted-foreground">
                              Đã hết số thứ tự
                            </p>
                          ) : (
                            availableOrders.map((stt) => (
                              <SelectItem key={stt} value={stt.toString()}>
                                {stt}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anhChinh"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="anhChinh"
                      />
                    </FormControl>
                    <FormLabel htmlFor="anhChinh">Ảnh chính</FormLabel>
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {editMode
                    ? isPending
                      ? "Đang cập nhật..."
                      : "Cập nhật ảnh"
                    : isPending
                    ? "Đang tải lên... "
                    : "Tải ảnh lên"}
                </Button>
                {editMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditMode(false);
                      setAnhDangSua(null);
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
          {/* Danh sách ảnh */}
          <div className="grid grid-cols-4 gap-4 mt-3 rounded-2xl">
            {anhSp.length === 0 ? (
              <p>Chưa có ảnh cho sản phẩm</p>
            ) : (
              anhSp.map((anh: AnhSanPhamChiTiet, idx) => (
                <div
                  key={anh.id ?? idx}
                  className="relative group border border-gray-200 rounded-xl p-2 shadow-md"
                >
                  <Image
                    src={`http://localhost:8080/api/anhsp/images/${anh.url}`}
                    alt="Ảnh sản phẩm"
                    width={128}
                    height={128}
                    unoptimized
                    className="w-full aspect-square object-cover rounded"
                  />

                  <p className="text-sm mt-2">Thứ tự ảnh: {anh.thuTu} </p>
                  {anh.anhChinh && (
                    <span className="absolute top-1 left-1  bg-green-500 text-white text-xs px-1 rounded ">
                      Ảnh chính
                    </span>
                  )}
                  <div className="flex items-center gap-2 justify-between">
                    <Button
                      onClick={() => {
                        if (anh.id) {
                          xoaAnh(anh.id);
                          toast.success("Xóa ảnh thành công!");
                        } else {
                          console.error("ID ảnh không hợp lệ:", anh);
                          toast.error("ID ảnh không hợp lệ, không thể xóa.");
                        }
                      }}
                      className=" size-7 text-red-500 hover:text-red-700"
                      title="Xóa ảnh"
                    >
                      <Trash2Icon size={16} />
                    </Button>
                    <Button
                      onClick={() => {
                        setEditMode(true);
                        setAnhDangSua(anh);
                        setPreview(
                          `http://localhost:8080/api/anhsp/images/${anh.url}`
                        );
                        form.reset({
                          sanPhamId,
                          thuTu: anh.thuTu,
                          anhChinh: anh.anhChinh,
                        });
                      }}
                      className="size-7 text-blue-500 hover:text-blue-700"
                      title="Chỉnh sửa ảnh"
                    >
                      <Edit size={16} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
