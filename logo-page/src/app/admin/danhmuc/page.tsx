"use client";

import { ToastProvider } from "@/components/ui/toast-provider";
import LegoCategorySearch from "./LegoCategorySearch";
import LegoCategoryTable from "./LegoCategoryTable";
import { useState } from "react";
import { DanhMuc } from "@/components/types/product.type";
import {
  useDanhMuc,
  useAddSDanhMuc,
  useEditDanhMuc,
  useXoaDanhMuc,
} from "@/hooks/useDanhMuc";
import { LegoCategoryForm } from "./LegoCategoryForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { Modal } from "@/components/layout/(components)/(pages)/Modal";
import LichSuLogTimeline from "@/shared/LichSuLogTimeline";

export default function LegoCategoryPage() {
  const { data: categories = [], isLoading } = useDanhMuc();
  const [categoryToEdit, setCategoryToEdit] = useState<DanhMuc | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpenLog, setIsOpenLog] = useState(false);

  const addMutation = useAddSDanhMuc();
  const editMutation = useEditDanhMuc();
  const deleteMutation = useXoaDanhMuc();
  const handleSubmit = (data: DanhMuc) => {
    if (categoryToEdit) {
      editMutation.mutate(
        { id: categoryToEdit.id, data },
        {
          onSuccess: () => {
            toast.success("Cập nhật thành công!");
            setCategoryToEdit(null);
            setShowForm(false);
          },
          onError: () => toast.error("Cập nhật thất bại!"),
        }
      );
    } else {
      addMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Thêm thành công!");
          setShowForm(false);
        },
        onError: () => toast.error("Thêm thất bại!"),
      });
    }
  };

  const handleEdit = (category: DanhMuc) => {
    setCategoryToEdit(category);
    setShowForm(true);
  };

  const handleDelete = (id: number, tenDanhMuc: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa "${tenDanhMuc}"?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Xóa thành công!"),
        onError: () => toast.error("Xóa thất bại!"),
      });
    }
  };

  const handleClearEdit = () => {
    setCategoryToEdit(null);
    setShowForm(false);
  };

  const handleOpenForm = () => {
    setCategoryToEdit(null);
    setShowForm(true);
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.tenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.moTa?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );
  // Phân trang
  const itemPerPage = 10;
  const totalPages = Math.ceil(filteredCategories.length / itemPerPage);
  const paginatedData = filteredCategories.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );

  return (
    <ToastProvider>
      <Card className="p-4 bg-gray-800 shadow-md  w-full h-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r  bg-clip-text text-white ">
            Quản Lý Danh Mục
          </h1>
        </motion.div>
        {/* Nút thêm danh mục */}
        <div className="items-center flex gap-4 ">
          <LegoCategorySearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <Button className=" shadow-lg" onClick={handleOpenForm}>
            <PlusIcon />
            Thêm danh mục
          </Button>
          <Button
            className=" shadow-lg"
            onClick={() => setIsOpenLog(true)}
            variant="destructive"
          >
            <PlusIcon />
            Xem lịch sử
          </Button>
        </div>

        {isLoading ? (
          <p className="text-white">Đang tải danh mục...</p>
        ) : (
          <>
            <h2 className="text-lg font-bold">Danh sách danh mục</h2>
            <LegoCategoryTable
              categories={paginatedData}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            {/* Modal xem lịch sử log */}
            <Modal
              open={isOpenLog}
              onOpenChange={() => setIsOpenLog(false)}
              title="Lịch sử  thay đổi"
              className="max-w-6xl"
              scrollContentOnly
            >
              <LichSuLogTimeline bang="danhMuc" title="Lịch sử user log" />
            </Modal>
          </>
        )}

        {/* Form popup */}
        {showForm && (
          <div
            className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50"
            onClick={handleClearEdit}
          >
            <div
              className="bg-[#191a32] rounded-lg p-8 w-full max-w-3xl relative shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClearEdit}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl font-bold"
                title="Đóng"
              >
                &times;
              </button>
              <LegoCategoryForm
                onSubmit={handleSubmit}
                categoryToEdit={categoryToEdit}
                onClearEdit={handleClearEdit}
              />
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2 justify-center items-center">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Trang trước
          </Button>
          <span className="text-sm font-medium">
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Trang sau
          </Button>
        </div>
      </Card>
    </ToastProvider>
  );
}
