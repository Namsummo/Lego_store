import {
    TrangThaiPhieuHoan,
    TrangThaiThanhToan,
    PhieuHoanHang,
} from "@/components/types/hoanHang-types";
import { useState, useEffect } from "react";
import { FaClipboardList, FaCheckCircle, FaTimesCircle, FaMoneyCheckAlt } from "react-icons/fa";
import { MdOutlinePendingActions } from "react-icons/md";
import { IoMdRefresh } from "react-icons/io";
import { toast } from "sonner";
import {
    useCapNhatThanhToanPhieuHoanHang,
    useDuyetPhieuHoanHang,
    usePhieuHoanByTrangThai,
    useTuChoiPhieuHoanHang,
} from "@/hooks/useHoanHang";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

import { useSanPham } from "@/hooks/useSanPham";

// Function kiểm tra quyền admin


const APPROVE_STATUS_LABELS = {
    CHO_DUYET: "Chờ duyệt",
    DA_DUYET: "Đã duyệt",
    TU_CHOI: "Từ chối",
};

const APPROVE_STATUS_COLOR = {
    CHO_DUYET: "bg-yellow-100 text-yellow-800 border-yellow-300",
    DA_DUYET: "bg-green-100 text-green-800 border-green-300",
    TU_CHOI: "bg-red-100 text-red-800 border-red-300",
};

const REFUND_STATUS_LABELS = {
    CHUA_HOAN: "Chưa hoàn",
    DANG_HOAN: "Đang hoàn",
    DA_HOAN: "Hoàn xong",
};

const REFUND_STATUS_COLOR = {
    CHUA_HOAN: "bg-gray-100 text-gray-800 border-gray-300",
    DANG_HOAN: "bg-yellow-100 text-yellow-800 border-yellow-300",
    DA_HOAN: "bg-indigo-100 text-indigo-800 border-indigo-300",
};

const TRANG_THAI_OPTIONS = [
    { value: TrangThaiPhieuHoan.CHO_DUYET, label: "Chờ duyệt", icon: <MdOutlinePendingActions className="text-yellow-500" /> },
    { value: TrangThaiPhieuHoan.DA_DUYET, label: "Đã duyệt", icon: <FaCheckCircle className="text-green-500" /> },
    { value: TrangThaiPhieuHoan.TU_CHOI, label: "Từ chối", icon: <FaTimesCircle className="text-red-500" /> },
];

function formatMoney(value: number) {
    if (!value) return "0đ";
    return value.toLocaleString("vi-VN") + "đ";
}

// Component: StatCard
interface StatCardProps {
    color: string;
    icon: React.ReactNode;
    label: string;
    value: number | string;
}

function StatCard({ color, icon, label, value }: StatCardProps) {
    return (
        <div
            className={`flex-1 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center relative ${color} text-white border border-gray-200/30 transform hover:scale-105 transition-transform duration-200`}
        >
            <div className="text-3xl mb-3">{icon}</div>
            <div className="font-semibold text-lg">{label}</div>
            <div className="text-3xl font-bold mt-2">{value}</div>
        </div>
    );
}

// Component: FilterHeader
interface FilterHeaderProps {
    search: string;
    setSearch: (value: string) => void;
    filterRefund: TrangThaiThanhToan | "ALL";
    setFilterRefund: (value: TrangThaiThanhToan | "ALL") => void;
    handleRefresh: () => void;
}

