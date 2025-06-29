import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw } from "lucide-react";

interface HoaDonFilterProps {
    filters: any;
    setFilters: React.Dispatch<React.SetStateAction<any>>;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    hoaDons: any[]; // truyền mảng hóa đơn vào để gợi ý
}

const HoaDonFilter: React.FC<HoaDonFilterProps> = ({ filters, setFilters, setPage, hoaDons }) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Hàm lấy gợi ý theo từ khóa
    const getSuggestions = (value: string) => {
        const inputValue = value.trim().toLowerCase();
        if (!inputValue) return [];
        return hoaDons.filter(
            (hd) =>
                (hd.id + "").includes(inputValue) ||
                (hd.ten && hd.ten.toLowerCase().includes(inputValue)) ||
                (hd.sdt && hd.sdt.includes(inputValue))
        ).slice(0, 5); // lấy tối đa 5 gợi ý
    };

    return (
        <form
            className="w-full bg-[#181e29] rounded-xl shadow-lg p-6 mb-8"
            onSubmit={e => e.preventDefault()}
        >
            <div className="mb-4 text-blue-400 font-semibold text-sm">Bộ lọc tìm kiếm nâng cao</div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Trạng thái đơn hàng */}
                <div>
                    <label className="block text-xs font-medium text-gray-200 mb-1">Trạng thái đơn hàng</label>
                    <Select
                        value={filters.trangThai}
                        onValueChange={value => {
                            setFilters((f: any) => ({ ...f, trangThai: value }));
                            setPage(0);
                        }}
                    >
                        <SelectTrigger className="w-full bg-[#232b3b] text-white border border-[#2d3748]">
                            {filters.trangThai === "all" ? "Tất cả" : filters.trangThai}
                        </SelectTrigger>
                        <SelectContent className="bg-[#232b3b] text-white">
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="PENDING">Đang xử lý</SelectItem>
                            <SelectItem value="PROCESSING">Đang chuẩn bị</SelectItem>
                            <SelectItem value="SHIPPED">Đang giao hàng</SelectItem>
                            <SelectItem value="DELIVERED">Đã giao hàng</SelectItem>
                            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Phương thức thanh toán */}
                <div>
                    <label className="block text-xs font-medium text-gray-200 mb-1">Phương thức thanh toán</label>
                    <Select
                        value={filters.phuongThuc || "all"}
                        onValueChange={value => {
                            setFilters((f: any) => ({ ...f, phuongThuc: value === "all" ? "" : value }));
                            setPage(0);
                        }}
                    >
                        <SelectTrigger className="w-full bg-[#232b3b] text-white border border-[#2d3748]">
                            {filters.phuongThuc === "COD"
                                ? "COD"
                                : filters.phuongThuc === "BANKING"
                                    ? "Chuyển khoản"
                                    : "Tất cả"}
                        </SelectTrigger>
                        <SelectContent className="bg-[#232b3b] text-white">
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="COD">COD</SelectItem>
                            <SelectItem value="BANKING">Chuyển khoản</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Từ ngày */}
                <div>
                    <label className="block text-xs font-medium text-gray-200 mb-1">Từ ngày</label>
                    <Input
                        type="datetime-local"
                        className="w-full bg-[#232b3b] text-white border border-[#2d3748] focus:border-blue-500"
                        value={filters.from}
                        onChange={e => {
                            setFilters((f: any) => ({ ...f, from: e.target.value }));
                            setPage(0);
                        }}
                    />
                </div>

                {/* Đến ngày */}
                <div>
                    <label className="block text-xs font-medium text-gray-200 mb-1">Đến ngày</label>
                    <Input
                        type="datetime-local"
                        className="w-full bg-[#232b3b] text-white border border-[#2d3748] focus:border-blue-500"
                        value={filters.to}
                        onChange={e => {
                            setFilters((f: any) => ({ ...f, to: e.target.value }));
                            setPage(0);
                        }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
                {/* Ô tìm kiếm */}
                <div className="lg:col-span-4 relative">
                    <label className="block text-xs font-medium text-gray-200 mb-1">Tìm kiếm (mã, tên, SĐT, ...)</label>
                    <Input
                        className="w-full bg-[#232b3b] text-white border border-[#2d3748] placeholder-gray-400 focus:border-blue-500"
                        placeholder="Nhập từ khóa tìm kiếm..."
                        value={filters.keyword}
                        autoComplete="off"
                        onChange={e => {
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
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 500)}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-10 bg-[#232b3b] border border-[#2d3748] rounded w-full mt-1 max-h-40 overflow-y-auto">
                            {suggestions.map((hd, idx) => (
                                <li
                                    key={hd.id}
                                    className="px-3 py-2 hover:bg-blue-600 cursor-pointer text-white"
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

                {/* Nút reset */}
                <div className="flex justify-center lg:justify-start">
                    <button
                        type="button"
                        className="bg-[#232b3b] text-white border border-[#2d3748] hover:bg-[#2d3748] rounded-lg w-11 h-11 flex items-center justify-center"
                        aria-label="Reset bộ lọc"
                        onClick={() => {
                            setFilters({
                                keyword: "",
                                trangThai: "all",
                                phuongThuc: "all",
                                from: "",
                                to: "",
                            });
                            setPage(0);
                        }}
                    >
                        <RotateCcw className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </form>

    );
};

export default HoaDonFilter;