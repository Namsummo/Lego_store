"use client";

import React, { useState } from "react";
import { HoaDonService } from "@/services/hoaDonService";
import { HoaDonDTO, TrangThaiHoaDon } from "@/components/types/hoaDon-types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell } from "docx";
import { Eye } from "lucide-react";
import HoaDonDetail from "./hoaDondetail";
import HoaDonFilter from "./hoaDonFilter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAGE_SIZE = 10;
const getStatusColor = (status: string) => {
    switch (status) {
        case TrangThaiHoaDon.PENDING:
            return "bg-yellow-100 text-yellow-800";
        case TrangThaiHoaDon.PROCESSING:
            return "bg-blue-100 text-blue-800";
        case TrangThaiHoaDon.SHIPPED:
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

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Đang xử lý" },
    { value: "PROCESSING", label: "Đang chuẩn bị" },
    { value: "SHIPPED", label: "Đang giao hàng" },
    { value: "DELIVERED", label: "Đã giao hàng" },
    { value: "CANCELLED", label: "Đã hủy" },
];

function isValidTrangThaiTransition(current: string, next: string): boolean {
    switch (current) {
        case "PENDING":
            return next === "PROCESSING" || next === "CANCELLED";
        case "PROCESSING":
            return next === "SHIPPED";
        case "SHIPPED":
            return next === "DELIVERED";
        case "DELIVERED":
        case "CANCELLED":
            return false;
        default:
            return false;
    }
}

const HoaDonManagement: React.FC = () => {
    const [page, setPage] = useState(0);
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [detail, setDetail] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [chiTietSanPham, setChiTietSanPham] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        keyword: "",
        trangThai: "all",
        phuongThuc: "all",
        from: "",
        to: "",
    });

    const handleViewDetail = async (id: number) => {
        setLoadingDetail(true);
        setOpen(true);
        try {
            const data = await HoaDonService.getHoaDonById(id);
            setDetail(data);
            const chiTiet = await HoaDonService.getChiTietSanPhamByHoaDonId(id);
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

    // Lấy tất cả hóa đơn và lọc phía frontend
    const fetchData = async () => {
        setIsLoading(false);
        setIsError(false);
        try {
            // Lấy tất cả hóa đơn (không phân trang backend)
            const allPaged = await HoaDonService.getPagedHoaDons(0, 1000); // lấy nhiều bản ghi, tuỳ backend
            let filtered = allPaged.content;

            // Lọc phía frontend
            if (filters.keyword) {
                const kw = filters.keyword.toLowerCase();
                filtered = filtered.filter((hd: any) =>
                    (hd.id + "").includes(kw) ||
                    (hd.ten && hd.ten.toLowerCase().includes(kw)) ||
                    (hd.sdt && hd.sdt.includes(kw))
                );
            }
            if (filters.trangThai && filters.trangThai !== "all") {
                filtered = filtered.filter((hd: any) => hd.trangThai === filters.trangThai);
            }
            if (filters.phuongThuc && filters.phuongThuc !== "all") {
                filtered = filtered.filter((hd: any) => hd.phuongThucThanhToan === filters.phuongThuc);
            }
            if (filters.from) {
                const fromDate = new Date(filters.from);
                filtered = filtered.filter((hd: any) => {
                    const d = parseBackendDate(hd.ngayTao);
                    return d && d >= fromDate;
                });
            }
            if (filters.to) {
                const toDate = new Date(filters.to);
                filtered = filtered.filter((hd: any) => {
                    const d = parseBackendDate(hd.ngayTao);
                    return d && d <= toDate;
                });
            }

            // Phân trang phía frontend
            const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
            const content = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

            setData({
                content,
                totalPages,
            });
        } catch (e: any) {
            setIsError(true);
            setError(e);
        }
        setIsLoading(false);
    };

    React.useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [page, filters]); // fetch lại khi đổi trang hoặc đổi filter

    if (isLoading) return <div className="p-4">Đang tải...</div>;
    if (isError) return <div className="p-4 text-red-500">Lỗi: {error?.message}</div>;

    return (
        <div>
            <HoaDonFilter
                filters={filters}
                setFilters={setFilters}
                fetchData={fetchData}
                setPage={setPage}
            />
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
                                    <Select
                                        value={hd.trangThai}
                                        onValueChange={async (value) => {
                                            if (!isValidTrangThaiTransition(hd.trangThai, value)) return;
                                            try {
                                                await HoaDonService.updateTrangThai(hd.id, value);
                                                fetchData(); // reload lại danh sách
                                            } catch (e) {
                                                alert("Cập nhật trạng thái thất bại!");
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-32 bg-white/10 border border-blue-400 text-black rounded-lg text-xs font-semibold">
                                            <SelectValue>
                                                {hd.trangThai}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map((st) => (
                                                <SelectItem
                                                    key={st.value}
                                                    value={st.value}
                                                    disabled={
                                                        st.value === hd.trangThai ||
                                                        !isValidTrangThaiTransition(hd.trangThai, st.value)
                                                    }
                                                    className={
                                                        st.value === hd.trangThai ||
                                                            !isValidTrangThaiTransition(hd.trangThai, st.value)
                                                            ? "opacity-50 pointer-events-none"
                                                            : ""
                                                    }
                                                >
                                                    {st.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
            <HoaDonDetail
                open={open}
                onClose={() => setOpen(false)}
                detail={detail}
                loadingDetail={loadingDetail}
                chiTietSanPham={chiTietSanPham}
                exportExcel={exportExcel}
                exportDocx={exportDocx}
            />
        </div>
    );
};

export default HoaDonManagement;

function saveAs(blob: Blob, arg1: string) {
    throw new Error("Function not implemented.");
}