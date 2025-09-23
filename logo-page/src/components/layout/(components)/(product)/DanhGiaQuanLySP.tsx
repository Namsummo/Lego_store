// DanhGiaSanPham.tsx
import { useMemo, useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUserStore } from "@/context/authStore.store";
import { useAddDanhGiaWithImages, useDanhGia } from "@/hooks/useDanhGia";
import { useListKhuyenMaiTheoSanPham } from "@/hooks/useKhuyenmai";
import { HoaDonService } from "@/services/hoaDonService";

import { Button } from "@/components/ui/button";

import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import QuanLyThongBao from "./QuanLyThongBao";
import { KhuyenMaiTheoSanPham } from "@/components/types/khuyenmai-type";
import { Star } from "lucide-react";

// Import User type từ authStore
interface User {
  id: number;
  ten: string;
  email: string;
  sdt?: string;
  ngaySinh?: string | Date;
  diaChi?: string;
  roleId: number;
  message: string;
  token?: string;
}

type SanPhamChiTietWithAnhUrls = KhuyenMaiTheoSanPham & {
  anhUrls?: { url: string; anhChinh?: boolean }[];
};

// Component cho đánh giá tổng quan và bộ lọc
interface RatingAndFilterSectionProps {
  sanPhamChiTiet: SanPhamChiTietWithAnhUrls;
  reviewStats: {
    average: number;
    total: number;
    distribution: Record<number, number>;
    hasComment: number;
    hasMedia: number;
  };
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  user: User | null;
  hasReviewedProduct: boolean;
  onShowForm: () => void;
  showDanhGiaForm: boolean;
  hasPurchasedProduct: boolean | null;
  isCheckingPurchase: boolean;
}

