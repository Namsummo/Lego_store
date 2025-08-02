'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { KhuyenMaiTheoSanPham } from '@/components/types/khuyenmai-type';
import { AnhSanPhamChiTiet } from '@/components/types/product.type';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Props {
  products: KhuyenMaiTheoSanPham[];
  searchTerm: string;
  onSearch: (term: string) => void;
  onAddToCart: (product: KhuyenMaiTheoSanPham) => void;
  cart: { id: number; quantity: number }[];
  pendingOrders: { items: { id: number; quantity: number }[] }[];
}

const ProductList: React.FC<Props> = ({ products, searchTerm, onSearch, onAddToCart, cart, pendingOrders }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  function getAvailableStock(
    productId: number,
    products: KhuyenMaiTheoSanPham[],
    cart: { id: number; quantity: number }[],
    pendingOrders: { items: { id: number; quantity: number }[] }[]
  ): number {
    const inCart = cart.find((item) => item.id === productId)?.quantity || 0;
    const inPending = pendingOrders
      .flatMap((order) => order.items)
      .filter((item) => item.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);

    const product = products.find((p) => p.id === productId);
    return (product?.soLuongTon || 0) - inCart - inPending;
  }

  const getMainImageUrl = (anhUrls: AnhSanPhamChiTiet[] | undefined) => {
    if (!anhUrls || anhUrls.length === 0) {
      return '/images/avatar-admin.png';
    }

    const mainImg = anhUrls.find((img) => img.anhChinh);
    const imgToUse = mainImg || anhUrls[0];

    if (imgToUse && imgToUse.url) {
      const imageUrl = `http://localhost:8080/api/anhsp/images/${imgToUse.url}`;
      return imageUrl;
    }

    return '/images/avatar-admin.png';
  };

  // Tính toán sản phẩm cho trang hiện tại
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage]);

  // Tính tổng số trang
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Reset về trang 1 khi search thay đổi
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-3/5 flex flex-col h-full">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10 bg-background/70 border-white/20 text-white placeholder:text-gray-400 text-lg py-6 rounded-xl"
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 pr-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 m-3 pb-4">
            {paginatedProducts.map((product: KhuyenMaiTheoSanPham) => {
              const image = getMainImageUrl(product.anhUrls);
              const isOutOfStock = getAvailableStock(product.id, products, cart, pendingOrders) <= 0;
              return (
                <motion.div key={product.id} whileHover={{ y: -6, scale: 1.03 }} transition={{ duration: 0.15 }}>
                  <Card
                    onClick={() => !isOutOfStock && onAddToCart(product)}
                    className={`h-full flex flex-col justify-between cursor-pointer rounded-xl shadow-md border-2 border-transparent hover:border-primary/70 transition-all bg-gradient-to-br from-slate-800 to-slate-700 ${isOutOfStock ? 'opacity-60 pointer-events-none' : 'hover:shadow-xl'}`}
                  >
                    <CardContent className="flex flex-col items-center text-center flex-1 justify-between p-2">
                      <div className="w-20 h-20 rounded-lg overflow-hidden mb-2 bg-white/10 relative border border-primary/20">
                        <Image
                          src={image}
                          alt={product.tenSanPham}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                        {isOutOfStock && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow">Hết hàng</span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white line-clamp-2 mb-1">{product.tenSanPham}</h3>
                      <p className="text-xs text-primary font-bold mb-1">
                        {product.giaKhuyenMai != null && product.giaKhuyenMai > 0 && product.giaKhuyenMai < product.gia ? (
                          <>
                            <span className="text-sm text-yellow-400 font-extrabold">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.giaKhuyenMai)}
                            </span>
                            <span className="ml-1 text-gray-400 line-through text-[10px]">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-yellow-400 font-extrabold">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.gia)}
                          </span>
                        )}
                      </p>
                      <p className={`text-xs ${isOutOfStock ? 'text-red-400' : 'text-gray-400'} font-medium`}>Kho: {getAvailableStock(product.id, products, cart, pendingOrders)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {paginatedProducts.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-10">Không tìm thấy sản phẩm nào.</p>
          )}
        </ScrollArea>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-3 py-2 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Hiển thị {((currentPage - 1) * productsPerPage) + 1}-{Math.min(currentPage * productsPerPage, products.length)} của {products.length} sản phẩm
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 ${currentPage === pageNum
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                        : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                        }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
