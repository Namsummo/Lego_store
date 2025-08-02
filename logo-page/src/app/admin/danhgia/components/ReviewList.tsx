"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import ReviewItem from "./ReviewItem";
import BulkReplyDialog from "./BulkReplyDialog";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, CheckCheck } from "lucide-react";
import { ReviewListProps, DanhGiaResponse } from "@/components/types/danhGia-type";

export default function ReviewList({
    reviews,
    filterRating,
    filterType,
    filterDate,
    onUpdateReview,
    onDeleteReview,
    onBulkReply
}: ReviewListProps & { onBulkReply?: (replyText: string, selectedReviewIds: number[], onProgress?: (progress: number) => void) => Promise<void> }) {
    const [selectedReviews, setSelectedReviews] = useState<Set<number>>(new Set());
    const [isBulkReplyDialogOpen, setIsBulkReplyDialogOpen] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [bulkReplyProgress, setBulkReplyProgress] = useState(0);

    // Hàm helper để lấy ngày từ review
    const getReviewDate = (review: DanhGiaResponse): string => {
        if (typeof review.ngayDanhGia === 'string') {
            return review.ngayDanhGia;
        } else if (Array.isArray(review.ngayDanhGia)) {
            const [year, month, day, hour, minute, second] = review.ngayDanhGia;
            return new Date(year, month - 1, day, hour, minute, second).toISOString();
        } else {
            return new Date().toISOString();
        }
    };

    const filteredReviews = useMemo(() => {
        const filtered = reviews.filter(review => {
            const ratingMatch = filterRating === 'all' || review.soSao === parseInt(filterRating);

            let typeMatch = true;
            if (filterType === 'withImages') {
                typeMatch = !!(review.anhUrls && review.anhUrls.length > 0);
            } else if (filterType === 'withVideo') {
                typeMatch = !!review.video;
            } else if (filterType === 'withReply') {
                typeMatch = !!review.textPhanHoi;
            }

            // Lọc theo ngày
            let dateMatch = true;
            if (filterDate) {
                const reviewDate = getReviewDate(review);
                const filterDateObj = new Date(filterDate);
                const reviewDateObj = new Date(reviewDate);

                // Debug: Log để kiểm tra
                console.log('Filter Date:', filterDate);
                console.log('Review Date:', reviewDate);
                console.log('Filter Date Obj:', filterDateObj.toDateString());
                console.log('Review Date Obj:', reviewDateObj.toDateString());

                // So sánh chỉ ngày (không tính giờ)
                dateMatch = reviewDateObj.toDateString() === filterDateObj.toDateString();
            }

            return ratingMatch && typeMatch && dateMatch;
        });

        // Sắp xếp theo ngày đánh giá mới nhất lên đầu
        return filtered.sort((a, b) => {
            const getDate = (review: DanhGiaResponse) => {
                if (typeof review.ngayDanhGia === 'string') {
                    return new Date(review.ngayDanhGia).getTime();
                } else if (Array.isArray(review.ngayDanhGia)) {
                    const [year, month, day, hour, minute, second] = review.ngayDanhGia;
                    return new Date(year, month - 1, day, hour, minute, second).getTime();
                } else {
                    return new Date().getTime();
                }
            };

            const dateA = getDate(a);
            const dateB = getDate(b);

            // Sắp xếp giảm dần (mới nhất lên đầu)
            return dateB - dateA;
        });
    }, [reviews, filterRating, filterType, filterDate]);

    // Xử lý chọn/bỏ chọn đánh giá
    const handleSelectionChange = (reviewId: number, selected: boolean) => {
        const newSelected = new Set(selectedReviews);
        if (selected) {
            newSelected.add(reviewId);
        } else {
            newSelected.delete(reviewId);
        }
        setSelectedReviews(newSelected);
    };

    // Lấy danh sách đánh giá đã chọn
    const selectedReviewList = filteredReviews.filter(review => selectedReviews.has(review.id));

    const handleBulkReplyClick = () => {
        setIsBulkReplyDialogOpen(true);
    };

    const handleBulkReplySave = async (replyText: string) => {
        if (onBulkReply) {
            try {
                setBulkReplyProgress(0);
                await onBulkReply(replyText, Array.from(selectedReviews), setBulkReplyProgress);
                setSelectedReviews(new Set()); // Reset selection after bulk reply
                setIsSelectionMode(false); // Tắt chế độ chọn sau khi gửi phản hồi
            } catch (error) {
                // Error đã được xử lý trong page component
                console.error("Error in bulk reply:", error);
            }
        }
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        if (isSelectionMode) {
            setSelectedReviews(new Set()); // Clear selection when turning off
        }
    };

    const selectAllReviews = () => {
        const allReviewIds = new Set(filteredReviews.map(review => review.id));
        setSelectedReviews(allReviewIds);
    };

    const clearAllSelection = () => {
        setSelectedReviews(new Set());
    };

    return (
        <div className="space-y-4">
            {/* Nút bật/tắt chế độ chọn nhiều */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant={isSelectionMode ? "default" : "outline"}
                        size="sm"
                        onClick={toggleSelectionMode}
                        className={`flex items-center gap-2 ${isSelectionMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'border-blue-300 text-white-600 hover:bg-white'
                            }`}
                    >
                        {isSelectionMode ? (
                            <>
                                <CheckSquare className="w-4 h-4" />
                                Tắt chế độ chọn
                            </>
                        ) : (
                            <>
                                <Square className="w-4 h-4" />
                                Bật chế độ chọn
                            </>
                        )}
                    </Button>
                    {isSelectionMode && (
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                            Click vào checkbox để chọn đánh giá
                        </span>
                    )}
                </div>
                {/* Nút chọn tất cả khi đang ở chế độ chọn */}
                {isSelectionMode && (
                    <div className="flex items-center gap-2">
                        {selectedReviews.size === filteredReviews.length ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearAllSelection}
                                className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
                            >
                                <Square className="w-4 h-4" />
                                Bỏ chọn tất cả
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={selectAllReviews}
                                className="flex items-center gap-2 border-green-300 text-green-600 hover:bg-green-50"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Chọn tất cả ({filteredReviews.length})
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Hiển thị thông tin về đánh giá đã chọn */}
            {selectedReviews.size > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Đã chọn {selectedReviews.size} đánh giá
                            </span>
                        </div>
                        {onBulkReply && (
                            <button
                                onClick={handleBulkReplyClick}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Phản hồi đánh giá đã chọn
                            </button>
                        )}
                    </div>
                </div>
            )}

            <AnimatePresence>
                {filteredReviews.map((review) => (
                    <ReviewItem
                        key={review.id}
                        review={review}
                        onUpdateReview={onUpdateReview}
                        onDeleteReview={onDeleteReview}
                        isSelected={selectedReviews.has(review.id)}
                        onSelectionChange={isSelectionMode ? handleSelectionChange : undefined}
                    />
                ))}
            </AnimatePresence>
            {filteredReviews.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-gray-600 dark:text-gray-300">Không tìm thấy đánh giá nào phù hợp.</p>
                </div>
            )}

            <BulkReplyDialog
                isOpen={isBulkReplyDialogOpen}
                onClose={() => setIsBulkReplyDialogOpen(false)}
                onSave={handleBulkReplySave}
                selectedReviews={selectedReviewList}
                progress={bulkReplyProgress}
            />
        </div>
    );
} 