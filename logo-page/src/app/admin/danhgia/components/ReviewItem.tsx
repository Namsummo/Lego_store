"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Star, MoreVertical, Trash2, Reply, CornerDownRight, Pencil } from "lucide-react";
import { toast } from "sonner";
import ReplyDialog from "./ReplyDialog";
import DeleteReplyDialog from "./DeleteReplyDialog";
import DeleteReviewDialog from "./DeleteReviewDialog";
import VideoModal from "./VideoModal";
import { ReviewItemProps } from "@/components/types/danhGia-type";

const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
        <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
        />
    ));
};

export default function ReviewItem({
    review,
    onUpdateReview,
    onDeleteReview,
    isSelected = false,
    onSelectionChange
}: ReviewItemProps & {
    isSelected?: boolean;
    onSelectionChange?: (reviewId: number, selected: boolean) => void;
}) {
    const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
    const [isDeleteReplyDialogOpen, setIsDeleteReplyDialogOpen] = useState(false);
    const [isDeleteReviewDialogOpen, setIsDeleteReviewDialogOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [replyText, setReplyText] = useState(review.textPhanHoi || '');

    const handleReplyClick = () => {
        setReplyText(review.textPhanHoi || '');
        setIsReplyDialogOpen(true);
    };

    const handleSaveReply = async () => {
        // Nếu replyText rỗng hoặc chỉ có khoảng trắng, coi như xóa phản hồi
        const trimmedReply = replyText.trim();

        try {
            await onUpdateReview(review.id, { ...review, textPhanHoi: trimmedReply });

            if (trimmedReply.length > 0) {
                const customerName = (() => {
                    let displayName = "Khách hàng";
                    if (review.user?.ten && review.user.ten.trim()) {
                        displayName = review.user.ten.trim();
                    } else if (review.tenNguoiDung && review.tenNguoiDung.trim()) {
                        displayName = review.tenNguoiDung.trim();
                    } else if (review.tenKH && review.tenKH.trim()) {
                        displayName = review.tenKH.trim();
                    }
                    return displayName;
                })();
                toast.success(`Phản hồi cho ${customerName} đã được cập nhật.`);
            } else {
                toast.success("Đã xóa phản hồi!");
            }

            setIsReplyDialogOpen(false);
        } catch (error) {
            console.error("Error in handleSaveReply:", error);
            // Error sẽ được xử lý trong page component
            throw error;
        }
    };

    const handleDeleteReplyClick = () => {
        setIsDeleteReplyDialogOpen(true);
    };

    const confirmDeleteReply = async () => {
        try {
            // Gửi phản hồi rỗng để xóa
            await onUpdateReview(review.id, { ...review, textPhanHoi: '' });
            toast.success("Đã xóa phản hồi!");
            setIsDeleteReplyDialogOpen(false);
        } catch (error) {
            console.error("Error in confirmDeleteReply:", error);
            // Error sẽ được xử lý trong page component
            throw error;
        }
    };

    const handleDeleteReview = () => {
        setIsDeleteReviewDialogOpen(true);
    };

    const confirmDeleteReview = async () => {
        try {
            await onDeleteReview(review.id);
            setIsDeleteReviewDialogOpen(false);
        } catch (error) {
            console.error("Error in confirmDeleteReview:", error);
            // Error sẽ được xử lý trong page component
            throw error;
        }
    };

    const handleVideoClick = () => {
        setIsVideoModalOpen(true);
    };

    // Kiểm tra xem có phản hồi hay không (không null, undefined, hoặc rỗng)
    const hasReply = review.textPhanHoi && review.textPhanHoi.trim().length > 0;

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                className={`p-6 bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-300 shadow-md hover:shadow-lg ${isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        {/* Checkbox cho chọn đánh giá - chỉ hiển thị khi có onSelectionChange */}
                        {onSelectionChange && (
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => onSelectionChange(review.id, checked as boolean)}
                                className="mt-1"
                            />
                        )}
                        <Avatar className="ring-2 ring-blue-100 dark:ring-blue-900">
                            <AvatarImage src="/images/avatar-admin.png" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
                                {(() => {
                                    let displayName = "K";
                                    if (review.user?.ten && review.user.ten.trim()) {
                                        displayName = review.user.ten.trim();
                                    } else if (review.tenNguoiDung && review.tenNguoiDung.trim()) {
                                        displayName = review.tenNguoiDung.trim();
                                    } else if (review.tenKH && review.tenKH.trim()) {
                                        displayName = review.tenKH.trim();
                                    }
                                    return displayName.charAt(0);
                                })()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                {(() => {
                                    let displayName = "Khách hàng";
                                    if (review.user?.ten && review.user.ten.trim()) {
                                        displayName = review.user.ten.trim();
                                    } else if (review.tenNguoiDung && review.tenNguoiDung.trim()) {
                                        displayName = review.tenNguoiDung.trim();
                                    } else if (review.tenKH && review.tenKH.trim()) {
                                        displayName = review.tenKH.trim();
                                    }
                                    return displayName;
                                })()}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {review.tenSP || "Sản phẩm"} - {review.maSP || review.spId}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                                <div className="flex">{renderStars(review.soSao)}</div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {(() => {
                                        if (typeof review.ngayDanhGia === 'string') {
                                            const date = new Date(review.ngayDanhGia);
                                            return date.toLocaleString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            });
                                        } else if (Array.isArray(review.ngayDanhGia)) {
                                            // Xử lý khi ngayDanhGia là array từ Java LocalDateTime
                                            const [year, month, day, hour, minute, second] = review.ngayDanhGia;
                                            const date = new Date(year, month - 1, day, hour, minute, second);
                                            return date.toLocaleString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            });
                                        } else {
                                            return new Date().toLocaleString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            });
                                        }
                                    })()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                            <DropdownMenuItem onClick={handleReplyClick} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                <Reply className="w-4 h-4 mr-2 text-blue-600" />
                                {hasReply ? 'Sửa phản hồi' : 'Phản hồi'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleDeleteReview} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa đánh giá
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{review.tieuDe}</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{review.textDanhGia}</p>

                {/* Hiển thị ảnh và video đính kèm */}
                {(review.anhUrls && review.anhUrls.length > 0) || review.video ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {/* Hiển thị ảnh */}
                        {review.anhUrls && review.anhUrls.map((anh, index) => (
                            <div key={anh.id} className="relative">
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/lego-store/danh-gia/images/${anh.url}`}
                                    alt={`Ảnh ${index + 1}`}
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/lego-store/danh-gia/images/${anh.url}`, '_blank')}
                                />
                            </div>
                        ))}

                        {/* Hiển thị video thumbnail */}
                        {review.video && (
                            <div className="relative">
                                <div
                                    className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors cursor-pointer flex items-center justify-center"
                                    onClick={handleVideoClick}
                                >
                                    <div className="w-8 h-8 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}

                {/* Chỉ hiển thị phản hồi khi có giá trị */}
                {hasReply && (
                    <div className="mt-4 ml-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-blue-500 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <CornerDownRight className="w-4 h-4 text-blue-600" />
                                <h5 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Phản hồi từ Lego MyKingDom</h5>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-blue-100 dark:hover:bg-blue-800" onClick={handleReplyClick}>
                                    <Pencil className="w-4 h-4 text-blue-600" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-100 dark:hover:bg-red-800" onClick={handleDeleteReplyClick}>
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{review.textPhanHoi}</p>
                    </div>
                )}
            </motion.div>

            <ReplyDialog
                isOpen={isReplyDialogOpen}
                onClose={() => setIsReplyDialogOpen(false)}
                onSave={handleSaveReply}
                replyText={replyText}
                setReplyText={setReplyText}
                customerName={(() => {
                    let displayName = "Khách hàng";
                    if (review.user?.ten && review.user.ten.trim()) {
                        displayName = review.user.ten.trim();
                    } else if (review.tenNguoiDung && review.tenNguoiDung.trim()) {
                        displayName = review.tenNguoiDung.trim();
                    } else if (review.tenKH && review.tenKH.trim()) {
                        displayName = review.tenKH.trim();
                    }
                    return displayName;
                })()}
                hasExistingReply={!!hasReply}
            />

            <DeleteReplyDialog
                isOpen={isDeleteReplyDialogOpen}
                onClose={() => setIsDeleteReplyDialogOpen(false)}
                onConfirm={confirmDeleteReply}
                customerName={(() => {
                    let displayName = "Khách hàng";
                    if (review.user?.ten && review.user.ten.trim()) {
                        displayName = review.user.ten.trim();
                    } else if (review.tenNguoiDung && review.tenNguoiDung.trim()) {
                        displayName = review.tenNguoiDung.trim();
                    } else if (review.tenKH && review.tenKH.trim()) {
                        displayName = review.tenKH.trim();
                    }
                    return displayName;
                })()}
            />

            <DeleteReviewDialog
                isOpen={isDeleteReviewDialogOpen}
                onClose={() => setIsDeleteReviewDialogOpen(false)}
                onConfirm={confirmDeleteReview}
                customerName={(() => {
                    let displayName = "Khách hàng";
                    if (review.user?.ten && review.user.ten.trim()) {
                        displayName = review.user.ten.trim();
                    } else if (review.tenNguoiDung && review.tenNguoiDung.trim()) {
                        displayName = review.tenNguoiDung.trim();
                    } else if (review.tenKH && review.tenKH.trim()) {
                        displayName = review.tenKH.trim();
                    }
                    return displayName;
                })()}
            />

            <VideoModal
                isOpen={isVideoModalOpen}
                onClose={() => setIsVideoModalOpen(false)}
                videoUrl={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/lego-store/danh-gia/videos/${review.video?.url || ''}`}
            />
        </>
    );
} 