"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusCircle, Palette, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { DanhMuc } from "@/components/types/product.type";
import { useToast } from "@/context/use-toast";

interface LegoCategoryFormProps {
  onSubmit: (data: DanhMuc) => void;
  categoryToEdit?: DanhMuc | null;
  onClearEdit: () => void;
}

export const LegoCategoryForm: React.FC<LegoCategoryFormProps> = ({
  onSubmit,
  categoryToEdit,
  onClearEdit,
}) => {
  const [formData, setFormData] = useState<DanhMuc>({
    id: 0,
    tenDanhMuc: "",
    moTa: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    if (categoryToEdit) {
      setFormData(categoryToEdit);
    } else {
      setFormData({ id: 0, tenDanhMuc: "", moTa: "" });
    }
  }, [categoryToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.id as keyof DanhMuc]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenDanhMuc) {
      toast({
        message: "Tên danh mục là bắt buộc.",
        type: "error",
      });
      return;
    }
    onSubmit({ ...formData });
    onClearEdit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-8 rounded-md border border-white/20 bg-[#10123c]"
    >
      <h2 className="text-xl font-bold text-white mb-4">
        {categoryToEdit ? "Chỉnh sửa danh mục LEGO" : "Thêm danh mục LEGO mới"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label
            htmlFor="tenDanhMuc"
            className="text-white text-sm flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-primary" /> Tên danh mục*
          </Label>
          <Input
            id="tenDanhMuc"
            value={formData.tenDanhMuc}
            onChange={handleChange}
            placeholder="Ví dụ: LEGO City"
            className="mt-1"
          />
        </div>
        <div>
          <Label
            htmlFor="moTa"
            className="text-sm font-medium text-gray-300 flex items-center"
          >
            <Palette className="w-4 h-4 mr-2 text-primary" /> Mô tả
          </Label>
          <textarea
            id="moTa"
            value={formData.moTa}
            onChange={handleChange}
            placeholder="Mô tả ngắn về danh mục..."
            rows={3}
            className="w-full bg-background/70 border border-white/30 placeholder:text-gray-500 rounded-md p-2 text-sm text-white"
          />
        </div>
        <div className="flex justify-end gap-3">
          {categoryToEdit && (
            <Button type="button" variant="outline" onClick={onClearEdit}>
              Hủy sửa
            </Button>
          )}
          <Button type="submit" variant="default">
            <PlusCircle className="mr-2 h-5 w-5" />{" "}
            {categoryToEdit ? "Lưu thay đổi" : "Thêm danh mục"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
