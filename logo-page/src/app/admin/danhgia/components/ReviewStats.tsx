"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, TrendingUp, Reply, Image, Video } from "lucide-react";
import { ReviewStatsProps, StatCardProps } from "@/components/types/danhGia-type";

const StatCard = ({ icon: Icon, title, value, color }: StatCardProps) => {
    const getIconStyle = (color: string) => {
        switch (color) {
            case 'blue':
                return 'bg-gradient-to-br from-blue-400 to-blue-600';
            case 'amber':
                return 'bg-gradient-to-br from-amber-400 to-amber-600';
            case 'emerald':
                return 'bg-gradient-to-br from-emerald-400 to-emerald-600';
            case 'purple':
                return 'bg-gradient-to-br from-purple-400 to-purple-600';
            case 'red':
                return 'bg-gradient-to-br from-red-400 to-red-600';
            default:
                return 'bg-gradient-to-br from-gray-400 to-gray-600';
        }
    };

    return (
        <Card className="bg-white dark:bg-gray-800 border-2 border-blue-100 dark:border-blue-900 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 flex items-center space-x-4">
                <div className={`w-12 h-12 ${getIconStyle(color)} rounded-full flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default function ReviewStats({ reviews }: ReviewStatsProps) {
    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((acc, review) => acc + review.soSao, 0);
        return (total / reviews.length).toFixed(1);
    }, [reviews]);

    const repliedCount = useMemo(() => {
        return reviews.filter(r => r.textPhanHoi).length;
    }, [reviews]);

    const reviewsWithImages = useMemo(() => {
        return reviews.filter(r => r.anhUrls && r.anhUrls.length > 0).length;
    }, [reviews]);

    const reviewsWithVideo = useMemo(() => {
        return reviews.filter(r => r.video).length;
    }, [reviews]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard
                icon={MessageSquare}
                title="Tổng đánh giá"
                value={reviews.length}
                color="blue"
            />
            <StatCard
                icon={TrendingUp}
                title="Đánh giá trung bình"
                value={averageRating}
                color="amber"
            />
            <StatCard
                icon={Reply}
                title="Đã phản hồi"
                value={repliedCount}
                color="emerald"
            />
            <StatCard
                icon={Image}
                title="Có ảnh"
                value={reviewsWithImages}
                color="purple"
            />
            <StatCard
                icon={Video}
                title="Có video"
                value={reviewsWithVideo}
                color="red"
            />
        </div>
    );
} 