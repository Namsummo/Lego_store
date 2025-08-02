"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface BulkReplyDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (replyText: string) => Promise<void>;
    selectedReviews: Array<{
        id: number;
        tenKH?: string;
        tenNguoiDung?: string;
        user?: { ten?: string };
        tieuDe?: string;
    }>;
    progress?: number;
}

export default function BulkReplyDialog({ isOpen, onClose, onSave, selectedReviews, progress = 0 }: BulkReplyDialogProps) {
    const [replyText, setReplyText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!replyText.trim()) {
            toast.error("Vui lòng nhập nội dung phản hồi");
            return;
        }

        setIsLoading(true);
        try {
            await onSave(replyText.trim());
            setReplyText('');
            onClose();
            // Toast sẽ được hiển thị từ page component để tránh duplicate
        } catch (error) {
            console.error("Error in bulk reply:", error);
            toast.error("Có lỗi xảy ra khi gửi phản hồi");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setReplyText('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        Phản hồi hàng loạt
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Hiển thị danh sách đánh giá được chọn */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Đánh giá được chọn ({selectedReviews.length})
                        </Label>
                        <div className="mt-2 max-h-32 overflow-y-auto space-y-2">
                            {selectedReviews.map((review, index) => (
                                <div key={review.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
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
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {review.tieuDe || "Không có tiêu đề"}
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="ml-2 flex-shrink-0">
                                        #{index + 1}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Textarea cho nội dung phản hồi */}
                    <div>
                        <Label htmlFor="bulk-reply-text" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nội dung phản hồi
                        </Label>
                        <Textarea
                            id="bulk-reply-text"
                            placeholder="Nhập nội dung phản hồi cho tất cả đánh giá đã chọn..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="mt-2 min-h-[120px] resize-none"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Phản hồi này sẽ được áp dụng cho tất cả {selectedReviews.length} đánh giá đã chọn
                        </p>
                        {isLoading && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <span>Đang xử lý...</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading || !replyText.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Đang gửi...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Gửi phản hồi ({selectedReviews.length})
                            </div>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 