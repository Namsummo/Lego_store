"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BoSuuTap } from "@/components/types/product.type";
import {
  CalendarDays,
  CalendarCheck2,
  Palette,
  PlusCircle,
} from "lucide-react";

interface Props {
  collectionToEdit: BoSuuTap | null;
  onSubmit: (data: BoSuuTap) => void;
  onClearEdit: () => void;
}

const LegoCollectionForm: React.FC<Props> = ({
  collectionToEdit,
  onSubmit,
  onClearEdit,
}) => {
  const [tenBoSuuTap, setTenBoSuuTap] = useState("");
  const [moTa, setMoTa] = useState("");
  const [namPhatHanh, setNamPhatHanh] = useState<number>(
    new Date().getFullYear()
  );

  useEffect(() => {
    if (collectionToEdit) {
      setTenBoSuuTap(collectionToEdit.tenBoSuuTap);
      setMoTa(collectionToEdit.moTa);
      setNamPhatHanh(collectionToEdit.namPhatHanh);
    } else {
      setTenBoSuuTap("");
      setMoTa("");
      setNamPhatHanh(new Date().getFullYear());
    }
  }, [collectionToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenBoSuuTap.trim()) {
      alert("Tên bộ sưu tập không được để trống");
      return;
    }

    const data: BoSuuTap = {
      id: collectionToEdit ? collectionToEdit.id : 0,
      tenBoSuuTap: tenBoSuuTap.trim(),
      moTa: moTa.trim(),
      namPhatHanh,
      ngayTao: collectionToEdit
        ? collectionToEdit.ngayTao
        : new Date().toISOString(),
    };

    onSubmit(data);
    setTenBoSuuTap("");
    setMoTa("");
    setNamPhatHanh(new Date().getFullYear());
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="glass-card p-6 mb-8 rounded-md border border-white/20 bg-[#10123c]"
    >
      <h2 className="text-2xl font-bold mb-6 text-white pos-gradient-text">
        {collectionToEdit
          ? "Chỉnh sửa bộ sưu tập LEGO"
          : "Thêm bộ sưu tập LEGO mới"}
      </h2>

      <div className="space-y-4">
        <div>
          <Label
            htmlFor="tenBoSuuTap"
            className="text-sm text-gray-300 flex items-center mb-1"
          >
            <CalendarDays className="w-4 h-4 mr-2 text-primary" />
            Tên bộ sưu tập*
          </Label>
          <Input
            id="tenBoSuuTap"
            value={tenBoSuuTap}
            onChange={(e) => setTenBoSuuTap(e.target.value)}
            placeholder="Tên bộ sưu tập LEGO"
            className="bg-background/70 border border-white/30 text-white"
          />
        </div>

        <div>
          <Label
            htmlFor="moTa"
            className="text-sm text-gray-300 flex items-center mb-1"
          >
            <Palette className="w-4 h-4 mr-2 text-primary" />
            Mô tả
          </Label>
          <textarea
            id="moTa"
            rows={3}
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
            placeholder="Mô tả chi tiết về bộ sưu tập..."
            className="w-full bg-background/70 border border-white/30 placeholder:text-gray-500 rounded-md p-2 text-sm text-white"
          />
        </div>

        <div>
          <Label
            htmlFor="namPhatHanh"
            className="text-sm text-gray-300 flex items-center mb-1"
          >
            <CalendarCheck2 className="w-4 h-4 mr-2 text-primary" />
            Năm phát hành
          </Label>
          <Input
            id="namPhatHanh"
            type="number"
            value={namPhatHanh}
            onChange={(e) => setNamPhatHanh(Number(e.target.value))}
            className="bg-background/70 border border-white/30 text-white"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        {collectionToEdit && (
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
          {collectionToEdit ? "Lưu thay đổi" : "Thêm bộ sưu tập"}
        </Button>
      </div>
    </motion.form>
  );
};

export default LegoCollectionForm;
