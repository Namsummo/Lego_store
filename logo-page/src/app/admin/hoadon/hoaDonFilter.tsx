"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface HoaDonFilterProps {
    filters: any;
    setFilters: React.Dispatch<React.SetStateAction<any>>;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    hoaDons: any[];
}

export default function HoaDonFilter({ filters, setFilters, setPage, hoaDons }: HoaDonFilterProps) {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const getSuggestions = (value: string) => {
        const inputValue = value.trim().toLowerCase();
        if (!inputValue) return [];
        return hoaDons.filter(
            (hd) =>
                (hd.id + "").includes(inputValue) ||
                (hd.ten && hd.ten.toLowerCase().includes(inputValue)) ||
                (hd.sdt && hd.sdt.includes(inputValue))
        ).slice(0, 5);
    };

    return (
        <form className="w-full border border-muted rounded-xl p-6 mb-8 shadow" onSubmit={(e) => e.preventDefault()}>
            <p className="text-muted-foreground font-medium text-sm mb-4">Bộ lọc tìm kiếm nâng cao</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Trạng thái đơn hàng</label>
                    <Select
                        value={filters.trangThai}
                        onValueChange={(value) => {
                            setFilters((f: any) => ({ ...f, trangThai: value }));
                            setPage(0);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Tất cả" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="PENDING">Đang xử lý</SelectItem>
                            <SelectItem value="PROCESSING">Đang chuẩn bị</SelectItem>
                            <SelectItem value="SHIPPED">Đang giao hàng</SelectItem>
                            <SelectItem value="DELIVERED">Đã giao hàng</SelectItem>
                            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Phương thức thanh toán</label>
                    <Select
                        value={filters.phuongThuc || "all"}
                        onValueChange={(value) => {
                            setFilters((f: any) => ({ ...f, phuongThuc: value === "all" ? "" : value }));
                            setPage(0);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Tất cả" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="COD">COD</SelectItem>
                            <SelectItem value="BANKING">Chuyển khoản</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Từ ngày</label>
                    <Input
                        type="datetime-local"
                        value={filters.from}
                        onChange={(e) => {
                            setFilters((f: any) => ({ ...f, from: e.target.value }));
                            setPage(0);
                        }}
                    />
                </div>

                <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Đến ngày</label>
                    <Input
                        type="datetime-local"
                        value={filters.to}
                        onChange={(e) => {
                            setFilters((f: any) => ({ ...f, to: e.target.value }));
                            setPage(0);
                        }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
                <div className="lg:col-span-4 relative">
                    <label className="text-sm text-muted-foreground mb-1 block">Tìm kiếm (mã, tên, SĐT, ...)</label>
                    <Input
                        placeholder="Nhập từ khóa tìm kiếm..."
                        value={filters.keyword}
                        onChange={(e) => {
                            const value = e.target.value;
                            setFilters((f: any) => ({ ...f, keyword: value }));
                            setPage(0);
                            if (value) {
                                setSuggestions(getSuggestions(value));
                                setShowSuggestions(true);
                            } else {
                                setSuggestions([]);
                                setShowSuggestions(false);
                            }
                        }}
                        onFocus={() => {
                            if (filters.keyword) {
                                setSuggestions(getSuggestions(filters.keyword));
                                setShowSuggestions(true);
                            }
                        }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-10 bg-popover border rounded w-full mt-1 max-h-40 overflow-y-auto text-sm">
                            {suggestions.map((hd) => (
                                <li
                                    key={hd.id}
                                    className="px-3 py-2 hover:bg-muted cursor-pointer"
                                    onMouseDown={() => {
                                        setFilters((f: any) => ({ ...f, keyword: hd.ten || hd.sdt || hd.id }));
                                        setPage(0);
                                        setShowSuggestions(false);
                                    }}
                                >
                                    #{hd.id} - {hd.ten} - {hd.sdt}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            setFilters({ keyword: "", trangThai: "all", phuongThuc: "all", from: "", to: "" });
                            setPage(0);
                        }}
                    >
                        <RotateCcw className="w-4 h-4 mr-2" /> Đặt lại
                    </Button>
                </div>
            </div>
        </form>
    );
}