function FilterHeader({ search, setSearch, filterRefund, setFilterRefund, handleRefresh }: FilterHeaderProps) {
    return (
        <header className="flex flex-col md:flex-row justify-between items-center px-6 py-4 gap-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-xl">
            <div className="flex items-center gap-3">
                <FaClipboardList className="text-white text-2xl" />
                <h1 className="font-bold text-white text-2xl">Danh Sách Phiếu Hoàn Hàng</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <Input
                    className="px-4 py-2 rounded-lg bg-white/10 text-white border border-blue-300 focus:border-blue-400 outline-none transition w-64 placeholder:text-gray-300"
                    placeholder="Tìm kiếm mã phiếu, khách hàng, sản phẩm..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Tìm kiếm phiếu hoàn hàng"
                />
                <Select
                    value={filterRefund}
                    onValueChange={(v) => setFilterRefund(v as TrangThaiThanhToan | "ALL")}
                >
                    <SelectTrigger className="w-48 bg-white/10 text-white border border-blue-300 focus:border-blue-400">
                        <SelectValue placeholder="Trạng thái hoàn tiền" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-gray-900">
                        <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                        <SelectItem value={TrangThaiThanhToan.CHUA_HOAN}>Chưa hoàn</SelectItem>
                        <SelectItem value={TrangThaiThanhToan.DANG_HOAN}>Đang hoàn</SelectItem>
                        <SelectItem value={TrangThaiThanhToan.DA_HOAN}>Đã hoàn tiền</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="default"
                    className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 rounded-lg border border-blue-400 shadow-md hover:shadow-lg transition"
                    onClick={handleRefresh}
                    aria-label="Làm mới bộ lọc"
                >
                    <IoMdRefresh className="text-lg" /> Làm mới
                </Button>
            </div>
        </header>
    );
}

// Component: OrderTable
interface OrderTableProps {
    data: PhieuHoanHang[];
    isLoading: boolean;
    handleApprove: (id: number) => void;
    handleReject: (id: number) => void;
    handleRefund: (id: number) => void;
    duyetMutation: { isPending: boolean };
    tuChoiMutation: { isPending: boolean };
    capNhatThanhToanMutation: { isPending: boolean };
}

