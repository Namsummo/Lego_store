'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useLocalStorage } from '@/context/useLocalStorage';
import ProductList from './ProductList';
import Cart from './Cart';
import { toast } from 'sonner';
import Summary from './Summary';
import { CartItem } from '@/components/types/order.type';
import { useListKhuyenMaiTheoSanPham } from '@/hooks/useKhuyenmai';
import { useCreateHoaDon } from '@/hooks/useHoaDon';
import { useUserStore } from '@/context/authStore.store';
import { CreateHoaDonDTO } from '@/components/types/hoaDon-types';
import { useRouter } from 'next/navigation';
import { PhieuGiamGia } from '@/components/types/phieugiam.type';
import PendingOrders from './PendingOrders';
import { KhuyenMaiTheoSanPham } from '@/components/types/khuyenmai-type';
import { PendingOrder } from '@/components/types/order.type';
import { AnhSanPhamChiTiet } from '@/components/types/product.type';

// const getValidImageName = (filenameOrObj: string | { url: string }) => {
//   let filename = '';
//   if (typeof filenameOrObj === 'string') {
//     filename = filenameOrObj;
//   } else if (filenameOrObj && typeof filenameOrObj === 'object' && 'url' in filenameOrObj) {
//     filename = filenameOrObj.url;
//   }
//   filename = filename.replace(/^anh_/, '');
//   const lastUnderscore = filename.lastIndexOf('_');
//   if (lastUnderscore !== -1) {
//     filename = filename.substring(lastUnderscore + 1);
//   }
//   filename = filename.replace(/(.jpg)+$/, '.jpg');
//   return filename;
// };

const getMainImageUrl = (anhUrls: AnhSanPhamChiTiet[]) => {
  console.log("getMainImageUrl input:", anhUrls);

  if (!anhUrls || anhUrls.length === 0) {
    console.log("Không có ảnh, trả về placeholder");
    return '/images/avatar-admin.png';
  }

  const mainImg = anhUrls.find((img) => img.anhChinh);
  const imgToUse = mainImg || anhUrls[0];
  console.log("imgToUse:", imgToUse);

  if (imgToUse && imgToUse.url) {
    const imageUrl = `http://localhost:8080/api/anhsp/images/${imgToUse.url}`;
    console.log("Generated image URL:", imageUrl);
    return imageUrl;
  }

  console.log("Không có URL, trả về placeholder");
  return '/images/avatar-admin.png';
};

