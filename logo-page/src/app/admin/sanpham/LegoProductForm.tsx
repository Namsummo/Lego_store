"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Package,
  DollarSign,
  Layers,
  ImageOff,
  PlusCircle,
  ToyBrick as Brick,
  Palette,
  Users as AgeIcon,
  ChevronsUpDown,
  Archive,
  // Star,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/context/use-toast";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import { useBoSuutap } from "@/hooks/useBoSutap";
import { SanPham } from "@/components/types/product.type";

export interface ProductFormData {
  id: number;
  tenSanPham: string;
  maSanPham: string;
  doTuoi: string;
  moTa: string;
  gia: string;
  giaKhuyenMai: string; // Lưu dưới dạng chuỗi, rỗng nghĩa là null
  soLuong: string; // Số lượng ban đầu khi thêm mới
  soLuongManhGhep: string;
  soLuongTon: string;
  anhDaiDien: string | null;
  danhMucId: string;
  boSuuTapId: string;
  khuyenMaiId: string;
  trangThai: string;
}

interface LegoProductFormProps {
  onSubmit: (data: SanPham) => void; // onSubmit vẫn mong đợi SanPham từ product.type.ts
  productToEdit?: SanPham | null;
  onClearEdit: () => void;
}

const defaultFormData: ProductFormData = {
  id: 0,
  tenSanPham: "",
  maSanPham: "",
  doTuoi: "",
  moTa: "",
  gia: "",
  giaKhuyenMai: "",
  soLuong: "",
  soLuongManhGhep: "",
  soLuongTon: "",
  anhDaiDien: null,
  danhMucId: "",
  boSuuTapId: "",
  khuyenMaiId: "",
  trangThai: "Còn hàng", // ✅ Thêm mặc định trạng thái
};

const trangThaiOptions = ["Còn hàng", "Hết hàng", "Ngừng kinh doanh"];

// ... (phần import giữ nguyên như trước)

