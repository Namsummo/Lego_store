"use client";

import React, { useState } from "react";
import { KhuyenMai } from "@/components/types/khuyenmai-type";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, InfoIcon, X } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSanPham } from "@/hooks/useSanPham";

interface PromotionFormProps {
  newPromotion: KhuyenMai;
  editingPromotion: KhuyenMai | null;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  getStatus: () => string;
}

const PromotionForm: React.FC<PromotionFormProps> = ({
  newPromotion,
  editingPromotion,
  onInputChange,
  onSubmit,
  onCancel,
  getStatus,
}) => {
  const { data: products, isLoading: isLoadingProducts } = useSanPham();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Đang hoạt động":
        return "success";
      case "Sắp diễn ra":
        return "secondary";
      case "Đã kết thúc":
        return "destructive";
      default:
        return "default";
    }
  };

  // Chuyển đổi chuỗi ngày thành đối tượng Date
  const [startDate, setStartDate] = useState<Date | undefined>(
    newPromotion.ngayBatDau ? new Date(newPromotion.ngayBatDau) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    newPromotion.ngayKetThuc ? new Date(newPromotion.ngayKetThuc) : undefined
  );

  // State cho sản phẩm áp dụng
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    newPromotion.sanPhamApDung
      ? newPromotion.sanPhamApDung.split(",").map((p) => p.trim())
      : []
  );

  // Xử lý khi thay đổi ngày bắt đầu
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      const event = {
        target: {
          name: "ngayBatDau",
          value: formattedDate,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onInputChange(event);
    }
  };

  // Xử lý khi thay đổi ngày kết thúc
  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      const event = {
        target: {
          name: "ngayKetThuc",
          value: formattedDate,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onInputChange(event);
    }
  };

  // Xử lý khi thêm sản phẩm
  const handleAddProduct = (productId: string) => {
    if (!selectedProducts.includes(productId)) {
      const newSelectedProducts = [...selectedProducts, productId];
      setSelectedProducts(newSelectedProducts);

      // Cập nhật giá trị cho form
      const event = {
        target: {
          name: "sanPhamApDung",
          value: newSelectedProducts.join(","),
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onInputChange(event);
    }
  };

  // Xử lý khi xóa sản phẩm
  const handleRemoveProduct = (productId: string) => {
    const newSelectedProducts = selectedProducts.filter(
      (id) => id !== productId
    );
    setSelectedProducts(newSelectedProducts);

    // Cập nhật giá trị cho form
    const event = {
      target: {
        name: "sanPhamApDung",
        value: newSelectedProducts.join(","),
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(event);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 promotion-form border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {editingPromotion ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}
        </h2>
        {editingPromotion && (
          <Badge
            variant={getStatusVariant(newPromotion.trangThai || getStatus())}
            className="text-sm px-3 py-1"
          >
            {newPromotion.trangThai || getStatus()}
          </Badge>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {/* Mã khuyến mãi */}
        <div className="space-y-2">
          <Label
            htmlFor="maKhuyenMai"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
          >
            Mã khuyến mãi <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="maKhuyenMai"
            name="maKhuyenMai"
            value={newPromotion.maKhuyenMai}
            onChange={onInputChange}
            readOnly={!!editingPromotion}
            disabled={!!editingPromotion}
            required
            className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-black dark:text-white bg-white dark:bg-gray-700 rounded-md h-10"
            style={{ color: "#000000 !important" }}
            placeholder="Nhập mã khuyến mãi"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Số lượng */}
          <div className="space-y-2">
            <Label
              htmlFor="soLuong"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
            >
              Số lượng <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="soLuong"
              name="soLuong"
              type="number"
              min="0"
              value={newPromotion.soLuong}
              onChange={onInputChange}
              required
              className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-black dark:text-white bg-white dark:bg-gray-700 rounded-md h-10"
              style={{ color: "#000000 !important" }}
              placeholder="Nhập số lượng"
            />
          </div>

          {/* Giá trị giảm */}
          <div className="space-y-2">
            <Label
              htmlFor="giaTriGiam"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
            >
              Giá trị giảm (VND) <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="giaTriGiam"
              name="giaTriGiam"
              type="number"
              min="0"
              value={newPromotion.giaTriGiam}
              onChange={onInputChange}
              required
              className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-black dark:text-white bg-white dark:bg-gray-700 rounded-md h-10"
              style={{ color: "#000000 !important" }}
              placeholder="Nhập giá trị giảm"
            />
          </div>

          {/* Giá trị tối đa */}
          <div className="space-y-2">
            <Label
              htmlFor="giaTriToiDa"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
            >
              Giá trị tối đa (VND)
            </Label>
            <Input
              id="giaTriToiDa"
              name="giaTriToiDa"
              type="number"
              min="0"
              value={newPromotion.giaTriToiDa || ""}
              onChange={onInputChange}
              className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-black dark:text-white bg-white dark:bg-gray-700 rounded-md h-10"
              style={{ color: "#000000 !important" }}
              placeholder="Nhập giá trị tối đa"
            />
          </div>

          {/* Phần trăm giảm */}
          <div className="space-y-2">
            <Label
              htmlFor="phanTramGiam"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
            >
              Phần trăm giảm (%) <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="phanTramGiam"
              name="phanTramGiam"
              type="number"
              min="0"
              max="100"
              value={newPromotion.phanTramGiam}
              onChange={onInputChange}
              required
              className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-black dark:text-white bg-white dark:bg-gray-700 rounded-md h-10"
              style={{ color: "#000000 !important" }}
              placeholder="Nhập phần trăm giảm"
            />
          </div>

          {/* Ngày bắt đầu với date picker */}
          <div className="space-y-2">
            <Label
              htmlFor="ngayBatDau"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
            >
              Ngày bắt đầu <span className="text-red-500 ml-1">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal border-gray-300 hover:bg-gray-50 bg-white dark:bg-gray-700 rounded-md h-10",
                    !startDate && "text-gray-500",
                    startDate && "text-black dark:text-white"
                  )}
                  style={{
                    color: startDate
                      ? "#000000 !important"
                      : "#6b7280 !important",
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                  {startDate ? (
                    format(startDate, "dd/MM/yyyy")
                  ) : (
                    <span>Chọn ngày bắt đầu</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white shadow-lg rounded-md border border-gray-200">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                  locale={vi}
                  className="rounded-md border-0"
                />
              </PopoverContent>
            </Popover>
            <Input
              id="ngayBatDau"
              name="ngayBatDau"
              type="hidden"
              value={newPromotion.ngayBatDau}
              required
            />
          </div>

          {/* Ngày kết thúc với date picker */}
          <div className="space-y-2">
            <Label
              htmlFor="ngayKetThuc"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
            >
              Ngày kết thúc <span className="text-red-500 ml-1">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal border-gray-300 hover:bg-gray-50 bg-white dark:bg-gray-700 rounded-md h-10",
                    !endDate && "text-gray-500",
                    endDate && "text-black dark:text-white"
                  )}
                  style={{
                    color: endDate
                      ? "#000000 !important"
                      : "#6b7280 !important",
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                  {endDate ? (
                    format(endDate, "dd/MM/yyyy")
                  ) : (
                    <span>Chọn ngày kết thúc</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white shadow-lg rounded-md border border-gray-200">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  initialFocus
                  locale={vi}
                  disabled={(date) => (startDate ? date < startDate : false)}
                  className="rounded-md border-0"
                />
              </PopoverContent>
            </Popover>
            <Input
              id="ngayKetThuc"
              name="ngayKetThuc"
              type="hidden"
              value={newPromotion.ngayKetThuc}
              required
            />
          </div>
        </div>

        {/* Trạng thái */}
        <div className="space-y-2">
          <Label
            htmlFor="trangThai"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
          >
            Trạng thái
            <div className="ml-2 text-gray-500 cursor-help">
              <InfoIcon size={14} />
            </div>
          </Label>
          <div className="relative">
            <Input
              id="trangThai"
              name="trangThai"
              value={newPromotion.trangThai || getStatus()}
              disabled
              className="pr-24 bg-gray-50 border-gray-300 text-black dark:bg-gray-700 dark:text-white rounded-md h-10"
              style={{ color: "#000000 !important" }}
            />
            <div className="absolute right-3 top-2">
              <Badge
                variant={getStatusVariant(
                  newPromotion.trangThai || getStatus()
                )}
              >
                {newPromotion.trangThai || getStatus()}
              </Badge>
            </div>
          </div>
          <p className="text-xs text-gray-500 italic mt-1">
            Tự động cập nhật từ hệ thống
          </p>
        </div>
        {/* Sản phẩm áp dụng */}
        <div className="space-y-2">
          <Label
            htmlFor="sanPhamApDung"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
          >
            Sản phẩm áp dụng
          </Label>
          <div className="flex flex-col space-y-2">
            <Select onValueChange={handleAddProduct}>
              <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-black dark:text-white bg-white dark:bg-gray-700 rounded-md h-10">
                <SelectValue placeholder="Chọn sản phẩm áp dụng" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {isLoadingProducts ? (
                  <div className="p-2 text-center">Đang tải...</div>
                ) : products && products.length > 0 ? (
                  products.map((product) => (
                    <SelectItem
                      key={product.maSanPham.toString()}
                      value={product.maSanPham.toString()}
                      disabled={selectedProducts.includes(
                        product.maSanPham.toString()
                      )}
                    >
                      {product.tenSanPham} (SP{product.maSanPham})
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center">Không có sản phẩm</div>
                )}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2 mt-2">
              {selectedProducts.map((productId) => {
                const product = products?.find(
                  (p) => p.maSanPham.toString() === productId
                );
                return (
                  <Badge
                    key={productId}
                    variant="secondary"
                    className="px-3 py-1 flex items-center gap-1"
                  >
                    {product ? product.tenSanPham : `SP${productId}`}
                    <Button
                      type="button"
                      onClick={() => handleRemoveProduct(productId)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X size={14} />
                    </Button>
                  </Badge>
                );
              })}
            </div>

            <Input
              id="sanPhamApDung"
              name="sanPhamApDung"
              type="hidden"
              value={selectedProducts.join(",")}
            />

            <p className="text-xs text-gray-500 italic">
              Giữ phím Ctrl để chọn nhiều sản phẩm
            </p>
          </div>
        </div>

        {/* Mô tả */}
        <div className="space-y-2">
          <Label
            htmlFor="moTa"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Mô tả
          </Label>
          <Textarea
            id="moTa"
            name="moTa"
            value={newPromotion.moTa || ""}
            onChange={onInputChange}
            rows={3}
            className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-black dark:text-white bg-white dark:bg-gray-700 rounded-md"
            style={{ color: "#000000 !important" }}
            placeholder="Nhập mô tả chi tiết về khuyến mãi"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-gray-300 hover:bg-gray-50 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 px-5 py-2 rounded-md"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md"
          >
            {editingPromotion ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PromotionForm;
