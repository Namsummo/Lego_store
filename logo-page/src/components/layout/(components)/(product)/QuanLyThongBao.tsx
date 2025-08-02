import Image from "next/image";
import { ReactNode } from "react";

interface QuanLyThongBaoProps {
  showLoadingModal?: boolean;
  showSuccessModal?: boolean;
  showErrorModal?: boolean;
  errorMessage?: string;
  onCloseSuccess?: () => void;
  onCloseError?: () => void;
  showMediaModal?: boolean;
  selectedMedia?: {
    type: "image" | "video";
    url: string;
  } | null;
  onCloseMedia?: () => void;
}

export default function QuanLyThongBao({
  showLoadingModal = false,
  showSuccessModal = false,
  showErrorModal = false,
  errorMessage = "",
  onCloseSuccess,
  onCloseError,
  showMediaModal = false,
  selectedMedia = null,
  onCloseMedia,
}: QuanLyThongBaoProps) {

  const ModalWrapper = ({ children }: { children: ReactNode }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-xl border border-gray-700 w-full max-w-sm space-y-4">
        {children}
      </div>
    </div>
  );

  return (
    <>
      {showLoadingModal && (
        <ModalWrapper>
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto animate-spin">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v4m0 4v4m0 4v2"
              />
            </svg>
          </div>
          <p className="text-center text-lg font-semibold">
            Đang xử lý đánh giá...
          </p>
        </ModalWrapper>
      )}

      {showSuccessModal && (
        <ModalWrapper>
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-center text-lg font-semibold">
            Đánh giá của bạn đã được gửi thành công.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onCloseSuccess}
              className="bg-green-500 hover:bg-green-600 transition-colors px-4 py-2 rounded-lg text-white text-sm"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                onCloseSuccess?.();
                window.location.reload();
              }}
              className="bg-blue-500 hover:bg-blue-600 transition-colors px-4 py-2 rounded-lg text-white text-sm"
            >
              Xem đánh giá
            </button>
          </div>
        </ModalWrapper>
      )}

      {showErrorModal && (
        <ModalWrapper>
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p className="text-center text-lg font-semibold">Có lỗi xảy ra</p>
          <p className="text-center text-sm text-gray-300">{errorMessage}</p>
          <div className="text-center mt-4">
            <button
              onClick={onCloseError}
              className="bg-red-600 hover:bg-red-700 transition-colors px-4 py-2 rounded-lg text-white text-sm"
            >
              Đóng
            </button>
          </div>
        </ModalWrapper>
      )}

      {showMediaModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
            <button
              onClick={onCloseMedia}
              className="absolute -top-10 right-0 text-white text-3xl hover:text-gray-300"
            >
              ✕
            </button>
            {selectedMedia.type === "image" ? (
              <Image
                src={selectedMedia.url}
                alt="Review image"
                width={800}
                height={600}
                className="w-full h-auto max-h-[90vh] object-contain rounded-xl"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="w-full max-h-[90vh] rounded-xl"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