const LegoProductForm: React.FC<LegoProductFormProps> = ({
  onSubmit,
  productToEdit,
  onClearEdit,
}) => {
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const { toast } = useToast();
  const {
    data: danhMucList,
    isLoading: isDanhMucLoading,
    error: danhMucError,
  } = useDanhMuc();
  const {
    data: boSuuTapList,
    isLoading: isBoSuuTapLoading,
    error: boSuuTapError,
  } = useBoSuutap();

  useEffect(() => {
    if (danhMucError) {
      toast({ message: "Không thể tải danh sách danh mục.", type: "error" });
    }
    if (boSuuTapError) {
      toast({ message: "Không thể tải danh sách bộ sưu tập.", type: "error" });
    }
  }, [danhMucError, boSuuTapError, toast]);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        id: productToEdit.id,
        tenSanPham: productToEdit.tenSanPham,
        maSanPham: productToEdit.maSanPham || "",
        doTuoi: productToEdit.doTuoi?.toString() || "",
        moTa: productToEdit.moTa,
        gia: productToEdit.gia?.toString() || "",
        giaKhuyenMai: productToEdit.giaKhuyenMai?.toString() || "",
        soLuong: productToEdit.soLuong?.toString() || "",
        soLuongManhGhep: productToEdit.soLuongManhGhep?.toString() || "",
        soLuongTon: productToEdit.soLuongTon?.toString() || "",
        anhDaiDien: productToEdit.anhDaiDien,
        danhMucId: productToEdit.danhMucId?.toString() || "",
        boSuuTapId: productToEdit.boSuuTapId?.toString() || "",
        khuyenMaiId: productToEdit.khuyenMaiId?.toString() || "",
        trangThai: productToEdit.trangThai,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [productToEdit]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (
    field: keyof ProductFormData, // Sử dụng keyof ProductFormData
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const requiredFields: (keyof ProductFormData)[] = [ // Sử dụng keyof ProductFormData
      "tenSanPham",
      "danhMucId",
      "boSuuTapId",
      "soLuongTon",
      "soLuongManhGhep",
      "moTa",
    ];

    const hasEmptyRequired = requiredFields.some(
      (field) => !formData[field] || (formData[field] as string).trim() === ""
    );

    if (hasEmptyRequired) {
      toast({
        message: "Vui lòng điền đầy đủ các trường bắt buộc (*).",
        type: "error",
      });
      return;
    }
  
    const processedData: SanPham = { // Đây là SanPham từ product.type.ts
      id: productToEdit ? productToEdit.id : 0, // id đã là number từ productToEdit
      tenSanPham: formData.tenSanPham.trim(),
      maSanPham: formData.maSanPham?.trim() || "",
      moTa: formData.moTa.trim(),
      gia: Number(formData.gia),
      giaKhuyenMai:
        formData.giaKhuyenMai.trim() !== ""
          ? Number(formData.giaKhuyenMai)
          : null,
      soLuong: Number(formData.soLuong), // Đây là số lượng ban đầu, API sẽ quyết định dùng nó hay không
      soLuongManhGhep: Number(formData.soLuongManhGhep),
      soLuongTon: Number(formData.soLuongTon),
      doTuoi:
        formData.doTuoi.trim() !== ""
          ? Number(formData.doTuoi)
          : 0,
      danhMucId: Number(formData.danhMucId),
      boSuuTapId: Number(formData.boSuuTapId),
      khuyenMaiId:
          formData.khuyenMaiId.trim() !== ""
          ? Number(formData.khuyenMaiId)
          : null,
      anhDaiDien: formData.anhDaiDien || null,
      trangThai: formData.trangThai || "Còn hàng",
      soLuongVote: productToEdit?.soLuongVote || 0,
      danhGiaTrungBinh: productToEdit?.danhGiaTrungBinh || 0,
      ngayTao: productToEdit?.ngayTao || new Date().toISOString(), // Hoặc để backend xử lý
      ngaySua: new Date().toISOString(), // Hoặc để backend xử lý
      tenDanhMuc: danhMucList?.find(dm => dm.id === Number(formData.danhMucId))?.tenDanhMuc || "", // Chỉ để hiển thị, không gửi lên API
      tenBoSuuTap: boSuuTapList?.find(bst => bst.id === Number(formData.boSuuTapId))?.tenBoSuuTap || "", // Chỉ để hiển thị, không gửi lên API
    };

    onSubmit(processedData);

    if (!productToEdit) {
      setFormData(defaultFormData);
    } else {
      onClearEdit();
    }
  };

  const fields = [
    { id: "tenSanPham", label: "Tên sản phẩm*", icon: Package },
    {
      id: "danhMucId",
      label: "Danh mục*",
      type: "select",
      options:
        danhMucList?.map((d) => ({
          value: d.id.toString(),
          label: d.tenDanhMuc,
        })) || [],
      icon: Layers,
      disabled: isDanhMucLoading,
    },
    {
      id: "boSuuTapId",
      label: "Bộ sưu tập*",
      type: "select",
      options:
        boSuuTapList?.map((b) => ({
          value: b.id.toString(),
          label: b.tenBoSuuTap,
        })) || [],
      icon: Archive,
      disabled: isBoSuuTapLoading,
    },
    { id: "gia", label: "Giá (VND)*", type: "number", icon: DollarSign },
    { id: "soLuongTon", label: "Số lượng*", type: "number", icon: Package },
    { id: "soLuongManhGhep", label: "Số mảnh*", type: "number", icon: Brick },
    { id: "doTuoi", label: "Độ tuổi", type: "number", icon: AgeIcon },
    {
      id: "trangThai",
      label: "Trạng thái",
      type: "select",
      options: trangThaiOptions.map((o) => ({ value: o, label: o })),
      icon: ChevronsUpDown,
    },
    { id: "anhDaiDien", label: "Ảnh đại diện", icon: ImageOff },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-8 rounded-md border border-white/20 bg-[#10123c]"
    >
      <h2 className="text-2xl font-bold mb-6 text-white pos-gradient-text">
        {productToEdit ? "Chỉnh sửa sản phẩm LEGO" : "Thêm sản phẩm LEGO mới"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((field) => (
            <div key={field.id} className="space-y-1">
              <Label
                htmlFor={field.id}
                className="text-sm font-medium text-gray-300 flex items-center"
              >
                {field.icon && (
                  <field.icon className="w-4 h-4 mr-2 text-primary" />
                )}
                {field.label}
              </Label>

              {field.type === "select" ? (
                <Select
                value={String(formData[field.id as keyof ProductFormData] ?? "")}
                onValueChange={(value) => handleSelectChange(field.id as keyof ProductFormData, value)}
                >
                  <SelectTrigger className="w-full bg-background/70 border border-white/30 text-white rounded-md">
                    <SelectValue
                      placeholder={`Chọn ${field.label
                        .toLowerCase()
                        .replace("*", "")}`}
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20 text-white rounded-md">
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.id === "anhDaiDien" ? (
                <>
                  <Input
                    id="anhDaiDien"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setFormData((prev) => ({ ...prev, anhDaiDien: url }));
                      }
                    }}
                    className="bg-background/70 border border-white/30 text-white rounded-md"
                  />
                  {formData.anhDaiDien && (
                    <img
                      src={formData.anhDaiDien}
                      alt="Ảnh đại diện"
                      className="mt-2 h-32 w-auto rounded border border-white/20 object-contain"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                </>
              ) : (
                <Input
                  id={field.id}
                  value={String(formData[field.id as keyof ProductFormData] ?? "")}
                  onChange={handleChange}
                  type={field.type || "text"}
                  className="bg-background/70 border border-white/30 placeholder:text-gray-500 rounded-md"
                />
              )}
            </div>
          ))}

          <div className="space-y-1 md:col-span-2 lg:col-span-3">
            <Label
              htmlFor="moTa"
              className="text-sm font-medium text-gray-300 flex items-center"
            >
              <Palette className="w-4 h-4 mr-2 text-primary" /> Mô tả sản phẩm*
            </Label>
            <textarea
              id="moTa"
              value={formData.moTa}
              onChange={handleChange}
              placeholder="Mô tả chi tiết về bộ LEGO..."
              rows={3}
              className="w-full bg-background/70 border border-white/30 placeholder:text-gray-500 rounded-md p-2 text-sm text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {productToEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={onClearEdit}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Hủy sửa
            </Button>
          )}
          <Button type="submit" variant="default" className="shadow-lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            {productToEdit ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default LegoProductForm;