const RatingAndFilterSection = ({
  sanPhamChiTiet,
  reviewStats,
  selectedFilter,
  setSelectedFilter,
  user,
  hasReviewedProduct,
  onShowForm,
  showDanhGiaForm,
  hasPurchasedProduct,
  isCheckingPurchase,
}: RatingAndFilterSectionProps) => {
  // Component cho đánh giá tổng quan
  const RatingOverview = ({
    sanPhamChiTiet,
  }: {
    sanPhamChiTiet: SanPhamChiTietWithAnhUrls;
  }) => (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl shadow-sm border border-red-100">
      <div className="text-center">
        <div className="text-5xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
          {sanPhamChiTiet.danhGiaTrungBinh || 0}
        </div>
        <div className="text-gray-600 mb-3 font-medium">trên 5 sao</div>
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={28}
              className={
                i <= (sanPhamChiTiet.danhGiaTrungBinh || 0)
                  ? "text-yellow-400 drop-shadow-sm"
                  : "text-gray-300"
              }
              fill={
                i <= (sanPhamChiTiet.danhGiaTrungBinh || 0) ? "#fbbf24" : "none"
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
  // Component cho nút filter
  const FilterButton = ({
    active,
    onClick,
    children,
    count,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    count?: number;
  }) => (
    <Button
      onClick={onClick}
      className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
          : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
      }`}
    >
      {children} {count !== undefined && `(${count})`}
    </Button>
  );
  return (
    <>
      <div className="grid lg:grid-cols-4 gap-8 mb-8">
        <RatingOverview sanPhamChiTiet={sanPhamChiTiet} />
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-wrap gap-3">
            <FilterButton
              active={selectedFilter === "all"}
              onClick={() => setSelectedFilter("all")}
              count={reviewStats.total}
            >
              Tất Cả
            </FilterButton>
            {[5, 4, 3, 2, 1].map((star) => (
              <FilterButton
                key={star}
                active={selectedFilter === star.toString()}
                onClick={() => setSelectedFilter(star.toString())}
                count={reviewStats.distribution[star] || 0}
              >
                {star} ⭐
              </FilterButton>
            ))}
          </div>
          {/* Các filter khác */}
        </div>
      </div>
      {/* Nút đánh giá và thông báo */}
      {user && !hasReviewedProduct && !showDanhGiaForm && (
        <div className="text-center mb-8">
          {isCheckingPurchase ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-blue-800">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <p className="font-medium">Đang kiểm tra lịch sử mua hàng...</p>
              </div>
            </div>
          ) : hasPurchasedProduct === false ? (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-orange-800">
                <span className="text-2xl">🛒</span>
                <div className="text-center">
                  <p className="font-semibold">
                    Bạn cần mua sản phẩm này trước khi đánh giá
                  </p>
                  <p className="text-sm mt-1">
                    Chỉ có thể đánh giá sản phẩm đã mua và hoàn tất trong vòng 7
                    ngày gần nhất
                  </p>
                  <p className="text-xs mt-1 text-orange-600">
                    Hãy mua hàng, nhận được sản phẩm và đơn hàng hoàn tất để
                    chia sẻ trải nghiệm của bạn
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Button onClick={onShowForm}>✍️ Viết đánh giá</Button>
          )}
        </div>
      )}
      {user && hasReviewedProduct && (
        <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
          <div className="flex items-center justify-center gap-2 text-green-800">
            <span className="text-2xl">✅</span>
            <p className="font-semibold">Bạn đã đánh giá sản phẩm này rồi</p>
          </div>
        </div>
      )}
    </>
  );
};

export default function DanhGiaSanPham() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const sanPhamID = Number(id);

  const { data: sanPhamList = [] } = useListKhuyenMaiTheoSanPham();
  const { data: danhGias = [] } = useDanhGia(sanPhamID);
  const { user } = useUserStore();
  const addDanhGiaMutation = useAddDanhGiaWithImages();

  const sanPhamChiTiet = sanPhamList.find(
    (sp) => sp.id === sanPhamID
  ) as SanPhamChiTietWithAnhUrls;

  // States
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [showDanhGiaForm, setShowDanhGiaForm] = useState(false);
  const [tieuDe, setTieuDe] = useState("");
  const [textDanhGia, setTextDanhGia] = useState("");
  const [soSao, setSoSao] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    type: "image" | "video";
    url: string;
  } | null>(null);

  // States cho thông báo
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // State để kiểm tra xem user đã mua sản phẩm chưa
  const [hasPurchasedProduct, setHasPurchasedProduct] = useState<
    boolean | null
  >(null);
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(false);

  // Function để kiểm tra xem user đã mua sản phẩm chưa
  const checkUserPurchase = useCallback(async () => {
    if (!user || !sanPhamID) return;

    setIsCheckingPurchase(true);
    try {
      const hoaDons = await HoaDonService.getHoaDonByUserId(user.id);

      // Lọc hóa đơn trong vòng 7 ngày gần nhất
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentHoaDons = hoaDons.filter((hoaDon) => {
        // Kiểm tra trạng thái đơn hàng phải là "Hoàn tất"
        if (hoaDon.trangThai !== "Hoàn tất") {
          return false;
        }

        let hoaDonDate: Date;

        // Xử lý format ngày tháng khác nhau
        if (Array.isArray(hoaDon.ngayTao)) {
          // Format: [2025, 9, 22, 0, 2, 31, 787000000]
          const [year, month, day, hour = 0, minute = 0, second = 0] =
            hoaDon.ngayTao;
          hoaDonDate = new Date(year, month - 1, day, hour, minute, second);
        } else if (typeof hoaDon.ngayTao === "string") {
          // Format: "2025-09-22T00:02:31.787Z" hoặc "2025-09-22"
          hoaDonDate = new Date(hoaDon.ngayTao);
        } else {
          // Format: timestamp hoặc Date object
          hoaDonDate = new Date(hoaDon.ngayTao);
        }

        return hoaDonDate >= sevenDaysAgo;
      });

      // Kiểm tra hóa đơn trong vòng 7 ngày gần nhất
      let hasPurchased = false;

      for (const hoaDon of recentHoaDons) {
        // Tìm thuộc tính chứa chi tiết sản phẩm
        let chiTietArray = hoaDon.hoaDonChiTiet || [];

        if (chiTietArray.length === 0) {
          try {
            // Gọi API lấy chi tiết hóa đơn
            const chiTietSanPham =
              await HoaDonService.getChiTietSanPhamByHoaDonId(hoaDon.id);
            chiTietArray = chiTietSanPham || [];
          } catch {
            continue;
          }
        }

        if (chiTietArray.length === 0) {
          continue;
        }

        const found = chiTietArray.some((chiTiet: unknown) => {
          // Type assertion để truy cập thuộc tính
          const chiTietData = chiTiet as Record<string, unknown>;

          // Thử nhiều cách kiểm tra
          const match1 =
            (chiTietData.spId as Record<string, unknown>)?.id === sanPhamID;
          const match2 =
            typeof chiTietData.spId === "number" &&
            chiTietData.spId === sanPhamID;
          const match3 = chiTietData.idSanPham === sanPhamID;
          const match4 = chiTietData.sanPhamId === sanPhamID;
          const match5 = chiTietData.productId === sanPhamID;
          const match6 =
            (chiTietData.sanPham as Record<string, unknown>)?.id === sanPhamID;

          return match1 || match2 || match3 || match4 || match5 || match6;
        });

        if (found) {
          hasPurchased = true;
          break;
        }
      }
      setHasPurchasedProduct(hasPurchased);
    } catch (error) {
      console.error("Lỗi khi kiểm tra lịch sử mua hàng:", error);
      setHasPurchasedProduct(false);
    } finally {
      setIsCheckingPurchase(false);
    }
  }, [user, sanPhamID]);

  // Kiểm tra khi component mount hoặc user thay đổi
  useEffect(() => {
    if (user && sanPhamID) {
      checkUserPurchase();
    }
  }, [user, sanPhamID, checkUserPurchase]);

  // Các hàm tiện ích và computed values (giữ nguyên)
  // Utility function
  const parseDate = useCallback((dateInput: string | number[]): string => {
    if (!dateInput) return "Chưa có ngày";

    try {
      let date: Date;

      if (Array.isArray(dateInput)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
        date = new Date(year, month - 1, day, hour, minute, second);
      } else if (typeof dateInput === "string") {
        if (dateInput === "null" || dateInput === "undefined")
          return "Chưa có ngày";
        date =
          dateInput.includes("T") || dateInput.includes("Z")
            ? new Date(dateInput)
            : new Date(dateInput.replace(" ", "T"));
      } else {
        date = new Date(dateInput);
      }

      return isNaN(date.getTime())
        ? "Chưa có ngày"
        : date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
    } catch {
      return "Chưa có ngày";
    }
  }, []);
  // Computed values
  const reviewStats = useMemo(() => {
    if (!danhGias.length)
      return {
        average: 0,
        total: 0,
        distribution: {},
        hasComment: 0,
        hasMedia: 0,
      };

    const total = danhGias.length;
    const sum = danhGias.reduce((acc, d) => acc + d.soSao, 0);
    const average = Math.round((sum / total) * 10) / 10;

    const distribution = danhGias.reduce((acc, d) => {
      acc[d.soSao] = (acc[d.soSao] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const hasComment = danhGias.filter((d) => d.textDanhGia?.trim()).length;
    const hasMedia = danhGias.filter(
      (d) => d.anhUrls?.length || d.video
    ).length;

    return { average, total, distribution, hasComment, hasMedia };
  }, [danhGias]);

  const filteredDanhGias = useMemo(() => {
    if (selectedFilter === "all") return danhGias;
    if (["1", "2", "3", "4", "5"].includes(selectedFilter)) {
      return danhGias.filter((d) => d.soSao === Number(selectedFilter));
    }
    if (selectedFilter === "hasComment") {
      return danhGias.filter((d) => d.textDanhGia?.trim());
    }
    if (selectedFilter === "hasMedia") {
      return danhGias.filter((d) => d.anhUrls?.length || d.video);
    }
    return danhGias;
  }, [danhGias, selectedFilter]);

  const hasReviewedProduct = useMemo(
    () => danhGias?.some((danhGia) => danhGia.userId === user?.id),
    [danhGias, user?.id]
  );

  // Handlers (giữ nguyên, nhưng cập nhật tên nếu cần)
  const handleAddDanhGia = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setErrorMessage("Vui lòng đăng nhập để đánh giá sản phẩm");
      setShowErrorModal(true);
      return;
    }

    // Kiểm tra xem user đã mua sản phẩm chưa
    if (hasPurchasedProduct === false) {
      setErrorMessage(
        "Bạn cần mua sản phẩm này trước khi có thể đánh giá. Vui lòng mua hàng và nhận được sản phẩm để có thể chia sẻ trải nghiệm của mình."
      );
      setShowErrorModal(true);
      return;
    }

    // Nếu đang kiểm tra lịch sử mua hàng
    if (isCheckingPurchase) {
      setErrorMessage("Đang kiểm tra lịch sử mua hàng, vui lòng chờ...");
      setShowErrorModal(true);
      return;
    }

    if (!tieuDe.trim() || !textDanhGia.trim()) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin đánh giá");
      setShowErrorModal(true);
      return;
    }

    setShowLoadingModal(true);
    setIsSubmittingReview(true);

    try {
      const reviewData = {
        tieuDe: tieuDe.trim(),
        textDanhGia: textDanhGia.trim(),
        soSao: soSao,
        user_id: user.id,
        sp_id: sanPhamID,
      };

      await addDanhGiaMutation.mutateAsync({
        data: reviewData,
        images: files,
        video: videoFile || undefined,
      });

      // Reset form
      setTieuDe("");
      setTextDanhGia("");
      setSoSao(5);
      setFiles([]);
      setVideoFile(null);
      setShowDanhGiaForm(false);

      setShowLoadingModal(false);
      setShowSuccessModal(true);

      // Tự động ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error: unknown) {
      setShowLoadingModal(false);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi gửi đánh giá";
      setErrorMessage(errorMessage);
      setShowErrorModal(true);
    } finally {
      setIsSubmittingReview(false);
    }
  };
  const handleMediaClick = (media: {
    type: "image" | "video";
    url: string;
  }) => {
    setSelectedMedia(media);
    setShowMediaModal(true);
  };
  return (
    <section
      className="mt-10 pt-8 border-t border-gray-200"
      aria-labelledby="binh-luan-san-pham"
    >
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-3xl font-bold mb-8 text-gray-900 text-center"
          id="binh-luan-san-pham"
        >
          🌟 ĐÁNH GIÁ SẢN PHẨM
        </h2>
        {/* Component tổng quan và bộ lọc */}
        <RatingAndFilterSection
          sanPhamChiTiet={sanPhamChiTiet}
          reviewStats={reviewStats}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          user={user}
          hasReviewedProduct={hasReviewedProduct}
          onShowForm={() => setShowDanhGiaForm(true)}
          showDanhGiaForm={showDanhGiaForm}
          hasPurchasedProduct={hasPurchasedProduct}
          isCheckingPurchase={isCheckingPurchase}
        />
        {/* Form đánh giá mới */}
        {user && showDanhGiaForm && (
          <ReviewForm
            tieuDe={tieuDe}
            setTieuDe={setTieuDe}
            textDanhGia={textDanhGia}
            setTextDanhGia={setTextDanhGia}
            soSao={soSao}
            setSoSao={setSoSao}
            files={files}
            setFiles={setFiles}
            videoFile={videoFile}
            setVideoFile={setVideoFile}
            isSubmitting={isSubmittingReview}
            onFormSubmit={handleAddDanhGia}
            onCancel={() => setShowDanhGiaForm(false)}
          />
        )}
        {/* Danh sách các đánh giá */}
        <ReviewList
          danhGias={filteredDanhGias}
          parseDate={parseDate}
          onMediaClick={handleMediaClick}
          selectedFilter={selectedFilter}
        />
      </div>

      {/* Component thông báo */}
      <QuanLyThongBao
        showLoadingModal={showLoadingModal}
        showSuccessModal={showSuccessModal}
        showErrorModal={showErrorModal}
        errorMessage={errorMessage}
        onCloseSuccess={() => setShowSuccessModal(false)}
        onCloseError={() => setShowErrorModal(false)}
        showMediaModal={showMediaModal}
        selectedMedia={selectedMedia}
        onCloseMedia={() => setShowMediaModal(false)}
      />
    </section>
  );
}