function OrderTable({
    data,
    isLoading,
    handleApprove,
    handleReject,
    handleRefund,
    duyetMutation,
    tuChoiMutation,
    capNhatThanhToanMutation,
}: OrderTableProps) {
    // Lấy toàn bộ danh sách sản phẩm
    const { data: allProducts } = useSanPham();

    return (
        <div className="overflow-x-auto rounded-b-xl">
            <Table className="min-w-full text-sm bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-200/30">
                <TableHeader>
                    <TableRow className="bg-blue-600 text-white uppercase border-b border-blue-500">
                        <TableHead className="px-4 py-3 font-semibold">Mã Phiếu</TableHead>
                        <TableHead className="px-4 py-3 font-semibold">Loại hoàn</TableHead>
                        <TableHead className="px-4 py-3 font-semibold">Khách hàng</TableHead>
                        <TableHead className="px-4 py-3 font-semibold">Lý do</TableHead>
                        <TableHead className="px-4 py-3 font-semibold">Phương thức</TableHead>
                        <TableHead className="px-4 py-3 font-semibold">Ngân hàng</TableHead>
                        <TableHead className="px-4 py-3 font-semibold">TK nhận</TableHead>
                        <TableHead className="px-4 py-3 font-semibold">Tên TK</TableHead>
                        <TableHead className="px-4 py-3 font-semibold">Sản phẩm hoàn</TableHead>
                        <TableHead className="px-4 py-3 font-semibold">Số lượng</TableHead>
                        <TableHead className="px-4 py-3 font-semibold">Tổng tiền</TableHead>
                        <TableHead className="px-4 py-3 font-semibold">Duyệt</TableHead>
                        <TableHead className="px-4 py-3 font-semibold">Hoàn Tiền</TableHead>
                        <TableHead className="px-4 py-3 font-semibold">Thao Tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, idx) => (
                            <TableRow key={idx}>
                                <TableCell colSpan={14}>
                                    <Skeleton className="h-10 w-full bg-gray-700/50" />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={14} className="text-center py-8 text-gray-300">
                                Không có phiếu hoàn hàng nào.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((order) => (
                            <TableRow key={order.id} className="text-gray-200 hover:bg-gray-700/50 transition">
                                <TableCell className="px-4 py-3 font-bold">{order.id}</TableCell>
                                <TableCell className="px-4 py-3">{order.loaiHoan}</TableCell>
                                <TableCell className="px-4 py-3">{order.chuTaiKhoan ?? order.hoaDon?.ten ?? "--"}</TableCell>
                                <TableCell className="px-4 py-3 text-yellow-300">{order.lyDo}</TableCell>
                                <TableCell className="px-4 py-3">{order.phuongThucHoan}</TableCell>
                                <TableCell className="px-4 py-3">{order.tenNganHang}</TableCell>
                                <TableCell className="px-4 py-3">{order.soTaiKhoan}</TableCell>
                                <TableCell className="px-4 py-3">{order.chuTaiKhoan}</TableCell>
                                <TableCell className="px-4 py-3">
                                    {order.chiTietHoanHangs && order.chiTietHoanHangs.length > 0 ? (
                                        order.chiTietHoanHangs.map((ct, idx) => {
                                            let productName = '';
                                            if (ct.sanPham && typeof ct.sanPham === 'object' && 'tenSanPham' in ct.sanPham && ct.sanPham.tenSanPham) {
                                                productName = ct.sanPham.tenSanPham;
                                            } else if ((ct as any).idSanPham && allProducts) {
                                                const found = allProducts.find(sp => sp.id === (ct as any).idSanPham);
                                                productName = found ? found.tenSanPham : `ID: ${(ct as any).idSanPham}`;
                                            } else if ((ct as any).idSanPham) {
                                                productName = `ID: ${(ct as any).idSanPham}`;
                                            } else {
                                                productName = 'Sản phẩm không xác định';
                                            }
                                            return (
                                                <span
                                                    key={ct.id || idx}
                                                    className="block max-w-[180px] truncate whitespace-nowrap overflow-hidden text-ellipsis"
                                                    title={productName}
                                                >
                                                    {productName}
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="italic text-gray-400">Không có sản phẩm hoàn</span>
                                    )}
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    {order.chiTietHoanHangs && order.chiTietHoanHangs.length > 0 ? (
                                        order.chiTietHoanHangs.map((ct, idx) => (
                                            <span key={ct.id || idx} className="block">{ct.soLuongHoan}</span>
                                        ))
                                    ) : (
                                        <span className="italic text-gray-400">--</span>
                                    )}
                                </TableCell>
                                <TableCell className="px-4 py-3 font-bold text-green-400">{formatMoney(order.tongTienHoan)}</TableCell>
                                <TableCell className="px-4 py-3">
                                    <Badge className={`px-2 py-1 ${APPROVE_STATUS_COLOR[order.trangThai]}`}>
                                        {APPROVE_STATUS_LABELS[order.trangThai]}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                    <Badge className={`px-2 py-1 ${REFUND_STATUS_COLOR[order.trangThaiThanhToan]}`}>
                                        {REFUND_STATUS_LABELS[order.trangThaiThanhToan]}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-4 py-3 flex gap-2 flex-wrap">
                                    {order.trangThai === TrangThaiPhieuHoan.CHO_DUYET && (
                                        <>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-semibold border border-green-500"
                                                onClick={() => handleApprove(order.id)}
                                                disabled={duyetMutation.isPending}
                                                aria-label={`Duyệt phiếu ${order.id}`}
                                            >
                                                Duyệt
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold border border-red-500"
                                                onClick={() => handleReject(order.id)}
                                                disabled={tuChoiMutation.isPending}
                                                aria-label={`Từ chối phiếu ${order.id}`}
                                            >
                                                Từ chối
                                            </Button>
                                        </>
                                    )}
                                    {order.trangThai === TrangThaiPhieuHoan.DA_DUYET &&
                                        order.trangThaiThanhToan !== TrangThaiThanhToan.DA_HOAN && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold border border-indigo-500"
                                                onClick={() => handleRefund(order.id)}
                                                disabled={capNhatThanhToanMutation.isPending}
                                                aria-label={`Hoàn tiền phiếu ${order.id}`}
                                            >
                                                Hoàn tiền
                                            </Button>
                                        )}
                                    {order.trangThaiThanhToan === TrangThaiThanhToan.DA_HOAN && (
                                        <Badge className="bg-gray-200 text-gray-800 rounded-md text-xs font-semibold border border-gray-300">
                                            Đã hoàn xong
                                        </Badge>
                                    )}
                                    {order.trangThai === TrangThaiPhieuHoan.TU_CHOI && (
                                        <Badge className="bg-gray-200 text-gray-800 rounded-md text-xs font-semibold border border-gray-300">
                                            Đã xử lý
                                        </Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

// Pagination component
interface PaginationProps {
    total: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

function Pagination({ total, page, pageSize, onPageChange, onPageSizeChange }: PaginationProps) {
    const totalPages = Math.ceil(total / pageSize) || 1;
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-6 py-4 bg-gray-900 rounded-b-xl border-t border-gray-700">
            <div className="flex items-center gap-2">
                <span className="text-gray-300 text-sm">Hiển thị</span>
                <select
                    className="bg-gray-800 text-white rounded px-2 py-1 border border-gray-600 focus:outline-none"
                    value={pageSize}
                    onChange={e => onPageSizeChange(Number(e.target.value))}
                    aria-label="Số dòng mỗi trang"
                >
                    {[5, 10, 20, 50].map(size => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
                <span className="text-gray-300 text-sm">dòng/trang</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    className="px-2 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                >
                    &lt;
                </button>
                <span className="text-gray-300 text-sm">
                    Trang {page} / {totalPages}
                </span>
                <button
                    className="px-2 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                >
                    &gt;
                </button>
            </div>
        </div>
    );
}

// Main Component
export default function ReturnOrderManager() {
    const [selectedTrangThai, setSelectedTrangThai] = useState<TrangThaiPhieuHoan>(TrangThaiPhieuHoan.CHO_DUYET);
    const [filterRefund, setFilterRefund] = useState<TrangThaiThanhToan | "ALL">("ALL");
    const [search, setSearch] = useState("");

    // Debug: Kiểm tra thông tin admin khi component mount
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        console.log("Admin token:", token ? "Có token" : "Không có token");

        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));

            } catch (error) {
                console.error("Lỗi khi parse admin token:", error);
            }
        }
    }, []);

    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { data: phieuHoanData, isLoading } = usePhieuHoanByTrangThai(selectedTrangThai);
    const duyetMutation = useDuyetPhieuHoanHang();
    const tuChoiMutation = useTuChoiPhieuHoanHang();
    const capNhatThanhToanMutation = useCapNhatThanhToanPhieuHoanHang();

    let filteredData: PhieuHoanHang[] = (phieuHoanData ?? []);
    if (filterRefund !== "ALL") {
        filteredData = filteredData.filter((d) => d.trangThaiThanhToan === filterRefund);
    }
    if (search.trim()) {
        filteredData = filteredData.filter(
            (d) =>
                d.hoaDon?.maHD?.toLowerCase().includes(search.toLowerCase()) ||
                d.chuTaiKhoan?.toLowerCase().includes(search.toLowerCase()) ||
                d.hoaDon?.user?.ten?.toLowerCase().includes(search.toLowerCase()) ||
                d.chiTietHoanHangs?.some((ct) =>
                    ct.sanPham.tenSanPham.toLowerCase().includes(search.toLowerCase())
                )
        );
    }

    // Reset page when filter/search changes
    useEffect(() => { setPage(1); }, [selectedTrangThai, filterRefund, search]);

    // Pagination logic
    const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

    const stats = {
        total: phieuHoanData?.length ?? 0,
        refunded: filteredData.filter((d) => d.trangThaiThanhToan === TrangThaiThanhToan.DA_HOAN).length,
    };

    const handleRefresh = () => {
        setFilterRefund("ALL");
        setSearch("");
        toast.info("Đã làm mới bộ lọc!");
    };

    const handleApprove = async (id: number) => {
        try {
            console.log(`Admin đang duyệt phiếu hoàn hàng ID: ${id}`);

            // Kiểm tra token trước khi gửi
            const token = localStorage.getItem("access_token");
            if (!token) {
                toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
                return;
            }
            const message = await duyetMutation.mutateAsync(id);
            toast.success(message); // message từ backend
        } catch (error: any) {
            console.error("Lỗi khi duyệt phiếu hoàn hàng:", error);
            const errorMessage = error?.message || "Không thể duyệt phiếu hoàn hàng";
            toast.error(errorMessage);
        }
    };

    const handleReject = async (id: number) => {
        try {
            const lyDo = prompt("Nhập lý do từ chối:");
            if (!lyDo || lyDo.trim() === "") {
                toast.error("Vui lòng nhập lý do từ chối");
                return;
            }

            console.log(`Admin đang từ chối phiếu hoàn hàng ID: ${id}, Lý do: ${lyDo}`);

            // Kiểm tra token trước khi gửi
            const token = localStorage.getItem("access_token");
            if (!token) {
                toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
                return;
            }

            const message = await tuChoiMutation.mutateAsync({ id, lyDo: lyDo.trim() });
            toast.success(message); // message từ backend
        } catch (error: any) {
            console.error("Lỗi khi từ chối phiếu hoàn hàng:", error);
            const errorMessage = error?.message || "Không thể từ chối phiếu hoàn hàng";
            toast.error(errorMessage);
        }
    };

    const handleRefund = async (id: number) => {
        try {
            console.log(`Admin đang cập nhật thanh toán phiếu hoàn hàng ID: ${id}`);

            // Kiểm tra token trước khi gửi
            const token = localStorage.getItem("access_token");
            if (!token) {
                toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
                return;
            }
            const message = await capNhatThanhToanMutation.mutateAsync({ id, trangThai: TrangThaiThanhToan.DA_HOAN });
            toast.success(message); // message từ backend
        } catch (error: any) {
            console.error("Lỗi khi cập nhật thanh toán:", error);
            const errorMessage = error?.message || "Không thể cập nhật trạng thái thanh toán";
            toast.error(errorMessage);
        }
    };

    return (
        <main className="p-6 bg--900 w-full h-full" aria-label="Quản lý phiếu hoàn hàng">
            {/* <section className="flex flex-col md:flex-row gap-6 mb-8" aria-label="Thống kê phiếu hoàn hàng">
                <StatCard color="bg-gradient-to-br from-blue-600 to-blue-800" icon={<FaClipboardList />} label="Tổng phiếu" value={stats.total} />
                <StatCard color="bg-gradient-to-br from-purple-600 to-purple-800" icon={<FaMoneyCheckAlt />} label="Đã hoàn tiền" value={stats.refunded} />
            </section> */}

            <section className="mb-6">
                <Tabs value={selectedTrangThai} onValueChange={(v) => setSelectedTrangThai(v as TrangThaiPhieuHoan)}>
                    <TabsList className="bg-gray-800 border border-blue-500 rounded-xl flex gap-3 p-2">
                        {TRANG_THAI_OPTIONS.map((option) => (
                            <TabsTrigger
                                key={option.value}
                                value={option.value}
                                className="text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg flex items-center gap-2 px-4 py-2 transition"
                            >
                                {option.icon} {option.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </section>

            <section className="bg-gray-800 border border-gray-200/30 rounded-xl shadow-lg shadow-blue-500/20">
                <FilterHeader
                    search={search}
                    setSearch={setSearch}
                    filterRefund={filterRefund}
                    setFilterRefund={setFilterRefund}
                    handleRefresh={handleRefresh}
                />
                <OrderTable
                    data={pagedData}
                    isLoading={isLoading}
                    handleApprove={handleApprove}
                    handleReject={handleReject}
                    handleRefund={handleRefund}
                    duyetMutation={duyetMutation}
                    tuChoiMutation={tuChoiMutation}
                    capNhatThanhToanMutation={capNhatThanhToanMutation}
                />
                <Pagination
                    total={filteredData.length}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={size => { setPageSize(size); setPage(1); }}
                />
            </section>
        </main>
    );
}