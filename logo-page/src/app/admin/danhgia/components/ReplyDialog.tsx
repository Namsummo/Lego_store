"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReplyDialogProps } from "@/components/types/danhGia-type";

export default function ReplyDialog({
    isOpen,
    onClose,
    onSave,
    replyText,
    setReplyText,
    customerName,
    hasExistingReply
}: ReplyDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Reset error khi dialog mở
    useEffect(() => {
        if (isOpen) {
            setError("");
        }
    }, [isOpen]);

    const handleSave = async () => {
        const trimmedText = replyText.trim();

        // Validation
        if (trimmedText.length === 0) {
            setError("Phản hồi không được để trống");
            return;
        }

        if (trimmedText.length > 1000) {
            setError("Phản hồi không được vượt quá 1000 ký tự");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            await onSave();
        } catch {
            setError("Có lỗi xảy ra khi lưu phản hồi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setError("");
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">
                        {hasExistingReply ? 'Sửa phản hồi' : 'Phản hồi đánh giá'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-300">
                        Soạn và gửi phản hồi cho khách hàng <span className="font-semibold text-blue-600">{customerName}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        value={replyText}
                        onChange={(e) => {
                            setReplyText(e.target.value);
                            if (error) setError("");
                        }}
                        placeholder="Nhập phản hồi của bạn..."
                        rows={5}
                        className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={isSubmitting}
                    />
                    {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                        {replyText.length}/1000 ký tự
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                        disabled={isSubmitting || replyText.trim().length === 0}
                    >
                        {isSubmitting ? 'Đang lưu...' : (hasExistingReply ? 'Cập nhật' : 'Gửi phản hồi')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 