"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="relative max-w-4xl w-full mx-4">
                {/* Nút đóng */}
                <Button
                    onClick={onClose}
                    variant="ghost"
                    size="icon"
                    className="absolute -top-12 right-0 z-10 bg-blue-500 hover:!bg-red-500 hover:!text-white rounded-full w-10 h-10 shadow-lg transition-all duration-200"
                >
                    <X className="w-6 h-6" />
                </Button>

                {/* Video player */}
                <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                        src={videoUrl}
                        controls
                        className="w-full h-auto max-h-[80vh]"
                        autoPlay
                    >
                        Trình duyệt của bạn không hỗ trợ video.
                    </video>
                </div>
            </div>
        </div>
    );
} 