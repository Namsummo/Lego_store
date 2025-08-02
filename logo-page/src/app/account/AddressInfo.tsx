"use client";
import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useThongTinNguoiNhan, useCreateThongTin, useUpdateThongTin, useDeleteThongTin } from "@/hooks/useThongTinTaiKhoan";
import { DTOThongTinNguoiNhan, ThongTinNguoiNhan } from "@/components/types/thongTinTaiKhoan-types";
import { useUserStore } from "@/context/authStore.store";
import { toast } from "sonner";
import { MapPin, Plus, Edit, Trash2, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox"; // Thêm Checkbox từ thư viện UI
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AddressInfo() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const { user } = useUserStore();
  const currentUserId = user?.id;

  const { data: thongTinList = [], isLoading, refetch } = useThongTinNguoiNhan(currentUserId || 0);
  const createMutation = useCreateThongTin();
  const updateMutation = useUpdateThongTin();
  const deleteMutation = useDeleteThongTin();

  // State cho địa chỉ
  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [formData, setFormData] = useState<DTOThongTinNguoiNhan>({
    hoTen: "",
    sdt: "",
    duong: "",
    xa: "",
    thanhPho: "",
    isMacDinh: 0,
    idUser: currentUserId || 0,
  });

  // Load địa chỉ data
  useEffect(() => {
    const loadAddressData = async () => {
      try {
        const provinceRes = await fetch("/data/province.json");
        const provinceData = await provinceRes.json();

        const wardRes = await fetch("/data/ward.json");
        const wardData = await wardRes.json();

        const wardsByProvince: Record<string, any[]> = {};
        Object.entries(wardData).forEach(([code, ward]: [string, any]) => {
          const provinceCode = ward.parent_code;
          if (!wardsByProvince[provinceCode]) {
            wardsByProvince[provinceCode] = [];
          }
          wardsByProvince[provinceCode].push({ code, ...ward });
        });

        const filteredProvinces = Object.entries(provinceData)
          .filter(([code]) => wardsByProvince[code] && wardsByProvince[code].length > 0)
          .map(([code, info]) => ({
            code,
            ...info as any,
            wards: wardsByProvince[code] || [],
          }));

        setProvinces(filteredProvinces);
      } catch (error) {
        console.error("Error loading address data:", error);
        toast.error("Không thể tải dữ liệu địa chỉ");
      }
    };

    loadAddressData();
  }, []);

  // Update wards khi chọn tỉnh
  useEffect(() => {
    if (selectedProvince) {
      const selectedProvinceData = provinces.find((p) => p.code === selectedProvince);
      setWards(selectedProvinceData?.wards || []);
    } else {
      setWards([]);
    }
    setSelectedWard("");
  }, [selectedProvince, provinces]);

  // Update formData khi chọn tỉnh/xã
  useEffect(() => {
    const selectedProvinceData = provinces.find((p) => p.code === selectedProvince);
    const selectedWardData = wards.find((w) => w.code === selectedWard);

    setFormData((prev) => ({
      ...prev,
      thanhPho: selectedProvinceData?.name || "",
      xa: selectedWardData?.name || "",
    }));
  }, [selectedProvince, selectedWard, provinces, wards]);

  // Update idUser
  useEffect(() => {
    if (currentUserId) {
      setFormData((prev) => ({ ...prev, idUser: currentUserId }));
    }
  }, [currentUserId]);

  // Reset form
  const resetForm = () => {
    setFormData({
      hoTen: "",
      sdt: "",
      duong: "",
      xa: "",
      thanhPho: "",
      isMacDinh: thongTinList.length === 0 ? 1 : 0, // Đặt mặc định nếu danh sách rỗng
      idUser: currentUserId || 0,
    });
    setSelectedProvince("");
    setSelectedWard("");
    setShowDialog(false);
    setEditingId(null);
  };

  // Validate form
  const validateForm = () => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập để thực hiện chức năng này");
      return false;
    }

    if (!formData.hoTen.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return false;
    }

    if (!formData.sdt.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return false;
    }

    if (!formData.duong.trim()) {
      toast.error("Vui lòng nhập địa chỉ đường");
      return false;
    }

    if (!formData.xa.trim() || !formData.thanhPho.trim()) {
      toast.error("Vui lòng chọn tỉnh/thành phố và xã/phường");
      return false;
    }

    return true;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (editingId) {
        // EDIT MODE
        await updateMutation.mutateAsync({
          id: editingId,
          data: formData,
        });
        toast.success("✅ Cập nhật địa chỉ thành công!");
      } else {
        // CREATE MODE
        // Nếu danh sách rỗng, tự động đặt isMacDinh = 1
        const isFirstAddress = thongTinList.length === 0;
        const newFormData = {
          ...formData,
          isMacDinh: isFirstAddress ? 1 : formData.isMacDinh,
        };

        await createMutation.mutateAsync(newFormData);
        toast.success("✅ Thêm địa chỉ thành công!");
      }

      resetForm();
      await refetch();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi lưu địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (item: ThongTinNguoiNhan) => {
    setFormData({
      hoTen: item.hoTen,
      sdt: item.sdt,
      duong: item.duong,
      xa: item.xa,
      thanhPho: item.thanhPho,
      isMacDinh: item.isMacDinh ? 1 : 0,
      idUser: currentUserId || 0,
    });

    // Set province và ward
    const province = provinces.find((p) => p.name === item.thanhPho);
    if (province) {
      setSelectedProvince(province.code);
      setTimeout(() => {
        const ward = province.wards?.find((w: any) => w.name === item.xa);
        if (ward) {
          setSelectedWard(ward.code);
        }
      }, 100);
    }

    setEditingId(item.id as number);
    setShowDialog(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("✅ Xóa địa chỉ thành công!");
      await refetch();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Không thể xóa địa chỉ");
    } finally {
      setDeleteId(null);
    }
  };

  // Handle set default
  const handleSetDefault = async (id: number) => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    try {
      const targetAddress = thongTinList.find((item) => item.id === id);
      if (!targetAddress) {
        toast.error("Địa chỉ không tồn tại");
        await refetch();
        return;
      }

      if (targetAddress.isMacDinh === 1) {
        toast.info("Địa chỉ này đã là mặc định rồi!");
        return;
      }

      // Đặt tất cả địa chỉ khác thành không mặc định
      const updatePromises = thongTinList
        .filter((item) => item.isMacDinh === 1 && item.id !== id)
        .map((item) =>
          updateMutation.mutateAsync({
            id: item.id,
            data: {
              ...item,
              isMacDinh: 0,
              idUser: currentUserId,
            },
          })
        );

      // Chờ tất cả các cập nhật hoàn tất
      await Promise.all(updatePromises);

      // Đặt địa chỉ hiện tại làm mặc định
      await updateMutation.mutateAsync({
        id: id,
        data: {
          ...targetAddress,
          isMacDinh: 1,
          idUser: currentUserId,
        },
      });

      toast.success("⭐ Đã đặt làm địa chỉ mặc định!");
      await refetch();
    } catch (error: any) {
      console.error("Set default failed:", error);
      toast.error(error.message || "Không thể đặt làm mặc định");
    }
  };

  // Handle unset default
  const handleUnsetDefault = async (id: number) => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    try {
      const targetAddress = thongTinList.find((item) => item.id === id);
      if (!targetAddress) {
        toast.error("Địa chỉ không tồn tại");
        await refetch();
        return;
      }

      await updateMutation.mutateAsync({
        id: id,
        data: {
          ...targetAddress,
          isMacDinh: 0,
          idUser: currentUserId,
        },
      });

      toast.success("🔄 Đã bỏ địa chỉ mặc định!");
      await refetch();
    } catch (error: any) {
      console.error("Unset default failed:", error);
      toast.error(error.message || "Không thể bỏ mặc định");
    }
  };

  // Handle province change
  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
  };

  // Handle ward change
  const handleWardChange = (value: string) => {
    setSelectedWard(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Đang tải...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-orange-600" />
          </div>
          <h1 className="text-xl font-semibold text-black">Địa chỉ nhận hàng</h1>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm địa chỉ
        </Button>
      </div>

      {/* Address List */}
      <div className="space-y-4">
        {Array.from({ length: Math.ceil(thongTinList.length / 2) }, (_, rowIndex) => {
          const startIndex = rowIndex * 2;
          const rowItems = thongTinList.slice(startIndex, startIndex + 2);

          return (
            <div
              key={rowIndex}
              className={`flex gap-4 ${rowItems.length === 1 ? "justify-center" : "justify-between"}`}
            >
              {rowItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${rowItems.length === 1 ? "w-1/2" : "flex-1"
                    }`}
                >
                  {/* Name and Default Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-black text-lg">{item.hoTen}</h3>
                    {item.isMacDinh === 1 && (
                      <Badge className="bg-orange-500 text-white px-2 py-1 text-xs rounded">
                        Mặc định
                      </Badge>
                    )}
                  </div>

                  {/* Phone */}
                  <p className="text-gray-700 mb-2">{item.sdt}</p>

                  {/* Address */}
                  <p className="text-gray-600 mb-4">
                    {item.duong}, {item.xa}, {item.thanhPho}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm rounded flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Sửa
                    </Button>

                    {item.isMacDinh === 0 && (
                      <Button
                        size="sm"
                        onClick={() => handleSetDefault(item.id)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-sm rounded flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        Đặt mặc định
                      </Button>
                    )}

                    {item.isMacDinh === 1 && (
                      <Button
                        size="sm"
                        onClick={() => handleUnsetDefault(item.id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 text-sm rounded flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        Bỏ mặc định
                      </Button>
                    )}

                    <Button
                      size="sm"
                      onClick={() => setDeleteId(item.id as number)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {thongTinList.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có địa chỉ nào</h3>
          <p className="text-gray-500 mb-4">Thêm địa chỉ đầu tiên để bắt đầu mua sắm</p>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm địa chỉ mới
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">
              {editingId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingId
                ? "Cập nhật thông tin địa chỉ"
                : "Điền thông tin địa chỉ mới (địa chỉ đầu tiên sẽ tự động được đặt làm mặc định)"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hoTen" className="text-black">
                  Họ tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="hoTen"
                  value={formData.hoTen}
                  onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                  className="bg-white border-gray-300 text-black"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sdt" className="text-black">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sdt"
                  value={formData.sdt}
                  onChange={(e) => setFormData({ ...formData, sdt: e.target.value })}
                  className="bg-white border-gray-300 text-black"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-black">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                  <SelectTrigger className="bg-white border-gray-300 text-black">
                    <SelectValue placeholder="Chọn tỉnh/thành phố" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {provinces.map((province) => (
                      <SelectItem key={province.code} value={province.code} className="text-black">
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-black">
                  Xã/Phường <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedWard}
                  onValueChange={handleWardChange}
                  disabled={!selectedProvince}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-black">
                    <SelectValue placeholder="Chọn xã/phường" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {wards.map((ward) => (
                      <SelectItem key={ward.code} value={ward.code} className="text-black">
                        {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="duong" className="text-black">
                Địa chỉ cụ thể <span className="text-red-500">*</span>
              </Label>
              <Input
                id="duong"
                value={formData.duong}
                onChange={(e) => setFormData({ ...formData, duong: e.target.value })}
                placeholder="Số nhà, tên đường..."
                className="bg-white border-gray-300 text-black"
                required
              />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isMacDinh"
                  checked={formData.isMacDinh === 1 || thongTinList.length === 0}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isMacDinh: checked ? 1 : 0 })
                  }
                  disabled={thongTinList.length === 0}
                />
                <Label htmlFor="isMacDinh" className="text-black">
                  Đặt làm địa chỉ mặc định
                  {thongTinList.length === 0 && (
                    <span className="text-gray-500 text-sm ml-2">
                      (Tự động chọn cho địa chỉ đầu tiên)
                    </span>
                  )}
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="text-black border-gray-300"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {loading ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-black border-gray-300">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}