const OrderPage = () => {
  const { data: products = [] } = useListKhuyenMaiTheoSanPham();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pendingOrdersRaw, setPendingOrders] = useLocalStorage('pending-orders', []);
  const pendingOrders: PendingOrder[] = pendingOrdersRaw as PendingOrder[];
  const [paymentMethod, setPaymentMethod] = useState<'' | 'cash' | 'transfer' | 'cod'>('');
  const [cashGiven, setCashGiven] = useState<number | ''>('');
  const router = useRouter();
  const [selectedVoucher, setSelectedVoucher] = useState<PhieuGiamGia | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [orderId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Hooks for creating order
  const createHoaDonMutation = useCreateHoaDon();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    console.log("hydrated:", hydrated, "user:", user);
    if (!hydrated) return;
    if (!user) {
      console.log("Chưa có user, không redirect");
      return;
    }
    if (user.roleId !== 1 && user.roleId !== 2) {
      console.log("User không đủ quyền, redirect về /");
      window.location.href = "/";
    } else {
      console.log("User đủ quyền, ở lại trang admin");
    }
  }, [user, hydrated, router]);

  const filteredProducts = useMemo(
    () => (products as KhuyenMaiTheoSanPham[]).filter((p) => p.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase())),
    [products, searchTerm]
  );

  const addToCart = (product: KhuyenMaiTheoSanPham) => {
    console.log("Thêm sản phẩm vào giỏ hàng:", product.tenSanPham);
    console.log("anhUrls:", product.anhUrls);

    const existingItem = cart.find((item) => item.id === product.id);
    const firstImage = getMainImageUrl(product.anhUrls || []);
    console.log("firstImage:", firstImage);

    if (existingItem) {
      if (existingItem.quantity < (product.soLuongTon ?? 0)) {
        setCart(cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
        toast.error(`Chỉ còn ${product.soLuongTon ?? 0} sản phẩm trong kho`);
      }
    } else {
      // Convert KhuyenMaiTheoSanPham to CartItem with proper type handling
      const cartItem: CartItem = {
        ...product,
        quantity: 1,
        anhDaiDien: firstImage,
        danhMucId: typeof product['danhMucId'] === 'number' ? product['danhMucId'] : 0,
        boSuuTapId: typeof product['boSuuTapId'] === 'number' ? product['boSuuTapId'] : 0,
        doTuoi: typeof product.doTuoi === 'number' ? product.doTuoi : 0,
        moTa: typeof product.moTa === 'string' ? product.moTa : '',
        soLuongManhGhep: typeof product.soLuongManhGhep === 'number' ? product.soLuongManhGhep : 0,
        xuatXuId: product.xuatXuId ?? 0,
        thuongHieuId: product.thuongHieuId ?? 0,
      };
      console.log("cartItem.anhDaiDien:", cartItem.anhDaiDien);
      setCart([...cart, cartItem]);
    }
  };

  const updateQuantity = (id: number, amount: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + amount;
        if (newQuantity <= 0) return null;
        if (newQuantity > item.soLuongTon) {
          toast.error(`Chỉ còn ${item.soLuongTon} sản phẩm trong kho`);
          return { ...item, quantity: item.soLuongTon };
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = useMemo(() => cart.reduce((sum, item) => {
    const price = item.giaKhuyenMai && item.giaKhuyenMai > 0 ? item.giaKhuyenMai : item.gia;
    return sum + price * item.quantity;
  }, 0), [cart]);
  const discountAmount = useMemo(() => {
    if (!selectedVoucher) return 0;
    if (selectedVoucher.loaiPhieuGiam === "Theo %") {
      // Nếu có giamToiDa, không vượt quá giamToiDa
      const percentDiscount = (subtotal * selectedVoucher.giaTriGiam) / 100;
      if (selectedVoucher.giamToiDa) {
        return Math.min(percentDiscount, selectedVoucher.giamToiDa, subtotal);
      }
      return Math.min(percentDiscount, subtotal);
    } else if (selectedVoucher.loaiPhieuGiam === "Theo số tiền") {
      return Math.min(selectedVoucher.giaTriGiam, subtotal);
    }
    return 0;
  }, [subtotal, selectedVoucher]);
  const total = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);

  // Function to create order
  const createOrder = async (qrCodeUrl?: string) => {
    if (!user || (user.roleId !== 1 && user.roleId !== 2)) {
      toast.error("Bạn không có quyền tạo hóa đơn tại quầy!");
      return;
    }

    if (cart.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    // Sửa: Nếu có nhập SĐT thì lấy đúng, không thì truyền 'KHACHLE'
    // const phoneForOrder = customerPhone && customerPhone.trim() !== "" ? customerPhone.trim() : "KHACHLE";

    // Kiểm tra định dạng SĐT nếu có nhập
    if (customerPhone && customerPhone.trim().length > 0) {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(customerPhone.trim())) {
        toast.error('Số điện thoại không hợp lệ!');
        return;
      }
    }

    if (!paymentMethod) {
      toast.error('Vui lòng chọn phương thức thanh toán');
      return;
    }

    if (cart.some(item => !item.id)) {
      toast.error("Có sản phẩm trong giỏ hàng bị thiếu ID!");
      return;
    }

    // Nếu CreateHoaDonDTO yêu cầu sdt là string, thì phải truyền 'KHACHLE' khi không nhập, còn nếu không bắt buộc thì giữ như hiện tại
    // Giả sử sdt là không bắt buộc, giữ như hiện tại:
    const orderData: CreateHoaDonDTO = {
      loaiHD: 1,
      nvId: user.id,
      diaChiGiaoHang: "Tại quầy",
      maVanChuyen: "QUAY_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      phuongThucThanhToan: (
        paymentMethod === 'cash'
          ? 'Tiền mặt'
          : paymentMethod === 'transfer'
            ? 'Chuyển khoản'
            : paymentMethod === 'cod'
              ? 'COD'
              : 'Tiền mặt'
      ) as unknown as 'CASH' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY',
      cartItems: cart.map(item => ({
        idSanPham: item.id,
        soLuong: item.quantity
      })),
      ...(selectedVoucher && { idPhieuGiam: selectedVoucher.id }),
      ...(selectedCustomerId ? { userId: selectedCustomerId } : {}), // chỉ truyền userId nếu có chọn khách hàng
      qrCodeUrl: qrCodeUrl || undefined,
      ...(customerPhone && customerPhone.trim().length > 0 ? { sdt: customerPhone.trim() } : {}),
    } as CreateHoaDonDTO;

    console.log("orderData gửi lên BE:", orderData);
    console.log('User:', user);
    console.log('Cart length:', cart.length);

    try {
      console.log('Starting to create order...');
      const result = await createHoaDonMutation.mutateAsync(orderData);
      console.log('Order created successfully:', result);
      toast.success(`Tạo hóa đơn thành công! Cảm ơn ${customerName || "quý khách"}`);

      // Clear cart and form
      setCart([]);
      setDiscount(0);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setPaymentMethod('');
      setCashGiven('');
      setSelectedVoucher(null);
      setQrCodeUrl(null); // Xóa mã QR sau khi tạo hóa đơn

      // Navigate to orders list
      router.push('/admin/hoadon');
    } catch (error: unknown) {
      console.error('Lỗi tạo hóa đơn:', error);
      console.error('Error type:', typeof error);
      console.error('Error instanceof Error:', error instanceof Error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      let message = 'Có lỗi xảy ra khi tạo hóa đơn';
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    }
  };

  const handleSavePendingOrder = () => {
    if (cart.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    const randomShort = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newOrder = {
      id: `HDC${randomShort}`,
      items: cart,
      totalAmount: total,
      customerName,
      customerEmail,
      customerPhone,
      discount,
      discountAmount,
      timestamp: new Date(),
    };
    setPendingOrders([newOrder, ...pendingOrders]);
    // Xóa pending order khỏi localStorage khi lưu chờ
    localStorage.removeItem('pending-order-to-load');
    setCart([]);
    setDiscount(0);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setSelectedVoucher(null);
    toast.success('Đã lưu hóa đơn chờ!');
  };

  const handleLoadPendingOrder = (order: PendingOrder) => {
    setCart(order.items || []);
    setCustomerName(order.customerName || '');
    setCustomerEmail(order.customerEmail || '');
    setCustomerPhone(order.customerPhone || '');
    setDiscount(order.discount || 0);
    setPendingOrders(pendingOrders.filter((o: PendingOrder) => o.id !== order.id));
  };

  const handleDeletePendingOrder = (orderId: string) => {
    setPendingOrders(pendingOrders.filter((o: PendingOrder) => o.id !== orderId));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pendingOrderStr = localStorage.getItem('pending-order-to-load');
      if (pendingOrderStr) {
        try {
          const order = JSON.parse(pendingOrderStr);
          setCart(order.items || []);
          setCustomerName(order.customerName || '');
          setCustomerEmail(order.customerEmail || '');
          setCustomerPhone(order.customerPhone || '');
          setDiscount(order.discount || 0);
          localStorage.removeItem('pending-order-to-load'); // Xóa sau khi load
        } catch { }
      }
    }
  }, []);

  return (
    <Card className="p-4 bg-gray-800 shadow-md w-full max-w-full min-h-screen">
      <div className="flex justify-between items-center">
        <div className="text-center w-full">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Bán Hàng Tại Quầy
          </h1>
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 min-h-screen flex gap-6">
        <ProductList
          products={filteredProducts}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onAddToCart={addToCart}
          cart={cart}
          pendingOrders={pendingOrders}
        />
        <div className="w-2/5 mx-auto h-full flex flex-col gap-4">
          <Card className="glass-card flex flex-col">
            <CardHeader><CardTitle className="text-2xl font-bold text-white">Đơn hàng</CardTitle></CardHeader>
            <CardContent className="flex-grow flex flex-col p-4">
              <Cart
                cart={cart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                customerName={customerName}
                customerEmail={customerEmail}
                customerPhone={customerPhone}
                onChangeName={setCustomerName}
                onChangeEmail={setCustomerEmail}
                onChangePhone={setCustomerPhone}
                setSelectedCustomerId={setSelectedCustomerId}
              />
              <Summary
                customerName={customerName}
                customerEmail={customerEmail}
                customerPhone={customerPhone}
                subtotal={subtotal}
                discountAmount={discountAmount}
                total={total}
                onChangeName={setCustomerName}
                onChangeEmail={setCustomerEmail}
                onChangePhone={setCustomerPhone}
                onCheckout={createOrder}
                isCheckoutDisabled={cart.length === 0}
                onSavePending={handleSavePendingOrder}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cashGiven={cashGiven}
                setCashGiven={setCashGiven}
                cart={cart}
                selectedVoucher={selectedVoucher}
                setSelectedVoucher={setSelectedVoucher}
                orderId={orderId}
                qrCodeUrl={qrCodeUrl}
                setQrCodeUrl={setQrCodeUrl}
              />
            </CardContent>
          </Card>
          <PendingOrders
            orders={pendingOrders}
            onLoad={handleLoadPendingOrder}
            onDelete={handleDeletePendingOrder}
          />
        </div>
      </motion.div>
    </Card>
  );
};

export default OrderPage;