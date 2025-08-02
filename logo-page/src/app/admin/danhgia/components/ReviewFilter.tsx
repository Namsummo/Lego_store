"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ReviewFilterProps } from "@/components/types/danhGia-type";

const ReviewFilter = ({
    filterRating,
    filterType,
    filterDate,
    onFilterChange,
    onFilterTypeChange,
    onFilterDateChange
}: ReviewFilterProps) => {
    const selectedDate = filterDate ? new Date(filterDate) : undefined;

    return (
        <div className="flex items-center gap-4 flex-wrap">
            {/* Lọc theo xếp hạng */}
            <Select value={filterRating} onValueChange={onFilterChange}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400">
                    <SelectValue placeholder="Lọc theo xếp hạng" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                    <SelectItem value="all" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">Tất cả xếp hạng</SelectItem>
                    <SelectItem value="5" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">5 sao</SelectItem>
                    <SelectItem value="4" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">4 sao</SelectItem>
                    <SelectItem value="3" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">3 sao</SelectItem>
                    <SelectItem value="2" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">2 sao</SelectItem>
                    <SelectItem value="1" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">1 sao</SelectItem>
                </SelectContent>
            </Select>

            {/* Lọc theo loại */}
            <Select value={filterType} onValueChange={onFilterTypeChange}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400">
                    <SelectValue placeholder="Lọc theo loại" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                    <SelectItem value="all" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">Tất cả</SelectItem>
                    <SelectItem value="withImages" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">Có ảnh</SelectItem>
                    <SelectItem value="withVideo" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">Có video</SelectItem>
                    <SelectItem value="withReply" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">Có phản hồi</SelectItem>
                </SelectContent>
            </Select>

            {/* Lọc theo ngày */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-[180px] justify-start text-left font-normal bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Chọn ngày"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            if (date) {
                                onFilterDateChange(format(date, "yyyy-MM-dd"));
                            } else {
                                onFilterDateChange("");
                            }
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default ReviewFilter; 