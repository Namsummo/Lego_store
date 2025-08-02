'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useGetPhieuGiam } from '@/hooks/usePhieuGiam';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BadgePercent } from 'lucide-react';
import Image from 'next/image';
import { CartItem } from '@/components/types/order.type';
import { PhieuGiamGia } from '@/components/types/phieugiam.type';

interface Props {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  onChangeName: (name: string) => void;
  onChangeEmail: (email: string) => void;
  onChangePhone: (phone: string) => void;
  onCheckout: (qrCodeUrl?: string) => void;
  isCheckoutDisabled: boolean;
  onSavePending: () => void;
  paymentMethod: '' | 'cash' | 'transfer' | 'cod';
  setPaymentMethod: (m: '' | 'cash' | 'transfer' | 'cod') => void;
  cashGiven: number | '';
  setCashGiven: (v: number | '') => void;
  cart: CartItem[];
  selectedVoucher: PhieuGiamGia | null;
  setSelectedVoucher: (v: PhieuGiamGia | null) => void;
  orderId: string;
  qrCodeUrl: string | null;
  setQrCodeUrl: (v: string | null) => void;
}

const Summary: React.FC<Props> = ({
  customerName,
  customerEmail,
  customerPhone,
  subtotal,
  discountAmount,
  total,
  onCheckout,
  isCheckoutDisabled,
  onSavePending,
  paymentMethod,
  setPaymentMethod,
  cashGiven,
  setCashGiven,
  cart,
  selectedVoucher,
  setSelectedVoucher,
  // orderId,
  qrCodeUrl,
  setQrCodeUrl,
}) => {
  const { data: phieuGiamGias = [] } = useGetPhieuGiam();
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  const change = paymentMethod === 'cash' && cashGiven !== '' ? Number(cashGiven) - total : 0;
  const [open, setOpen] = React.useState(false);
  const [showQR, setShowQR] = React.useState(false);
  // XÓA local state qrCodeUrl ở đây, dùng prop thay thế
  const [loadingQR, setLoadingQR] = React.useState(false);
  const qrCodeRef = React.useRef<string | null>(null);
  const [showConfirmReceived, setShowConfirmReceived] = React.useState(false);

  const handleGenerateQR = async () => {
    setLoadingQR(true);
    const accountNo = "606506122005";
    const accountName = "NGO TIEN QUANG";
    const acqId = "970422";
    const addInfo = `THANH TOAN DON ${customerPhone || "KHACHLE"}`;

    const res = await fetch("https://api.vietqr.io/v2/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountNo,
        accountName,
        acqId,
        amount: total,
        addInfo,
        format: "text",
      }),
    });
    const data = await res.json();
    console.log("Kết quả trả về từ API VietQR:", data);
    // Nếu có qrDataURL (ảnh base64) thì dùng, nếu không thì tự tạo URL ảnh QR code
    let qrUrl = data.data.qrDataURL;
    if (!qrUrl) {
      // Tạo URL ảnh QR code từ thông tin đơn hàng
      qrUrl = `https://img.vietqr.io/image/MB-606506122005-compact2.png?amount=${total}&addInfo=${encodeURIComponent(addInfo)}`;
    }
    setQrCodeUrl(qrUrl);
    qrCodeRef.current = qrUrl;
    setShowQR(true);
    setLoadingQR(false);
  };

  return (
    <>
      <Separator className="my-4 bg-white/10" />

      {/* Dialog xác nhận thanh toán */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận thanh toán</DialogTitle>
            <DialogDescription>
              Vui lòng kiểm tra lại thông tin đơn hàng trước khi xác nhận thanh toán.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-2">
            <div>
              <span className="font-semibold">Khách hàng:</span> {customerName || "Khách lẻ"}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {customerEmail || "-"}
            </div>
            <div>
              <span className="font-semibold">SĐT:</span> {customerPhone && customerPhone.trim().length > 0 ? customerPhone : ""}
            </div>
            <ScrollArea className="h-48 pr-4 my-2">
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <Image
                        src={item.anhDaiDien || '/no-image.png'}
                        alt={item.tenSanPham}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover rounded"
                        unoptimized
                      />
                      <div>
                        <span className="font-medium">{item.tenSanPham}</span>
                        <span className="text-muted-foreground"> x {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {item.giaKhuyenMai && item.giaKhuyenMai > 0 ? (
                        <>
                          <span className="text-primary font-bold">{formatCurrency(item.giaKhuyenMai)}</span>
                          <span className="ml-2 line-through text-xs text-gray-500">{formatCurrency(item.gia)}</span>
                        </>
                      ) : (
                        <span>{formatCurrency(item.gia)}</span>
                      )}
                      <div className="text-xs text-gray-400">
                        Thành tiền: {formatCurrency((item.giaKhuyenMai && item.giaKhuyenMai > 0 ? item.giaKhuyenMai : item.gia) * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center">
                    <BadgePercent className="w-4 h-4 mr-1" />
                    Giảm giá
                  </span>
                  <span className="font-medium">- {formatCurrency(discountAmount)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phương thức thanh toán</span>
                <span>{paymentMethod === 'cash' ? 'Tiền mặt' : paymentMethod === 'transfer' ? 'Chuyển khoản' : ''}</span>
              </div>
              {paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span>Khách đưa</span>
                    <span>{formatCurrency(Number(cashGiven) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiền thừa</span>
                    <span>{formatCurrency(change)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>
            <Button
              onClick={async () => {
                // BỎ validation bắt buộc nhập SĐT khi chuyển khoản
                // if (paymentMethod === "transfer" && (!customerPhone || customerPhone.trim() === "")) {
                //   toast.error("Vui lòng nhập số điện thoại khách hàng!");
                //   return;
                // }
                if (paymentMethod === "transfer") {
                  await handleGenerateQR();
                  setOpen(false); // Đóng dialog xác nhận, mở dialog QR
                } else {
                  onCheckout();
                  setOpen(false);
                }
              }}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Đã tự động tạo đơn khi QR sẵn sàng, không cần dialog QR nữa */}

      {showQR && (
        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quét mã QR để chuyển khoản</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              {loadingQR ? (
                <div>Đang tạo mã QR...</div>
              ) : (
                <>
                  <Image
                    src={qrCodeUrl || `https://api.vietqr.io/image/970422-606506122005-ME0GcS6.jpg?accountName=NGO%20TIEN%20QUANG&amount=${total}&addInfo=${encodeURIComponent('Thanh toan hoa don')}`}
                    alt="QR chuyển khoản"
                    width={400}
                    height={400}
                    style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
                    priority
                  />
                  <div className="text-center text-sm">
                    Số tiền: <b>{formatCurrency(total)}</b><br />
                    Nội dung: <b>{`THANH TOAN DON ${customerPhone || "KHACHLE"}`}</b>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Đóng</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  setShowQR(false);
                  setShowConfirmReceived(true); // Mở dialog xác nhận đã nhận tiền
                }}
                disabled={loadingQR}
              >
                Đã chuyển khoản
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog xác nhận đã nhận tiền */}
      <Dialog open={showConfirmReceived} onOpenChange={setShowConfirmReceived}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đã nhận tiền</DialogTitle>
            <DialogDescription>Bạn đã nhận được tiền từ khách chưa?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmReceived(false)}>
              Hủy
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setShowConfirmReceived(false);
                onCheckout(qrCodeRef.current || undefined);
              }}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between text-gray-300">
          <span>Tạm tính:</span>
          <span className="font-medium text-white">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center mb-2 justify-between">
          <label htmlFor="discount-select" className="text-gray-300 text-sm min-w-[110px]">Phiếu giảm giá:</label>
          <Select
            value={selectedVoucher ? String(selectedVoucher.id) : "0"}
            onValueChange={val => {
              if (val === "0") {
                setSelectedVoucher(null);
              } else {
                const voucher = phieuGiamGias.find(opt => String(opt.id) === val);
                setSelectedVoucher(voucher || null);
              }
            }}
          >
            <SelectTrigger className="h-9 text-sm bg-background/70 border border-white/30 text-white rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary/60 shadow-sm hover:border-primary/60 text-right">
              <SelectValue placeholder="Chọn phiếu giảm giá" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-primary/60 shadow-lg bg-[#23272f] text-white">
              <SelectItem value={"0"} className="rounded-xl">Không áp dụng</SelectItem>
              {(() => {
                const filteredVouchers = phieuGiamGias.filter(opt => {
                  // Kiểm tra trạng thái hoạt động (chỉ lấy voucher đang hoạt động)
                  if (opt.trangThai && opt.trangThai !== "Đang hoạt động" && opt.trangThai !== "active") {
                    return false;
                  }

                  // Kiểm tra ngày hết hạn
                  const now = new Date();
                  if (opt.ngayKetThuc) {
                    const [day, month, year] = opt.ngayKetThuc.split("-");
                    const isoDate = `${year}-${month}-${day}T23:59:59`;
                    const expiry = new Date(isoDate);
                    if (expiry < now) {
                      return false;
                    }
                  }

                  // Kiểm tra giá trị tối thiểu
                  if (subtotal < opt.giaTriToiThieu) {
                    return false;
                  }

                  return true;
                });

                return filteredVouchers.map(opt => (
                  <SelectItem key={opt.id} value={String(opt.id)} className="rounded-xl">
                    {opt.maPhieu ? `${opt.maPhieu} - ` : ''}
                    {opt.loaiPhieuGiam === 'theo_phan_tram' ? `${opt.giaTriGiam}%` : formatCurrency(opt.giaTriGiam)}
                  </SelectItem>
                ));
              })()}
            </SelectContent>
          </Select>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-red-400">
            <span>Tiền giảm giá:</span>
            <span className="font-medium">-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-xl font-bold text-white">
          <span>Tổng cộng:</span>
          <span className="pos-gradient-text">{formatCurrency(total)}</span>
        </div>
        <div className="flex items-center mb-2 justify-between">
          <label htmlFor="payment-method-select" className="text-gray-300 text-sm min-w-[110px]">Phương thức thanh toán:</label>
          <Select value={paymentMethod} onValueChange={val => setPaymentMethod(val as '' | 'cash' | 'transfer')}>
            <SelectTrigger id="payment-method-select" className="h-9 text-sm bg-background/70 border border-white/30 text-white rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary/60 shadow-sm hover:border-primary/60 text-right">
              <SelectValue placeholder="Chọn phương thức" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-primary/60 shadow-lg bg-[#23272f] text-white">
              <SelectItem value="cash" className="rounded-xl">Tiền mặt</SelectItem>
              <SelectItem value="transfer" className="rounded-xl">Chuyển khoản</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {paymentMethod === 'cash' && (
          <>
            <div className="flex items-center mb-2 justify-between">
              <span className="text-gray-300 text-sm min-w-[110px]">Khách đưa:</span>
              <Input
                type="number"
                min={0}
                value={cashGiven}
                onChange={e => setCashGiven(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-32 text-right bg-background/70 border-white/30 text-white"
                placeholder="Nhập số tiền"
              />
            </div>
            <div className="flex items-center mb-2 justify-between">
              <span className="text-gray-300 text-sm min-w-[110px]">Tiền thừa:</span>
              <span className={`font-bold ${change < 0 ? 'text-red-400' : 'text-green-400'}`}>{formatCurrency(change)}</span>
            </div>
          </>
        )}
      </div>

      <Button
        size="lg"
        variant="default"
        className="w-full py-6 text-lg mb-2"
        onClick={() => setOpen(true)}
        disabled={isCheckoutDisabled}
      >
        <DollarSign className="mr-2 h-6 w-6" /> Thanh toán
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="w-full py-6 text-lg"
        onClick={onSavePending}
        disabled={isCheckoutDisabled}
      >
        Lưu chờ
      </Button>
    </>
  );
};

export default Summary;
