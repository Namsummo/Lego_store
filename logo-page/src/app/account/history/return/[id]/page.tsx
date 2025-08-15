"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HoaDonService } from "@/services/hoaDonService";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { sanPhamService } from "@/services/sanPhamService";
import { palette } from "../../palette";
import { CreditCard, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useTaoPhieuHoanHang } from "@/hooks/useHoanHang";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function ReturnForm() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [returnType, setReturnType] = useState<"partial" | "full">("partial");
    const [reason, setReason] = useState<string>("");
    const [otherReason, setOtherReason] = useState<string>("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [refundMethod, setRefundMethod] = useState<"bank" | "store">("bank");
    const [bankOwner, setBankOwner] = useState<string>("");
    const [bankNumber, setBankNumber] = useState<string>("");
    const [bankName, setBankName] = useState<string>("");
    const [errors, setErrors] = useState<{
        items?: string;
        itemQty?: Record<number, string>;
        reason?: string;
        bankOwner?: string;
        bankNumber?: string;
        bankName?: string;
    }>({ itemQty: {} });

    const [openDialog, setOpenDialog] = useState(false);

    type SelectableItem = {
        productId: number;
        name: string;
        unitPrice: number;
        maxQuantity: number;
        selected: boolean;
        quantity: number;
    };
    const [items, setItems] = useState<SelectableItem[]>([]);
    const taoPhieuHoan = useTaoPhieuHoanHang();

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const numericId = Number(id);
                const orderData = await HoaDonService.getHoaDonById(numericId);
                const chiTiet = await HoaDonService.getChiTietSanPhamByHoaDonId(numericId);
                const enriched = {
                    ...orderData,
                    chiTietSanPham: (chiTiet || []).map((ct: any) => ({
                        sanPham: ct.spId,
                        soLuong: ct.soLuong,
                    })),
                };
                setOrder(enriched);
                let productMap: Record<number, any> = {};
                try {
                    const allProducts = await sanPhamService.getSanPhams();
                    productMap = Object.fromEntries((allProducts || []).map((p: any) => [p.id, p]));
                } catch {
                    productMap = {};
                }
                const selectable: SelectableItem[] = (chiTiet || []).map((ct: any) => {
                    const pid = typeof ct.spId === "object" ? ct.spId.id : Number(ct.spId);
                    const product = typeof ct.spId === "object" ? ct.spId : productMap[pid];
                    return {
                        productId: pid,
                        name: product?.tenSanPham || `Sản phẩm #${pid}`,
                        unitPrice: Number(product?.gia ?? ct.gia ?? 0),
                        maxQuantity: Number(ct.soLuong || 1),
                        selected: true,
                        quantity: Number(ct.soLuong || 1),
                    } as SelectableItem;
                });
                setItems(selectable);
            } catch (err) {
                console.error("Lỗi khi lấy đơn hàng:", err);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Validate và mở dialog xác nhận
    const handleRequest = () => {
        const newErrors: typeof errors = { itemQty: {} };
        const chosenItems =
            returnType === "full"
                ? items.map((it) => ({ productId: it.productId, quantity: it.maxQuantity }))
                : items.filter((it) => it.selected).map((it) => ({ productId: it.productId, quantity: it.quantity }));

        if (chosenItems.length === 0) {
            newErrors.items = "Vui lòng chọn ít nhất 1 sản phẩm.";
        }

        if (returnType !== "full") {
            items.forEach((it) => {
                if (it.selected && (it.quantity < 1 || it.quantity > it.maxQuantity)) {
                    if (!newErrors.itemQty) newErrors.itemQty = {};
                    newErrors.itemQty[it.productId] = `Số lượng phải từ 1 đến ${it.maxQuantity}.`;
                }
            });
        }

        if (!reason || (reason === "Lý do khác" && !otherReason.trim())) {
            newErrors.reason = "Vui lòng chọn lý do hoặc nhập mô tả chi tiết.";
        }

        if (refundMethod === "bank") {
            if (!bankOwner.trim()) newErrors.bankOwner = "Vui lòng nhập chủ tài khoản.";
            if (!bankNumber.trim()) newErrors.bankNumber = "Vui lòng nhập số tài khoản.";
            if (!bankName.trim()) newErrors.bankName = "Vui lòng nhập tên ngân hàng.";
        }

        if (
            newErrors.items ||
            newErrors.reason ||
            newErrors.bankOwner ||
            newErrors.bankNumber ||
            newErrors.bankName ||
            (newErrors.itemQty && Object.keys(newErrors.itemQty).length > 0)
        ) {
            setErrors(newErrors);
            toast.error("Vui lòng kiểm tra lại thông tin đã nhập.");
            return;
        }

        setErrors({ itemQty: {} });
        setOpenDialog(true); // Mở dialog xác nhận
    };

    // Gửi API khi xác nhận ở dialog, hiện toast, chuyển trang
    const handleConfirm = () => {
        setOpenDialog(false);
        const chosenItems =
            returnType === "full"
                ? items.map((it) => ({ productId: it.productId, quantity: it.maxQuantity }))
                : items.filter((it) => it.selected).map((it) => ({ productId: it.productId, quantity: it.quantity }));

        const dto: any = {
            idHoaDon: order.id,
            loaiHoan: returnType === "full" ? "HOAN_TOAN_BO" : "HOAN_MOT_PHAN",
            lyDo: reason === "Lý do khác" ? otherReason : reason,
            phuongThucHoan: refundMethod === "bank" ? "Chuyển khoản" : "Ví cửa hàng",
            chiTietHoanHangs: chosenItems.map((it) => ({
                idSanPham: it.productId,
                soLuongHoan: it.quantity,
            })),
        };
        if (refundMethod === "bank") {
            dto.tenNganHang = bankName;
            dto.soTaiKhoan = bankNumber;
            dto.chuTaiKhoan = bankOwner;
        }

        taoPhieuHoan.mutate(dto, {
            onSuccess: () => {
                toast.success("Yêu cầu hoàn hàng đã được gửi thành công!");
                setTimeout(() => {
                    router.push("/account/history");
                }, 1200); // Đợi toast hiển thị xong rồi chuyển trang
            },
            onError: (err: any) => {
                toast.error(
                    err?.message ||
                    "Gửi yêu cầu hoàn hàng thất bại. Vui lòng thử lại sau."
                );
            },
        });
    };

    if (loading) return <p className="p-4">Đang tải...</p>;
    if (!order) return <p className="p-4 text-red-500">Không tìm thấy đơn hàng</p>;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`p-6 max-w-3xl mx-auto ${palette.pageBg} text-black min-h-screen`}
            >
                <h1 className="text-xl font-bold mb-1">Hoàn hàng - Mã {order.maHD}</h1>
                <p className={`${palette.subText} mb-4`}>Ngày đặt: {new Date(order.ngayTao).toLocaleDateString("vi-VN")}</p>
                <p className={`${palette.subText} mb-6`}>Tổng tiền: ₫{Number(order.tongTien || 0).toLocaleString()}</p>

                {/* Loại hoàn hàng */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <label className={`border rounded-xl p-4 flex items-start gap-3 cursor-pointer bg-white transition-all duration-200 ease-out hover:shadow-md ${returnType === "partial" ? "ring-2 ring-yellow-300" : ""}`}>
                        <input
                            type="radio"
                            name="returnType"
                            className="mt-1"
                            checked={returnType === "partial"}
                            onChange={() => setReturnType("partial")}
                        />
                        <div>
                            <div className="font-medium">Hoàn một phần</div>
                            <div className="text-sm text-gray-500">Chỉ hoàn một số sản phẩm</div>
                        </div>
                    </label>
                    <label className={`border rounded-xl p-4 flex items-start gap-3 cursor-pointer bg-white transition-all duration-200 ease-out hover:shadow-md ${returnType === "full" ? "ring-2 ring-yellow-300" : ""}`}>
                        <input
                            type="radio"
                            name="returnType"
                            className="mt-1"
                            checked={returnType === "full"}
                            onChange={() => setReturnType("full")}
                        />
                        <div>
                            <div className="font-medium">Hoàn toàn bộ</div>
                            <div className="text-sm text-gray-500">Hoàn tất cả sản phẩm</div>
                        </div>
                    </label>
                </div>

                {/* Sản phẩm trong đơn */}
                <div className="mb-6">
                    <h2 className="font-semibold mb-2">Chi tiết sản phẩm</h2>
                    {errors.items && (
                        <div className="text-xs text-red-600 mb-2">{errors.items}</div>
                    )}
                    <div className="space-y-3">
                        {items.map((it, idx) => (
                            <motion.div
                                key={it.productId}
                                whileHover={{ scale: 1.005 }}
                                transition={{ duration: 0.15 }}
                                className="rounded-xl bg-white border p-3 flex items-center gap-3 transition-all duration-200 ease-out hover:border-yellow-300 hover:shadow-sm"
                            >
                                <Checkbox
                                    checked={returnType === "full" ? true : it.selected}
                                    disabled={returnType === "full"}
                                    onCheckedChange={(v) => {
                                        const checked = Boolean(v);
                                        setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, selected: checked } : p)));
                                    }}
                                />
                                <div className="flex-1">
                                    <div className="font-medium">{it.name}</div>
                                    <div className="text-xs text-gray-500">₫{Number(it.unitPrice).toLocaleString()}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor={`qty-${it.productId}`} className="text-xs text-gray-500">SL</Label>
                                    <Input
                                        id={`qty-${it.productId}`}
                                        type="number"
                                        min={1}
                                        max={it.maxQuantity}
                                        value={returnType === "full" ? it.maxQuantity : it.quantity}
                                        className={`w-20 h-9 transition-all duration-200 ease-out focus:ring-2 ${errors.itemQty && errors.itemQty[it.productId] ? "border-red-400 focus:ring-red-400" : "focus:ring-yellow-300"}`}
                                        disabled={returnType === "full" || !(it.selected)}
                                        onChange={(e) => {
                                            const val = Math.max(1, Math.min(it.maxQuantity, Number(e.target.value || 1)));
                                            setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, quantity: val } : p)));
                                        }}
                                    />
                                    <div className="font-semibold text-[#E3000B]">
                                        ₫{Number(it.unitPrice * (returnType === "full" ? it.maxQuantity : it.quantity)).toLocaleString()}
                                    </div>
                                </div>
                                {errors.itemQty && errors.itemQty[it.productId] && (
                                    <div className="text-xs text-red-600 ml-auto">{errors.itemQty[it.productId]}</div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Lý do hoàn hàng */}
                <div className="mb-6">
                    <h2 className="font-semibold mb-2">Lý do hoàn hàng</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            "Sản phẩm bị lỗi/hỏng",
                            "Giao sai sản phẩm",
                            "Không hài lòng",
                            "Lý do khác",
                        ].map((label) => (
                            <label
                                key={label}
                                className={`border rounded-xl p-3 bg-white cursor-pointer flex items-center gap-2 transition-all duration-200 ease-out hover:shadow-md ${reason === label ? "ring-2 ring-yellow-300" : ""}`}
                            >
                                <input
                                    type="radio"
                                    name="reason"
                                    checked={reason === label}
                                    onChange={() => setReason(label)}
                                />
                                <span>{label}</span>
                            </label>
                        ))}
                    </div>
                    {errors.reason && (
                        <div className="text-xs text-red-600 mt-2">{errors.reason}</div>
                    )}
                    {reason === "Lý do khác" && (
                        <div className="mt-3">
                            <Label htmlFor="other-reason">Mô tả chi tiết</Label>
                            <Textarea
                                id="other-reason"
                                placeholder="Vui lòng mô tả lý do hoàn hàng..."
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                                className="mt-1 transition-all duration-200 ease-out focus:ring-2 focus:ring-yellow-300"
                            />
                        </div>
                    )}
                </div>

                {/* Ảnh minh chứng
                <div className="mb-6">
                    <h2 className="font-semibold mb-2">Hình ảnh minh chứng</h2>
                    <div className="bg-white border rounded-xl p-4">
                        <div className="border-2 border-dashed rounded-xl p-6 text-center text-sm text-gray-500 transition-colors duration-200 ease-out hover:border-yellow-300">
                            Kéo thả ảnh vào đây hoặc
                            <label className="text-[#006DB7] font-medium cursor-pointer ml-1">
                                chọn từ máy tính
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                                />
                            </label>
                            {selectedFiles.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {selectedFiles.map((f, i) => (
                                        <div key={i} className="text-xs truncate bg-gray-50 border rounded p-2">{f.name}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div> */}

                {/* Phương thức hoàn tiền */}
                <div className="mb-6">
                    <h2 className="font-semibold mb-2">Phương thức hoàn tiền</h2>
                    <div className="bg-white rounded-2xl border p-4 md:p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <label
                                className={`rounded-xl p-3 cursor-pointer flex items-center gap-3 border transition-all duration-200 ease-out hover:shadow-md ${refundMethod === "bank" ? "ring-2 ring-yellow-300 border-yellow-300" : ""}`}
                            >
                                <input
                                    type="radio"
                                    name="refund"
                                    className="sr-only"
                                    checked={refundMethod === "bank"}
                                    onChange={() => setRefundMethod("bank")}
                                />
                                <span className="w-9 h-9 rounded-lg bg-[#FFF3CC] border border-yellow-300 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-[#E3000B]" />
                                </span>
                                <div>
                                    <div className="font-medium">Chuyển khoản</div>
                                    <div className="text-xs text-slate-500">Hoàn trực tiếp về tài khoản ngân hàng</div>
                                </div>
                            </label>

                            <label
                                className={`rounded-xl p-3 cursor-pointer flex items-center gap-3 border transition-all duration-200 ease-out hover:shadow-md ${refundMethod === "store" ? "ring-2 ring-yellow-300 border-yellow-300" : ""}`}
                            >
                                <input
                                    type="radio"
                                    name="refund"
                                    className="sr-only"
                                    checked={refundMethod === "store"}
                                    onChange={() => setRefundMethod("store")}
                                />
                                <span className="w-9 h-9 rounded-lg bg-[#FFF3CC] border border-yellow-300 flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-[#006DB7]" />
                                </span>
                                <div>
                                    <div className="font-medium">Ví cửa hàng</div>
                                    <div className="text-xs text-slate-500">Sử dụng cho lần mua kế tiếp</div>
                                </div>
                            </label>
                        </div>

                        <motion.div
                            initial={false}
                            animate={{ height: refundMethod === "bank" ? "auto" : 0, opacity: refundMethod === "bank" ? 1 : 0 }}
                            style={{ overflow: "hidden" }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border rounded-xl p-4">
                                <div>
                                    <Label htmlFor="bankOwner">Chủ tài khoản</Label>
                                    <Input
                                        id="bankOwner"
                                        placeholder="Nguyễn Văn A"
                                        value={bankOwner}
                                        onChange={(e) => setBankOwner(e.target.value)}
                                        className={`transition-all duration-200 ease-out focus:ring-2 ${errors.bankOwner ? "border-red-400 focus:ring-red-400" : "focus:ring-yellow-300"}`}
                                    />
                                    {errors.bankOwner && <div className="text-xs text-red-600 mt-1">{errors.bankOwner}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="bankNumber">Số tài khoản</Label>
                                    <Input
                                        id="bankNumber"
                                        placeholder="0123 4567 890"
                                        value={bankNumber}
                                        onChange={(e) => setBankNumber(e.target.value)}
                                        className={`transition-all duration-200 ease-out focus:ring-2 ${errors.bankNumber ? "border-red-400 focus:ring-red-400" : "focus:ring-yellow-300"}`}
                                    />
                                    {errors.bankNumber && <div className="text-xs text-red-600 mt-1">{errors.bankNumber}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="bankName">Ngân hàng</Label>
                                    <Input
                                        id="bankName"
                                        placeholder="Vietcombank, Techcombank..."
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        className={`transition-all duration-200 ease-out focus:ring-2 ${errors.bankName ? "border-red-400 focus:ring-red-400" : "focus:ring-yellow-300"}`}
                                    />
                                    {errors.bankName && <div className="text-xs text-red-600 mt-1">{errors.bankName}</div>}
                                </div>
                            </div>
                        </motion.div>

                        {refundMethod === "store" && (
                            <div className="mt-2 text-xs text-slate-600">Tiền hoàn sẽ được cộng vào ví cửa hàng của bạn ngay khi yêu cầu được duyệt.</div>
                        )}
                    </div>
                </div>

                <div className="sticky bottom-4 bg-transparent pt-2">
                    <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                        <AlertDialogTrigger asChild>
                            <Button
                                className="w-full md:w-auto px-6 py-6 rounded-full bg-[#FFD400] hover:bg-[#FFE066] text-black font-semibold border border-yellow-300 shadow-lg transition-all duration-200 ease-out hover:shadow-xl"
                                onClick={handleRequest}
                                disabled={taoPhieuHoan.isLoading}
                            >
                                {taoPhieuHoan.isLoading ? "Đang gửi..." : "Gửi Yêu Cầu Hoàn Hàng"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận gửi yêu cầu hoàn hàng?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bạn có chắc chắn muốn gửi yêu cầu hoàn hàng cho đơn này không?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={handleConfirm} disabled={taoPhieuHoan.isLoading}>
                                    Xác nhận
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </motion.div>
        </>
    );
}