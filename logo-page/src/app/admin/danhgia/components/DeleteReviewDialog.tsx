"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface DeleteReviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    customerName: string;
}

export default function DeleteReviewDialog({
    isOpen,
    onClose,
    onConfirm,
    customerName
}: DeleteReviewDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-900 dark:text-white">Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                        Hành động này sẽ xóa vĩnh viễn đánh giá từ <span className="font-semibold text-blue-600">{customerName}</span>. Bạn không thể hoàn tác hành động này.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                        Hủy
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                    >
                        Xóa đánh giá
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
} 