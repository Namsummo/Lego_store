import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface StatusOption {
    value: string;
    label: string;
    count: number;
}

interface OrderFiltersProps {
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    dateFilter: string;
    setDateFilter: (value: string) => void;
    searchKeyword: string;
    setSearchKeyword: (value: string) => void;
    statusOptions: StatusOption[];
}

export default function OrderFilters({
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    searchKeyword,
    setSearchKeyword,
    statusOptions,
}: OrderFiltersProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-[0_6px_20px_rgba(0,0,0,0.08)]"
        >
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                <TabsList className="flex flex-nowrap gap-2 bg-transparent overflow-x-auto">
                    {statusOptions.map((option) => (
                        <TabsTrigger
                            key={option.value}
                            value={option.value}
                            className={`px-3 py-1 rounded-lg transition-all duration-300 min-w-[110px] text-center
                ${statusFilter === option.value
                                    ? `bg-[#FFD400] text-black border border-yellow-400 shadow-sm underline`
                                    : `bg-white text-gray-500 border border-slate-200 hover:border-yellow-300`
                                } `}
                        >
                            <span className="text-sm">{option.label}</span>
                            {option.count > 0 && (
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full border border-yellow-400 text-slate-800 bg-[#FFF8CC]">
                                    {option.count}
                                </span>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="flex gap-4 mt-4 items-center">
                <Input
                    placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 focus:border-yellow-400 focus:ring-0 text-slate-900"
                />
                <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-48 bg-white border border-slate-300 focus:border-yellow-400 focus:ring-0 text-slate-900"
                />
            </div>
        </motion.div>
    );
}