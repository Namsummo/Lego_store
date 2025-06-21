"use client";
import React, { useState } from "react";
import { HoaDonService } from "@/services/hoaDonService";
import { useHoaDonPaging } from "@/hooks/useHoaDon";
import { HoaDonDTO, TrangThaiHoaDon } from "@/components/types/hoaDon-types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

import { Document, Packer, Paragraph, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell, TextRun } from "docx";
import { Eye, Search, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 10;

// Hàm đổi màu trạng thái
const getStatusColor = (status: string) => {
    switch (status) {
        case TrangThaiHoaDon.PENDING:
            return "bg-yellow-100 text-yellow-800";
        case TrangThaiHoaDon.PROCESSING:
            return "bg-blue-100 text-blue-800";
        case TrangThaiHoaDon.SHIPPING:
            return "bg-purple-100 text-purple-800";
        case TrangThaiHoaDon.DELIVERED:
            return "bg-green-100 text-green-800";
        case TrangThaiHoaDon.CANCELLED:
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

// Hàm chuyển mảng ngày từ backend sang Date JS
function parseBackendDate(date: number[] | Date | string | number | undefined): Date | null {
    if (!date) return null;
    if (Array.isArray(date) && date.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = date;
        return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1e6));
    }
    if (typeof date === "string" || typeof date === "number" || date instanceof Date) {
        const d = new Date(date);
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
}

const HoaDonManagement: React.FC = () => {
    const [page, setPage] = useState(0);
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<any>(null);
    const { data: pagedData, isLoading: isLoadingPaging, isError: isErrorPaging, error: errorPaging } = useHoaDonPaging(page, PAGE_SIZE);
    const [open, setOpen] = useState(false);
    const [detail, setDetail] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [chiTietSanPham, setChiTietSanPham] = useState<any[]>([]);
    const [showFilter, setShowFilter] = useState(false);
    const [filters, setFilters] = useState({
        ma: "",
        trangThai: "all",      // <-- mặc định là "all"
        phuongThuc: "all",     // <-- mặc định là "all"
        tenNguoiDung: "",
        sdt: "",
        from: "",
        to: "",
    });

    const handleViewDetail = async (id: number) => {
        setLoadingDetail(true);
        setOpen(true);
        try {
            const data = await HoaDonService.getHoaDonById(id);
            setDetail(data);
            // Gọi API lấy chi tiết sản phẩm theo id hóa đơn
            const res = await fetch(`http://localhost:8080/api/lego-store/hoa-don-chi-tiet/hoaDon/${id}`);
            const chiTiet = await res.json();
            setChiTietSanPham(chiTiet);
        } catch (e) {
            setDetail(null);
            setChiTietSanPham([]);
        }
        setLoadingDetail(false);
    };

    const exportExcel = () => {
        const wsData = [
            [`Chi tiết hóa đơn #${detail.id}`],
            [],
            ["Mã hóa đơn", detail.id, "", "Tên khách hàng", detail.ten],
            ["Ngày tạo", (() => {
                const d = parseBackendDate(detail.ngayTao);
                return d ? d.toLocaleString("vi-VN") : "";
            })(), "", "Số điện thoại", detail.sdt],
            ["Trạng thái", detail.trangThai, "", "Địa chỉ giao hàng", detail.diaChiGiaoHang],
            ["Phương thức thanh toán", detail.phuongThucThanhToan, "", "ID người dùng", detail.userId],
            ["Tạm tính", detail.tamTinh?.toLocaleString() + "₫", "", "", ""],
            ["Giảm giá", detail.soTienGiam?.toLocaleString() + "₫", "", "", ""],
            ["Tổng tiền", detail.tongTien?.toLocaleString() + "₫", "", "", ""],
            [],
            ["STT", "Mã sản phẩm", "Tên sản phẩm", "Số lượng", "Đơn giá", "Thành tiền"],
            ...chiTietSanPham.map((sp, idx) => [
                idx + 1,
                sp.masp ?? "",
                sp.tensp ?? "",
                sp.soLuong ?? "",
                sp.gia !== undefined && sp.gia !== null ? Number(sp.gia).toLocaleString() + "₫" : "",
                sp.tongTien !== undefined && sp.tongTien !== null ? Number(sp.tongTien).toLocaleString() + "₫" : "",
            ]),
            [],
            ["", "", "", "", "Tạm tính", detail.tamTinh?.toLocaleString() + "₫"],
            ["", "", "", "", "Giảm giá", detail.soTienGiam?.toLocaleString() + "₫"],
            ["", "", "", "", "Tổng cộng", detail.tongTien?.toLocaleString() + "₫"],
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ChiTietHoaDon");
        XLSX.writeFile(wb, `ChiTietHoaDon_${detail.id}.xlsx`);
    };

    const exportDocx = async () => {
        const infoRows = [
            new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph("Mã hóa đơn")], }),
                    new DocxTableCell({ children: [new Paragraph(detail.id?.toString() ?? "")], }),
                    new DocxTableCell({ children: [new Paragraph("Tên khách hàng")], }),
                    new DocxTableCell({ children: [new Paragraph(detail.ten ?? "")], }),
                ]
            }),
            new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph("Ngày tạo")], }),
                    new DocxTableCell({
                        children: [new Paragraph(
                            (() => {
                                const d = parseBackendDate(detail.ngayTao);
                                return d ? d.toLocaleString("vi-VN") : "";
                            })()
                        )],
                    }),
                    new DocxTableCell({ children: [new Paragraph("Số điện thoại")], }),
                    new DocxTableCell({ children: [new Paragraph(detail.sdt ?? "")], }),
                ]
            }),
            new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph("Trạng thái")], }),
                    new DocxTableCell({ children: [new Paragraph(detail.trangThai ?? "")], }),
                    new DocxTableCell({ children: [new Paragraph("Địa chỉ giao hàng")], }),
                    new DocxTableCell({ children: [new Paragraph(detail.diaChiGiaoHang ?? "")], }),
                ]
            }),
            new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph("Phương thức thanh toán")], }),
                    new DocxTableCell({ children: [new Paragraph(detail.phuongThucThanhToan ?? "")], }),
                    new DocxTableCell({ children: [new Paragraph("ID người dùng")], }),
                    new DocxTableCell({ children: [new Paragraph(detail.userId?.toString() ?? "")], }),
                ]
            }),
            new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph("Tạm tính")], }),
                    new DocxTableCell({ children: [new Paragraph(detail.tamTinh?.toLocaleString() + "₫")], }),
                    new DocxTableCell({ children: [new Paragraph("Giảm giá")], }),
                    new DocxTableCell({ children: [new Paragraph(detail.soTienGiam?.toLocaleString() + "₫")], }),
                ]
            }),
            new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph("Tổng tiền")], }),
                    new DocxTableCell({ children: [new Paragraph(detail.tongTien?.toLocaleString() + "₫")], }),
                    new DocxTableCell({ children: [new Paragraph("")], }),
                    new DocxTableCell({ children: [new Paragraph("")], }),
                ]
            }),
        ];

        const productRows = [
            new DocxTableRow({
                children: [
                    "STT", "Mã sản phẩm", "Tên sản phẩm", "Số lượng", "Đơn giá", "Thành tiền"
                ].map(text => new DocxTableCell({ children: [new Paragraph(text)] }))
            }),
            ...chiTietSanPham.map((sp, idx) =>
                new DocxTableRow({
                    children: [
                        idx + 1 + "",
                        sp.masp ?? "",
                        sp.tensp ?? "",
                        sp.soLuong?.toString() ?? "",
                        sp.gia !== undefined && sp.gia !== null ? Number(sp.gia).toLocaleString() + "₫" : "",
                        sp.tongTien !== undefined && sp.tongTien !== null ? Number(sp.tongTien).toLocaleString() + "₫" : "",
                    ].map(text => new DocxTableCell({ children: [new Paragraph(text)] }))
                })
            ),
            new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph("")], columnSpan: 5 }),
                    new DocxTableCell({ children: [new Paragraph(`Tạm tính: ${detail.tamTinh?.toLocaleString() ?? ""}₫`)] }),
                ]
            }),
            new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph("")], columnSpan: 5 }),
                    new DocxTableCell({ children: [new Paragraph(`Giảm giá: ${detail.soTienGiam?.toLocaleString() ?? ""}₫`)] }),
                ]
            }),
            new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph("")], columnSpan: 5 }),
                    new DocxTableCell({ children: [new Paragraph(`Tổng cộng: ${detail.tongTien?.toLocaleString() ?? ""}₫`)] }),
                ]
            }),
        ];

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            text: `Chi tiết hóa đơn #${detail.id}`,
                            heading: "Heading1",
                        }),
                        new Paragraph(" "),
                        new DocxTable({ rows: infoRows }),
                        new Paragraph(" "),
                        new Paragraph("Chi tiết sản phẩm:"),
                        new DocxTable({ rows: productRows }),
                    ],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `ChiTietHoaDon_${detail.id}.docx`);
    };

    const fetchData = async () => {
        setIsLoading(true);
        setIsError(false);
        try {
            // Chuyển "all" thành ""
            const filtersToSend = {
                ...filters,
                trangThai: filters.trangThai === "all" ? "" : filters.trangThai,
                phuongThuc: filters.phuongThuc === "all" ? "" : filters.phuongThuc,
            };
            const params = new URLSearchParams({
                page: page.toString(),
                size: PAGE_SIZE.toString(),
                ...Object.fromEntries(Object.entries(filtersToSend).filter(([_, v]) => v)),
            });
            const res = await fetch(`http://localhost:8080/api/lego-store/hoa-don/search?${params.toString()}`);
            if (!res.ok) throw new Error("Lỗi khi tải dữ liệu");
            const json = await res.json();
            setData(json);
        } catch (e: any) {
            setIsError(true);
            setError(e);
        }
        setIsLoading(false);
    };

    React.useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [page]); // chỉ fetch khi đổi trang, KHÔNG fetch khi đổi filters

    if (isLoading || isLoadingPaging) return <div className="p-4">Đang tải...</div>;
    if (isError || isErrorPaging) return <div className="p-4 text-red-500">Lỗi: {error?.message}</div>;

    return (
        <div>
            {/* Bộ lọc nâng cao */}
            <div className="flex flex-col ">
                <Button
                    variant="outline"
                    onClick={() => setShowFilter(f => !f)}
                    className="mb-4"
                >
                    {showFilter ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
                </Button>
                {showFilter && (
                    <form
                        className="w-full bg-[#181e29] rounded-xl shadow-lg p-6 mb-8"
                        onSubmit={e => {
                            e.preventDefault();
                            setPage(0);
                            fetchData();
                        }}
                    >
                        <div className="mb-2 text-blue-400 font-semibold text-sm">Bộ lọc tìm kiếm nâng cao</div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-200 mb-1">Mã hóa đơn</label>
                                <Input
                                    className="w-full bg-[#232b3b] text-white border border-[#2d3748] placeholder-gray-400 focus:border-blue-500"
                                    placeholder="Nhập mã hóa đơn..."
                                    value={filters.ma}
                                    onChange={e => setFilters(f => ({ ...f, ma: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-200 mb-1">Trạng thái đơn hàng</label>
                                <Select
                                    value={filters.trangThai}
                                    onValueChange={value => setFilters(f => ({ ...f, trangThai: value }))}
                                >
                                    <SelectContent className="bg-[#232b3b] text-white">
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                                        <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                                        <SelectItem value="SHIPPING">Đang giao</SelectItem>
                                        <SelectItem value="DELIVERED">Đã giao</SelectItem>
                                        <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-200 mb-1">Phương thức thanh toán</label>
                                <Select
                                    value={filters.phuongThuc || "all"}
                                    onValueChange={value => setFilters(f => ({ ...f, phuongThuc: value === "all" ? "" : value }))}
                                >
                                    <SelectContent className="bg-[#232b3b] text-white">
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value="COD">COD</SelectItem>
                                        <SelectItem value="BANKING">Chuyển khoản</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-200 mb-1">Tên người dùng</label>
                                <Input
                                    className="w-full bg-[#232b3b] text-white border border-[#2d3748] placeholder-gray-400 focus:border-blue-500"
                                    placeholder="Nhập tên người dùng..."
                                    value={filters.tenNguoiDung}
                                    onChange={e => setFilters(f => ({ ...f, tenNguoiDung: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-medium text-gray-200 mb-1">Số điện thoại</label>
                                <Input
                                    className="w-full bg-[#232b3b] text-white border border-[#2d3748] placeholder-gray-400 focus:border-blue-500"
                                    placeholder="Nhập số điện thoại..."
                                    value={filters.sdt}
                                    onChange={e => setFilters(f => ({ ...f, sdt: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-200 mb-1">Từ ngày</label>
                                <Input
                                    type="datetime-local"
                                    className="w-full bg-[#232b3b] text-white border border-[#2d3748] focus:border-blue-500"
                                    value={filters.from}
                                    onChange={e => setFilters(f => ({ ...f, from: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-200 mb-1">Đến ngày</label>
                                <Input
                                    type="datetime-local"
                                    className="w-full bg-[#232b3b] text-white border border-[#2d3748] focus:border-blue-500"
                                    value={filters.to}
                                    onChange={e => setFilters(f => ({ ...f, to: e.target.value }))}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-11 h-11 flex items-center justify-center"
                                    aria-label="Tìm kiếm"
                                >
                                    <Search className="w-6 h-6" />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="bg-[#232b3b] text-white border border-[#2d3748] hover:bg-[#2d3748] rounded-lg w-11 h-11 flex items-center justify-center"
                                    aria-label="Reset bộ lọc"
                                    onClick={() => {
                                        setFilters({
                                            ma: "",
                                            trangThai: "",
                                            phuongThuc: "",
                                            tenNguoiDung: "",
                                            sdt: "",
                                            from: "",
                                            to: "",
                                        });
                                        setPage(0);
                                        fetchData();
                                    }}
                                >
                                    <RotateCcw className="w-6 h-6" />
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
            <h5 className="text-2xl font-bold mb-6 text-white">Trang hiển thị danh sách hóa đơn</h5>
            <div className="rounded-lg shadow overflow-x-auto bg-[#181e29]">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#232b3b]">
                            <TableHead className="text-white">ID</TableHead>
                            <TableHead className="text-white">Tên người nhận</TableHead>
                            <TableHead className="text-white">Số điện thoại</TableHead>
                            <TableHead className="text-white">Tổng tiền</TableHead>
                            <TableHead className="text-white">Ngày tạo</TableHead>
                            <TableHead className="text-white">Trạng thái</TableHead>
                            <TableHead className="text-white">Phương thức thanh toán</TableHead>
                            <TableHead className="text-white">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.content.map((hd: HoaDonDTO) => (
                            <TableRow key={hd.id} className="hover:bg-[#232b3b]/70 transition">
                                <TableCell className="font-semibold">{hd.id}</TableCell>
                                <TableCell>{hd.ten}</TableCell>
                                <TableCell>{hd.sdt}</TableCell>
                                <TableCell className="font-semibold text-green-400">{hd.tongTien.toLocaleString()}₫</TableCell>
                                <TableCell>
                                    {hd.ngayTao
                                        ? (() => {
                                            const d = parseBackendDate(hd.ngayTao);
                                            return d ? d.toLocaleString("vi-VN") : "";
                                        })()
                                        : ""}
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(hd.trangThai)}`}>
                                        {hd.trangThai}
                                    </span>
                                </TableCell>
                                <TableCell>{hd.phuongThucThanhToan}</TableCell>
                                <TableCell>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleViewDetail(hd.id)}
                                        className="hover:bg-blue-100"
                                        aria-label="Xem chi tiết"
                                    >
                                        <Eye className="w-5 h-5 text-blue-600" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center gap-4 mt-6">
                <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                >
                    Trang trước
                </Button>
                <span className="text-white">
                    Trang <b>{page + 1}</b> / {data?.totalPages ?? 1}
                </span>
                <Button
                    variant="outline"
                    onClick={() => setPage((p) => (data && p < data.totalPages - 1 ? p + 1 : p))}
                    disabled={!data || page >= (data.totalPages - 1)}
                >
                    Trang sau
                </Button>
            </div>
            {/* Modal chi tiết hóa đơn */}
            {open && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-10 w-[1100px] max-h-[95vh] overflow-y-auto relative text-black border-2 border-blue-200">
                        <button
                            className="absolute top-4 right-6 text-2xl text-gray-400 hover:text-red-500 transition"
                            onClick={() => setOpen(false)}
                            aria-label="Đóng"
                        >
                            ×
                        </button>
                        {loadingDetail ? (
                            <div className="text-center text-lg py-10">Đang tải chi tiết...</div>
                        ) : detail ? (
                            <div>
                                <h3 className="text-2xl font-extrabold mb-6 text-blue-700 text-center tracking-wide">
                                    Chi tiết hóa đơn #{detail.id}
                                </h3>
                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-2">
                                        <div><b>Mã hóa đơn:</b> <span className="font-semibold">{detail.id}</span></div>
                                        <div>
                                            <b>Ngày tạo:</b>{" "}
                                            <span>
                                                {detail.ngayTao
                                                    ? (() => {
                                                        const d = parseBackendDate(detail.ngayTao);
                                                        return d ? d.toLocaleString("vi-VN") : "";
                                                    })()
                                                    : ""}
                                            </span>
                                        </div>
                                        <div><b>Trạng thái:</b> <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(detail.trangThai)}`}>{detail.trangThai}</span></div>
                                        <div><b>Phương thức thanh toán:</b> {detail.phuongThucThanhToan}</div>
                                        <div><b>Tạm tính:</b> <span className="text-blue-700">{detail.tamTinh?.toLocaleString()}₫</span></div>
                                        <div><b>Giảm giá:</b> <span className="text-yellow-700">{detail.soTienGiam?.toLocaleString()}₫</span></div>
                                        <div><b>Tổng tiền:</b> <span className="text-green-700 font-bold">{detail.tongTien?.toLocaleString()}₫</span></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div><b>Tên khách hàng:</b> {detail.ten}</div>
                                        <div><b>Số điện thoại:</b> {detail.sdt}</div>
                                        <div><b>Địa chỉ giao hàng:</b> {detail.diaChiGiaoHang}</div>
                                        <div><b>ID người dùng:</b> {detail.userId}</div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-6 mb-6">
                                    <Button
                                        onClick={exportExcel}
                                        className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold px-6 py-2 rounded-lg shadow hover:from-green-500 hover:to-blue-600 transition"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 16v2a2 2 0 002 2H6a2 2 0 01-2-2v-2m12-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Xuất Excel
                                    </Button>
                                    <Button
                                        onClick={exportDocx}
                                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-semibold px-6 py-2 rounded-lg shadow hover:from-indigo-500 hover:to-purple-600 transition"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Xuất Docx
                                    </Button>
                                </div>
                                <div>
                                    <b className="block mb-2 text-lg text-blue-700">Chi tiết sản phẩm:</b>
                                    <table className="w-full border mt-2 text-base rounded-lg overflow-hidden shadow">
                                        <thead>
                                            <tr className="bg-blue-100 text-blue-900">
                                                <th className="border px-3 py-2">STT</th>
                                                <th className="border px-3 py-2">Mã sản phẩm</th>
                                                <th className="border px-3 py-2">Tên sản phẩm</th>
                                                <th className="border px-3 py-2">Số lượng</th>
                                                <th className="border px-3 py-2">Đơn giá</th>
                                                <th className="border px-3 py-2">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chiTietSanPham.map((sp, idx) => (
                                                <tr key={sp.masp ?? sp.idSanPham ?? idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                    <td className="border px-3 py-2 text-center">{idx + 1}</td>
                                                    <td className="border px-3 py-2">{sp.masp ?? ""}</td>
                                                    <td className="border px-3 py-2">{sp.tensp ?? ""}</td>
                                                    <td className="border px-3 py-2 text-center">{sp.soLuong ?? ""}</td>
                                                    <td className="border px-3 py-2 text-right">
                                                        {sp.gia !== undefined && sp.gia !== null
                                                            ? Number(sp.gia).toLocaleString() + "₫"
                                                            : ""}
                                                    </td>
                                                    <td className="border px-3 py-2 text-right">
                                                        {sp.tongTien !== undefined && sp.tongTien !== null
                                                            ? Number(sp.tongTien).toLocaleString() + "₫"
                                                            : ""}
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* Dòng tổng kết */}
                                            <tr className="bg-blue-50 font-semibold">
                                                <td colSpan={5} className="border px-3 py-2 text-right">Tạm tính:</td>
                                                <td className="border px-3 py-2 text-right">{detail.tamTinh?.toLocaleString()}₫</td>
                                            </tr>
                                            <tr className="bg-yellow-50 font-semibold">
                                                <td colSpan={5} className="border px-3 py-2 text-right">Giảm giá:</td>
                                                <td className="border px-3 py-2 text-right">{detail.soTienGiam?.toLocaleString()}₫</td>
                                            </tr>
                                            <tr className="bg-green-50 font-bold">
                                                <td colSpan={5} className="border px-3 py-2 text-right">Tổng cộng:</td>
                                                <td className="border px-3 py-2 text-right">{detail.tongTien?.toLocaleString()}₫</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="text-red-500 text-center text-lg py-10">Không tìm thấy chi tiết hóa đơn.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HoaDonManagement;

function saveAs(blob: Blob, arg1: string) {
    throw new Error("Function not implemented.");
}

