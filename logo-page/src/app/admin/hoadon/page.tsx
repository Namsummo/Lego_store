import { ToastProvider } from "@/components/ui/toast-provider";
import HoaDonManagement from "./hoaDonManaganent";

export default function SanPhamPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Quản lý Hóa Đơn</h1>

      <HoaDonManagement />

    </div>
  )
}
