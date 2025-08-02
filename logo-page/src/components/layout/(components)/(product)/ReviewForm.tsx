import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2, Star, X, ImageIcon, Video } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface ReviewFormProps {
  tieuDe: string;
  setTieuDe: (value: string) => void;
  textDanhGia: string;
  setTextDanhGia: (value: string) => void;
  soSao: number;
  setSoSao: (value: number) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  videoFile: File | null;
  setVideoFile: (file: File | null) => void;
  isSubmitting: boolean;
  onFormSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function ReviewForm({
  tieuDe,
  setTieuDe,
  textDanhGia,
  setTextDanhGia,
  soSao,
  setSoSao,
  files,
  setFiles,
  videoFile,
  setVideoFile,
  isSubmitting,
  onFormSubmit,
  onCancel,
}: ReviewFormProps) {
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Refs để lưu trữ URLs cho cleanup
  const imageUrlsRef = useRef<string[]>([]);
  const videoUrlRef = useRef<string | null>(null);

  // Tạo preview URLs khi files thay đổi
  useEffect(() => {
    // Cleanup old URLs
    imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));

    // Tạo URLs mới
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(newUrls);
    imageUrlsRef.current = newUrls;

    // Cleanup khi component unmount
    return () => {
      newUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  // Tạo preview URL cho video
  useEffect(() => {
    // Cleanup old URL
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
    }

    // Tạo URL mới
    if (videoFile) {
      const newUrl = URL.createObjectURL(videoFile);
      setVideoPreviewUrl(newUrl);
      videoUrlRef.current = newUrl;

      // Cleanup khi component unmount
      return () => {
        URL.revokeObjectURL(newUrl);
      };
    } else {
      setVideoPreviewUrl(null);
      videoUrlRef.current = null;
    }
  }, [videoFile]);

  // Cleanup URLs khi component unmount
  useEffect(() => {
    return () => {
      imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setVideoFile(selectedFile);
  };

  const removeImagePreview = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);

    // Reset input để có thể chọn lại cùng file
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const removeVideoPreview = () => {
    setVideoFile(null);

    // Reset input để có thể chọn lại cùng file
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFormSubmit(e);

    // Cleanup URLs after submit if successful
    imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
    }
    setImagePreviewUrls([]);
    setVideoPreviewUrl(null);
    imageUrlsRef.current = [];
    videoUrlRef.current = null;
  };

  const handleCancel = () => {
    // Cleanup URLs when canceling
    imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
    }
    setImagePreviewUrls([]);
    setVideoPreviewUrl(null);
    imageUrlsRef.current = [];
    videoUrlRef.current = null;
    onCancel();
  };

  return (
    <div className="mb-8 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 shadow-lg">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 text-center">
        Chia sẻ trải nghiệm của bạn
      </h3>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="space-y-6">
          {/* Tiêu đề đánh giá */}
          <div className="space-y-2">
            <Label htmlFor="review-title" className="text-base font-medium">
              Tiêu đề đánh giá
            </Label>
            <Input
              id="review-title"
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              placeholder="Ví dụ: 'Sản phẩm tuyệt vời!'"
              className="h-12 text-base border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500"
              required
            />
          </div>

          {/* Nội dung đánh giá */}
          <div className="space-y-2">
            <Label htmlFor="review-content" className="text-base font-medium">
              Nội dung đánh giá
            </Label>
            <Textarea
              id="review-content"
              value={textDanhGia}
              onChange={(e) => setTextDanhGia(e.target.value)}
              placeholder="Chia sẻ chi tiết về trải nghiệm của bạn với sản phẩm..."
              className="min-h-[120px] text-base border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500"
              required
            />
            <p className="text-sm text-muted-foreground">
              Hãy chia sẻ những điều bạn thích hoặc chưa thích về sản phẩm
            </p>
          </div>

          {/* Đánh giá sao */}
          <div className="space-y-3">
            <Label className="text-base font-medium block">
              Đánh giá của bạn
            </Label>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Button
                    key={i}
                    type="button"
                    onClick={() => setSoSao(i)}
                    className="p-0 h-auto bg-transparent hover:bg-transparent focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={`transition-colors ${i <= soSao
                        ? "text-yellow-400 fill-yellow-400 hover:text-yellow-500"
                        : "text-gray-300 hover:text-gray-400"
                        }`}
                    />
                  </Button>
                ))}
              </div>
              <span className="text-lg font-semibold">
                {soSao} {soSao > 1 ? "sao" : "sao"}
              </span>
            </div>
          </div>

          {/* Upload media */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Upload ảnh */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium text-gray-800">
                <ImageIcon className="h-5 w-5 text-emerald-500" />
                Thêm ảnh
              </Label>
              <Label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors bg-gray-50/50"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Nhấn để chọn ảnh</span> hoặc
                    kéo thả
                  </p>
                  <p className="text-xs text-gray-400">
                    JPEG, PNG (Tối đa 3 ảnh)
                  </p>
                </div>
              </Label>
              <Input
                ref={imageInputRef}
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {files.length > 0 && (
                <div className="text-sm text-emerald-600 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Đã chọn {files.length} ảnh
                </div>
              )}

              {/* Preview ảnh */}
              {imagePreviewUrls.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Preview ảnh:
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => removeImagePreview(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-md"
                          title="Xóa ảnh"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload video */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium text-gray-800">
                <Video className="h-5 w-5 text-rose-500" />
                Thêm video
              </Label>
              <Label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-rose-500 transition-colors bg-gray-50/50"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Video className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Nhấn để chọn video</span>{" "}
                    hoặc kéo thả
                  </p>
                  <p className="text-xs text-gray-400">MP4 (Tối đa 1 video)</p>
                </div>
              </Label>
              <Input
                ref={videoInputRef}
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
              {videoFile && (
                <div className="text-sm text-rose-600 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Đã chọn video: {videoFile.name}
                </div>
              )}

              {/* Preview video */}
              {videoPreviewUrl && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Preview video:
                  </Label>
                  <div className="relative group">
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                      preload="metadata"
                    />
                    <button
                      type="button"
                      onClick={removeVideoPreview}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-md"
                      title="Xóa video"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      Video
                    </div>
                  </div>
                  {videoFile && (
                    <p className="text-xs text-gray-500">
                      Tên file: {videoFile.name}
                      {videoFile.size &&
                        ` • Kích thước: ${(
                          videoFile.size /
                          (1024 * 1024)
                        ).toFixed(1)}MB`}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-base shadow-sm hover:shadow-md transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Gửi đánh giá
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold text-base shadow-sm hover:shadow-md transition-all"
            >
              <X className="h-5 w-5 mr-2" />
              Hủy bỏ
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
