"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { palette } from "./palette";


interface OrderPaginationProps {
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
    itemPerPage: number;
    setItemPerPage: (items: number) => void;
    totalItems: number;
    displayedItems: number;
}

export default function OrderPagination({
    currentPage,
    setCurrentPage,
    totalPages,
    itemPerPage,
    setItemPerPage,
    totalItems,
    displayedItems,
}: OrderPaginationProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center gap-2 mt-8"
        >
            <div className={`text - sm ${palette.subText} `}>
                Hiển thị {displayedItems} / {totalItems} đơn hàng
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 transition-colors duration-200"
                >
                    ←
                </Button>
                <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                            <motion.div key={page} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                                <Button
                                    variant={currentPage === page ? "default" : "outline"}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w - 10 ${currentPage === page
                                        ? "bg-[#FFD400] text-black"
                                        : "bg-white border border-slate-300 text-slate-900 hover:bg-slate-100"
                                        } transition - colors duration - 200`}
                                >
                                    {page}
                                </Button>
                            </motion.div>
                        );
                    })}
                </div>
                <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="bg-white border border-slate-300 text-slate-900 hover:bg-slate-100 transition-colors duration-200"
                >
                    →
                </Button>
                <Select value={itemPerPage.toString()} onValueChange={(v) => setItemPerPage(Number(v))}>
                    <SelectTrigger className="w-40 bg-white border border-slate-300 text-slate-900">
                        <SelectValue placeholder="Số bản ghi" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-slate-900">
                        {[5, 10, 20, 50].map((v) => (
                            <SelectItem key={v} value={v.toString()}>
                                {v} bản ghi
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </motion.div>
    );
}
