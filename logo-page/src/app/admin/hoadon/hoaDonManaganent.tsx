"use client";

import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { saveAs } from "file-saver";

const PAGE_SIZE = 10;

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
        default:
            return false;
    }
}

function parseBackendDate(date: number[] | Date | string | number | undefined): Date | null {
    if (!date) return null;
    if (Array.isArray(date) && date.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = date;
        return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1e6));
    }
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
}

const HoaDonManagement = () => {
    const [page, setPage] = useState(0);
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [detail, setDetail] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [chiTietSanPham, setChiTietSanPham] = useState<any[]>([]);
    const [filters, setFilters] = useState({ keyword: "", trangThai: "all", phuongThuc: "all", from: "", to: "" });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const allPaged = await HoaDonService.getPagedHoaDons(0, 1000);
            let filtered = allPaged.content;
            const kw = filters.keyword.toLowerCase();
            if (kw) {
                filtered = filtered.filter((hd: any) => (hd.id + "").includes(kw) || (hd.ten && hd.ten.toLowerCase().includes(kw)) || (hd.sdt && hd.sdt.includes(kw)));
            }
            if (filters.trangThai !== "all") {
                filtered = filtered.filter((hd: any) => hd.trangThai === filters.trangThai);
            }
            if (filters.phuongThuc !== "all") {
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
            const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
            const content = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
            setData({ content, totalPages });
        } catch (e: any) {
            setIsError(true);
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filters]);

    const handleViewDetail = async (id: number) => {
        setOpen(true);
        setLoadingDetail(true);
        try {
            const detail = await HoaDonService.getHoaDonById(id);
            const chiTiet = await HoaDonService.getChiTietSanPhamByHoaDonId(id);
            setDetail(detail);
            setChiTietSanPham(chiTiet);
        } catch (e) {
            toast.error("Lỗi khi tải chi tiết hoá đơn");
            setDetail(null);
            setChiTietSanPham([]);
        } finally {
            setLoadingDetail(false);
        }
    };

    const exportExcel = () => {
        if (!detail) return;

        const wsData = [
            [`Chi tiết hóa đơn #${detail.id}`],
            [],
            ["Mã hóa đơn", detail.id, "", "Tên khách hàng", detail.ten],
            ["Ngày tạo", parseBackendDate(detail.ngayTao)?.toLocaleString("vi-VN") || "", "", "SĐT", detail.sdt],
            ["Trạng thái", detail.trangThai, "", "Địa chỉ", detail.diaChiGiaoHang],
            ["Phương thức", detail.phuongThucThanhToan, "", "User ID", detail.userId],
            ["Tạm tính", detail.tamTinh?.toLocaleString() + "₫"],
            ["Giảm giá", detail.soTienGiam?.toLocaleString() + "₫"],
            ["Tổng tiền", detail.tongTien?.toLocaleString() + "₫"],
            [],
            ["STT", "Mã SP", "Tên SP", "SL", "Đơn giá", "Thành tiền"],
            ...chiTietSanPham.map((sp, idx) => [
                idx + 1,
                sp.masp,
                sp.tensp,
                sp.soLuong,
                Number(sp.gia).toLocaleString() + "₫",
                Number(sp.tongTien).toLocaleString() + "₫"
            ]),
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "HoaDonChiTiet");
        XLSX.writeFile(wb, `ChiTietHoaDon_${detail.id}.xlsx`);
    };

    const exportDocx = async () => {
        if (!detail) return;

        const infoRows = [
            new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph("Mã hóa đơn")] }),
                    new DocxTableCell({ children: [new Paragraph(detail.id?.toString())] }),
                    new DocxTableCell({ children: [new Paragraph("Tên khách hàng")] }),
                    new DocxTableCell({ children: [new Paragraph(detail.ten || "")] }),
                ],
            }),
            new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph("Ngày tạo")] }),
                    new DocxTableCell({ children: [new Paragraph(parseBackendDate(detail.ngayTao)?.toLocaleString("vi-VN") || "")] }),
                    new DocxTableCell({ children: [new Paragraph("SĐT")] }),
                    new DocxTableCell({ children: [new Paragraph(detail.sdt || "")] }),
                ],
            }),
            new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph("Trạng thái")] }),
                    new DocxTableCell({ children: [new Paragraph(detail.trangThai)] }),
                    new DocxTableCell({ children: [new Paragraph("Địa chỉ")] }),
                    new DocxTableCell({ children: [new Paragraph(detail.diaChiGiaoHang || "")] }),
                ],
            }),
            new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph("Phương thức")] }),
                    new DocxTableCell({ children: [new Paragraph(detail.phuongThucThanhToan || "")] }),
                    new DocxTableCell({ children: [new Paragraph("User ID")] }),
                    new DocxTableCell({ children: [new Paragraph(detail.userId?.toString() || "")] }),
                ],
            }),
        ];

        const productRows = [
            new DocxTableRow({
                children: ["STT", "Mã SP", "Tên SP", "SL", "Đơn giá", "Thành tiền"].map(
                    (text) => new DocxTableCell({ children: [new Paragraph(text)] })
                ),
            }),
            ...chiTietSanPham.map((sp, idx) =>
                new DocxTableRow({
                    children: [
                        idx + 1 + "",
                        sp.masp,
                        sp.tensp,
                        sp.soLuong?.toString(),
                        Number(sp.gia).toLocaleString() + "₫",
                        Number(sp.tongTien).toLocaleString() + "₫",
                    ].map((text) => new DocxTableCell({ children: [new Paragraph(text)] })),
                })
            ),
        ];

        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({
                            text: `Chi tiết hóa đơn #${detail.id}`,
                            heading: "Heading1",
                        }),
                        new DocxTable({ rows: infoRows }),
                        new Paragraph("Chi tiết sản phẩm:"),
                        new DocxTable({ rows: productRows }),
                    ],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `ChiTietHoaDon_${detail.id}.docx`);
    };

    return (
        <div className="space-y-6">
            <HoaDonFilter filters={filters} setFilters={setFilters} fetchData={fetchData} setPage={setPage} />
            <div className="rounded-xl shadow bg-[#181e29] overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#232b3b]">
                            {['ID', 'Tên', 'SĐT', 'Tổng tiền', 'Ngày tạo', 'Trạng thái', 'Thanh toán', '']
                                .map((header, i) => (
                                    <TableHead key={i} className="text-white whitespace-nowrap">{header}</TableHead>
                                ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.content.map((hd: HoaDonDTO) => (
                            <TableRow key={hd.id} className="hover:bg-muted/30">
                                <TableCell className="font-semibold">{hd.id}</TableCell>
                                <TableCell>{hd.ten}</TableCell>
                                <TableCell>{hd.sdt}</TableCell>
                                <TableCell className="text-green-400 font-semibold">{hd.tongTien.toLocaleString()}₫</TableCell>
                                <TableCell>{parseBackendDate(hd.ngayTao)?.toLocaleString("vi-VN")}</TableCell>
                                <TableCell>
                                    <Select
                                        value={hd.trangThai}
                                        onValueChange={async (value) => {
                                            if (!isValidTrangThaiTransition(hd.trangThai, value)) return;
                                            try {
                                                await HoaDonService.updateTrangThai(hd.id, value);
                                                fetchData();
                                            } catch {
                                                toast.error("Cập nhật trạng thái thất bại!");
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-[110px] border border-blue-400 rounded text-xs bg-white/10">
                                            <SelectValue placeholder="Trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map((opt) => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                    disabled={!isValidTrangThaiTransition(hd.trangThai, opt.value) || opt.value === hd.trangThai}
                                                    className="text-xs"
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>{hd.phuongThucThanhToan}</TableCell>
                                <TableCell>
                                    <Button size="icon" variant="ghost" onClick={() => handleViewDetail(hd.id)}>
                                        <Eye className="w-5 h-5 text-blue-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Trang trước</Button>
                <span className="text-white">Trang <b>{page + 1}</b> / {data?.totalPages ?? 1}</span>
                <Button variant="outline" onClick={() => setPage(p => (data && p < data.totalPages - 1 ? p + 1 : p))} disabled={!data || page >= (data.totalPages - 1)}>Trang sau</Button>
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
