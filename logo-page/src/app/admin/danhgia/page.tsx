"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReviewStats from "./components/ReviewStats";
import ReviewList from "./components/ReviewList";
import ReviewFilter from "./components/ReviewFilter";
import { useReviews, useUpdateDanhGia, useDeleteDanhGia } from "@/hooks/useDanhGia";
import { DanhGiaResponse } from "@/components/types/danhGia-type";
import { toast } from "sonner";
import { useUserStore } from "@/context/authStore.store";

export default function DanhGiaPage() {
    const [filterRating, setFilterRating] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterDate, setFilterDate] = useState('');
    const { data: reviews = [], isLoading, error } = useReviews();

    // Debug: Log reviews để kiểm tra
    console.log('Reviews from API:', reviews);
    console.log('Filter Date:', filterDate);
    const updateDanhGiaMutation = useUpdateDanhGia();
    const deleteDanhGiaMutation = useDeleteDanhGia();
    const { user } = useUserStore();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500">Có lỗi xảy ra khi tải dữ liệu đánh giá</p>
                </div>
            </div>
        );
    }

    const handleUpdateReview = async (reviewId: number, updatedReview: DanhGiaResponse): Promise<void> => {
        // Kiểm tra user đã đăng nhập chưa
        if (!user?.id) {
            toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
            return;
        }

        // Lấy phản hồi từ updatedReview
        const phanHoi = updatedReview.textPhanHoi || '';

        // Cập nhật qua API với ID của user đang đăng nhập
        return new Promise<void>((resolve, reject) => {
            updateDanhGiaMutation.mutate({
                idDanhGia: reviewId,
                idNv: user.id, // ID của tài khoản đang đăng nhập (admin hoặc nhân viên)
                phanHoi: phanHoi
            }, {
                onSuccess: () => {
                    resolve();
                },
                onError: (error) => {
                    toast.error(error.message || "Có lỗi xảy ra khi cập nhật phản hồi");
                    reject(error);
                }
            });
        });
    };

    const handleDeleteReview = async (reviewId: number): Promise<void> => {
        // Kiểm tra user đã đăng nhập chưa
        if (!user?.id) {
            toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
            return;
        }

        // Xóa trực tiếp qua API với ID của user đang đăng nhập
        return new Promise<void>((resolve, reject) => {
            deleteDanhGiaMutation.mutate({
                idDanhGia: reviewId,
                idNv: user.id // ID của tài khoản đang đăng nhập (admin hoặc nhân viên)
            }, {
                onSuccess: () => {
                    toast.success("Đã xóa đánh giá thành công!");
                    resolve();
                },
                onError: (error) => {
                    toast.error(error.message || "Có lỗi xảy ra khi xóa đánh giá");
                    reject(error);
                }
            });
        });
    };

    const handleBulkReply = async (replyText: string, reviewIds: number[], onProgress?: (progress: number) => void) => {
        // Kiểm tra user đã đăng nhập chưa
        if (!user?.id) {
            toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
            return;
        }

        // Tránh duplicate toast bằng cách kiểm tra nếu đang có request đang chạy
        if (updateDanhGiaMutation.isPending) {
            return;
        }

        try {
            // Thực hiện phản hồi hàng loạt - sử dụng sequential để tránh overload server
            for (let i = 0; i < reviewIds.length; i++) {
                const reviewId = reviewIds[i];
                await new Promise<void>((resolve, reject) => {
                    updateDanhGiaMutation.mutate({
                        idDanhGia: reviewId,
                        idNv: user.id,
                        phanHoi: replyText
                    }, {
                        onSuccess: () => resolve(),
                        onError: (error) => reject(error)
                    });
                });

                // Cập nhật progress
                const progress = ((i + 1) / reviewIds.length) * 100;
                onProgress?.(progress);
            }

            toast.success(`Đã gửi phản hồi cho ${reviewIds.length} đánh giá`);
        } catch (error) {
            console.error("Error in bulk reply:", error);
            toast.error("Có lỗi xảy ra khi gửi phản hồi hàng loạt");
        }
    };

    return (
        <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
            <ReviewStats reviews={reviews} />

            <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-xl">
                <CardHeader className="bg-gradient-to-r">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <CardTitle className="text-gray-900 dark:text-white">Danh sách đánh giá</CardTitle>
                        <ReviewFilter
                            filterRating={filterRating}
                            filterType={filterType}
                            filterDate={filterDate}
                            onFilterChange={setFilterRating}
                            onFilterTypeChange={setFilterType}
                            onFilterDateChange={setFilterDate}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <ReviewList
                        reviews={reviews}
                        filterRating={filterRating}
                        filterType={filterType}
                        filterDate={filterDate}
                        onUpdateReview={handleUpdateReview}
                        onDeleteReview={handleDeleteReview}
                        onBulkReply={handleBulkReply}
                    />
                </CardContent>
            </Card>
        </div>
    );
} 