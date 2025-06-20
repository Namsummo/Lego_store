'use client'

import React, { useState } from 'react';
import { useKhuyenmai as usePromotions, useAddKhuyenMai as useAddPromotion, useEditKhuyenMai as useUpdatePromotion, useDeleteKhuyenMai as useDeletePromotion } from '@/hooks/useKhuyenmai';
import { KhuyenMai, TrangThaiKhuyenMai } from '@/components/types/khuyenmai-type';
import { toast } from 'sonner';
import { PlusCircle, RefreshCw, Search } from "lucide-react";
import PromotionForm from './PromotionForm';
import PromotionList from './PromotionList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Utility function to check promotion status
const getPromotionStatus = (startDate: string, endDate: string): string => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'Sắp diễn ra';
    if (now > end) return 'Đã kết thúc';
    return 'Đang hoạt động';
};

const PromotionManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('list');
    const [editingPromotion, setEditingPromotion] = useState<KhuyenMai | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Sử dụng các hook từ useKhuyenmai.ts
    const { data: promotions, isLoading, error, refetch } = usePromotions();
    const addPromotion = useAddPromotion();
    const updatePromotion = useUpdatePromotion();
    const deletePromotion = useDeletePromotion();

    // State cho form
    const [newPromotion, setNewPromotion] = useState<KhuyenMai>({
        id: 0,
        maKhuyenMai: '',
        soLuong: 0,
        giaTriGiam: 0,
        giaTriToiDa: 0,
        moTa: '',
        phanTramGiam: 0,
        ngayBatDau: new Date().toISOString().split('T')[0],
        ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sanPhamApDung: '',
        trangThai: TrangThaiKhuyenMai.DangHoatDong,
    });

    // Hàm xử lý thay đổi input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewPromotion(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Hàm lấy trạng thái dựa trên ngày
    const getStatus = () => {
        return getPromotionStatus(newPromotion.ngayBatDau, newPromotion.ngayKetThuc);
    };

    // Hàm xử lý submit form
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            if (editingPromotion) {
                // Cập nhật khuyến mãi
                await updatePromotion.mutateAsync({
                    id: Number(editingPromotion.id),
                    data: newPromotion
                });
                toast.success('Cập nhật khuyến mãi thành công!');
            } else {
                // Thêm khuyến mãi mới
                await addPromotion.mutateAsync(newPromotion);
                toast.success('Thêm khuyến mãi thành công!');
            }

            // Reset form và quay lại danh sách
            resetForm();
            setActiveTab('list');
        } catch (error) {
            toast.error(`Lỗi: ${error instanceof Error ? error.message : 'Đã xảy ra lỗi'}`);
        }
    };

    // Hàm xử lý xóa khuyến mãi
    const handleDelete = async (id: string | number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
            try {
                await deletePromotion.mutateAsync(Number(id));
                toast.success('Xóa khuyến mãi thành công!');
            } catch (error) {
                toast.error(`Lỗi: ${error instanceof Error ? error.message : 'Đã xảy ra lỗi'}`);
            }
        }
    };

    // Hàm xử lý chỉnh sửa khuyến mãi
    const handleEdit = (id: string | number) => {
        const promotion = promotions?.find(p => p.id.toString() === id.toString());
        if (!promotion) return;

        setEditingPromotion(promotion);
        setNewPromotion({
            ...promotion,
            moTa: promotion.moTa || '',
        });
        setActiveTab('form');
    };

    // Hàm reset form
    const resetForm = () => {
        setEditingPromotion(null);
        setNewPromotion({
            id: 0,
            maKhuyenMai: '',
            soLuong: 0,
            giaTriGiam: 0,
            giaTriToiDa: 0,
            moTa: '',
            phanTramGiam: 0,
            ngayBatDau: new Date().toISOString().split('T')[0],
            ngayKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            sanPhamApDung: '',
            trangThai: TrangThaiKhuyenMai.DangHoatDong,
        });
    };

    // Hàm xử lý hủy form
    const handleCancel = () => {
        resetForm();
        setActiveTab('list');
    };

    // Hàm lọc khuyến mãi theo từ khóa tìm kiếm
    const filteredPromotions = promotions?.filter(promo =>
        promo.maKhuyenMai.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (promo.moTa && promo.moTa.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

    // Xử lý khi có lỗi
    if (error) {
        toast.error(`Lỗi: ${error instanceof Error ? error.message : 'Đã xảy ra lỗi'}`);
    }

    return (
        <div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                    <div>
                        <CardTitle className="text-2xl font-bold">Quản lý khuyến mãi</CardTitle>
                        <CardDescription className="mt-1">
                            Thêm, sửa, xóa và quản lý các chương trình khuyến mãi
                        </CardDescription>
                    </div>
                    {activeTab === 'list' && (
                        <Button
                            onClick={() => setActiveTab('form')}
                            className="flex items-center"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Thêm khuyến mãi
                        </Button>
                    )}
                </CardHeader>

                <CardContent>
                    {activeTab === 'list' ? (
                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Tìm kiếm khuyến mãi..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => refetch()}
                                    className="flex items-center"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Làm mới
                                </Button>
                            </div>

                            {isLoading ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            ) : (
                                <PromotionList
                                    promotions={filteredPromotions}
                                    loading={isLoading}
                                    searchTerm={searchTerm}
                                    onSearchChange={(e) => setSearchTerm(e.target.value)}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onRefresh={() => refetch()}
                                />
                            )}
                        </div>
                    ) : (
                        <PromotionForm
                            newPromotion={newPromotion}
                            editingPromotion={editingPromotion}
                            onInputChange={handleInputChange}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            getStatus={getStatus}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PromotionManagement;