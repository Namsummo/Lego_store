'use client';
import { useUserStore } from '@/context/authStore.store';
import { useWishList } from '@/hooks/useWishList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Plus, Edit, Share2, Package, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';
import { WishListModal } from '@/components/layout/(components)/(wishlist)/WishListModal';
import { WishListProductCard } from '@/components/layout/(components)/(wishlist)/WishListProductCard';
import { ConfirmDeleteDialog } from '@/components/layout/(components)/(wishlist)/ConfirmDeleteDialog';
import { ShareWishListDialog } from '@/components/layout/(components)/(wishlist)/ShareWishListDialog';
import { toast, Toaster } from 'sonner';
import { WishListProduct } from '@/components/types/wishlist-type';
import { SuccessNotification } from '@/components/ui/success-notification';

interface LocalCartItem {
    id: number;
    name: string;
    image: string;
    price: number;
    quantity: number;
}

export default function FavoritesPage() {
    const { user } = useUserStore();
    const [selectedWishList, setSelectedWishList] = useState<number | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editWishList, setEditWishList] = useState<{ id: number; ten: string } | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [wishListToDelete, setWishListToDelete] = useState<{ id: number; ten: string } | null>(null);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showAddToCartSuccess, setShowAddToCartSuccess] = useState(false);

    const {
        useGetWishLists,
        useGetWishListProducts,
        useDeleteWishList,
        useRemoveFromWishList
    } = useWishList();

    const { data: wishLists, isLoading: loadingWishLists, error: wishListsError } = useGetWishLists(user?.id || 0);
    const { data: wishListProducts, isLoading: loadingProducts } = useGetWishListProducts(selectedWishList || 0);

    // Tạo state để lưu số lượng sản phẩm và tổng giá của mỗi wish list
    const [wishListProductCounts, setWishListProductCounts] = useState<{ [key: number]: number }>({});
    const [wishListTotalCosts, setWishListTotalCosts] = useState<{ [key: number]: number }>({});
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [selectedWishlistForShare, setSelectedWishlistForShare] = useState<{ id: number; name: string } | null>(null);
    const deleteWishList = useDeleteWishList();
    const removeFromWishList = useRemoveFromWishList();

    // Hàm thêm vào giỏ hàng localStorage
    const addToCartLocal = (product: WishListProduct) => {
        let cart: LocalCartItem[] = [];
        try {
            const cartData = localStorage.getItem("cartItems");
            cart = cartData ? JSON.parse(cartData) : [];
        } catch (error) {
            console.error("Lỗi khi đọc giỏ hàng từ localStorage:", error);
            cart = [];
        }

        const index = cart.findIndex((item: LocalCartItem) => item.id === product.spId);
        if (index !== -1) {
            cart[index].quantity += 1;
        } else {
            cart.push({
                id: product.spId,
                name: product.tenSP,
                image: product.anhSps?.[0]?.url || "",
                price: product.giaKM || product.gia,
                quantity: 1,
            });
        }
        localStorage.setItem("cartItems", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));

        // Hiển thị thông báo thành công đẹp thay vì toast
        setShowAddToCartSuccess(true);
        setTimeout(() => {
            setShowAddToCartSuccess(false);
        }, 3000);
    };

    // Hàm thêm tất cả vào giỏ hàng với thông báo đẹp
    const addAllToCartLocal = (products: WishListProduct[]) => {
        let cart: LocalCartItem[] = [];
        try {
            const cartData = localStorage.getItem("cartItems");
            cart = cartData ? JSON.parse(cartData) : [];
        } catch (error) {
            console.error("Lỗi khi đọc giỏ hàng từ localStorage:", error);
            cart = [];
        }

        // Thêm tất cả sản phẩm vào giỏ hàng
        products.forEach(product => {
            const index = cart.findIndex((item: LocalCartItem) => item.id === product.spId);
            if (index !== -1) {
                cart[index].quantity += 1;
            } else {
                cart.push({
                    id: product.spId,
                    name: product.tenSP,
                    image: product.anhSps?.[0]?.url || "",
                    price: product.giaKM || product.gia,
                    quantity: 1,
                });
            }
        });

        localStorage.setItem("cartItems", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));

        // Hiển thị thông báo thành công đẹp
        setShowAddToCartSuccess(true);
        setTimeout(() => {
            setShowAddToCartSuccess(false);
        }, 3000);
    };

    const handleRemoveFromWishList = async (spId: number) => {
        if (!selectedWishList) return;
        try {
            await removeFromWishList.mutateAsync({ wishlistId: selectedWishList, spId });
            // Không hiện thông báo gì cả
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Có lỗi xảy ra khi xóa sản phẩm khỏi yêu thích');
        }
    };

    const handleShareWishList = (wishList: { id: number; ten: string }) => {
        setSelectedWishlistForShare({ id: wishList.id, name: wishList.ten });
        setShowShareDialog(true);
    };

    const confirmDeleteWishList = (wishList: { id: number; ten: string }) => {
        if (!wishList || !wishList.id) {
            toast.error('Dữ liệu yêu thích không hợp lệ');
            return;
        }
        setWishListToDelete(wishList);
        setShowDeleteDialog(true);
    };

    const handleDeleteWishList = async (wishListId: number) => {
        try {
            await deleteWishList.mutateAsync(wishListId);

            if (selectedWishList === wishListId) {
                setSelectedWishList(null);
            }
            setShowDeleteDialog(false);
            setWishListToDelete(null);

            // Hiển thị thông báo thành công đẹp
            setSuccessMessage('Đã xóa yêu thích thành công!');
            setShowSuccessNotification(true);
            setTimeout(() => {
                setShowSuccessNotification(false);
            }, 3000);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Có lỗi xảy ra khi xóa yêu thích');
        }
    };



    // Lấy số lượng sản phẩm và tổng giá cho mỗi wish list
    useEffect(() => {
        if (wishLists && wishLists.length > 0) {
            const fetchProductData = async () => {
                const counts: { [key: number]: number } = {};
                const totalCosts: { [key: number]: number } = {};

                for (const wishList of wishLists) {
                    try {
                        const response = await fetch(`http://localhost:8080/api/lego-store/san-pham-yeu-thich/user/${wishList.id}`, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            },
                        });

                        if (response.ok) {
                            const products: WishListProduct[] = await response.json();
                            counts[wishList.id] = products.length;
                            // Tính tổng giá cho wish list này
                            const totalCost = products.reduce((total: number, product: WishListProduct) =>
                                total + (product.giaKM || product.gia), 0);
                            totalCosts[wishList.id] = totalCost;
                        } else {
                            counts[wishList.id] = 0;
                            totalCosts[wishList.id] = 0;
                        }
                    } catch (error) {
                        console.error(`Error fetching products for wishlist ${wishList.id}:`, error);
                        counts[wishList.id] = 0;
                        totalCosts[wishList.id] = 0;
                    }
                }

                setWishListProductCounts(counts);
                setWishListTotalCosts(totalCosts);
            };

            fetchProductData();
        }
    }, [wishLists, selectedWishList, wishListProducts]);

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h2>
                    <p className="text-gray-600">Bạn cần đăng nhập để xem wish list</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh sách yêu thích</h1>
                </div>

                {/* Create Wish List Card */}
                <Card className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Bạn thích gì, chúng tôi đều ghi nhớ!
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Tạo danh sách yêu thích mới hoặc quản lý danh sách hiện tại của bạn tại đây.
                                    Bạn có thể thêm hoặc xóa sản phẩm, đặt tên cho các danh sách để dễ theo dõi,
                                    và thậm chí tạo và lưu các wish list riêng biệt cho các dịp hoặc sự kiện khác nhau.
                                </p>
                                <Button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tạo danh sách yêu thích mới
                                </Button>
                            </div>
                            <div className="hidden md:block">
                                <div className="flex space-x-2">
                                    <Heart className="w-8 h-8 text-orange-400" />
                                    <Heart className="w-6 h-6 text-orange-300" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Wish Lists */}
                {wishListsError ? (
                    <div className="text-center py-8">
                        <p className="text-red-600 mb-4">Lỗi khi tải danh sách yêu thích: {wishListsError.message}</p>
                        <Button onClick={() => window.location.reload()} variant="outline">
                            Thử lại
                        </Button>
                    </div>
                ) : loadingWishLists ? (
                    <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full" />
                        ))}
                    </div>
                ) : wishLists && wishLists.length > 0 ? (
                    <div className="space-y-6">
                        {wishLists.map((wishList) => {
                            const isSelected = selectedWishList === wishList.id;
                            const products = isSelected ? wishListProducts || [] : [];
                            const totalCost = wishListTotalCosts[wishList.id] || 0;
                            const lastUpdated = new Date().toLocaleDateString('vi-VN');

                            return (
                                <Card key={wishList.id} className={`transition-all duration-200 bg-white border-2 hover:border-orange-300 ${isSelected ? 'ring-2 ring-orange-500 shadow-lg' : 'border-gray-200'}`}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {wishList.ten} ({wishListProductCounts[wishList.id] !== undefined ? wishListProductCounts[wishList.id] : '...'})
                                                </h3>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditWishList(wishList);
                                                            setShowCreateModal(true);
                                                        }}
                                                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => confirmDeleteWishList(wishList)}
                                                        disabled={deleteWishList.isPending}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedWishList(isSelected ? null : wishList.id)}
                                                    className="border-orange-300 text-orange-600"
                                                    style={{
                                                        backgroundColor: 'transparent',
                                                        transition: 'none'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.borderColor = '#fdba74';
                                                        e.currentTarget.style.color = '#ea580c';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.borderColor = '#fdba74';
                                                        e.currentTarget.style.color = '#ea580c';
                                                    }}
                                                >
                                                    {isSelected ? 'Ẩn sản phẩm' : 'Xem sản phẩm'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleShareWishList(wishList)}
                                                    className="border-green-300 text-green-600"
                                                    style={{
                                                        backgroundColor: 'transparent',
                                                        transition: 'none'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.borderColor = '#86efac';
                                                        e.currentTarget.style.color = '#16a34a';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.borderColor = '#86efac';
                                                        e.currentTarget.style.color = '#16a34a';
                                                    }}
                                                >
                                                    <Share2 className="w-4 h-4 mr-2" />
                                                    Chia sẻ
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-600">
                                            <span>Cập nhật lần cuối: {lastUpdated}</span>
                                            <span className="font-semibold">Tổng giá: {formatPrice(totalCost)}</span>
                                        </div>
                                    </CardHeader>

                                    {isSelected && (
                                        <CardContent>
                                            {loadingProducts ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {[...Array(3)].map((_, i) => (
                                                        <Skeleton key={i} className="h-48 w-full" />
                                                    ))}
                                                </div>
                                            ) : products.length > 0 ? (
                                                <>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="font-medium text-gray-900">Sản phẩm trong wish list</h4>
                                                        <Button
                                                            onClick={() => {
                                                                addAllToCartLocal(products);
                                                            }}
                                                            className="bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                                                        >
                                                            <Package className="w-4 h-4 mr-2" />
                                                            Thêm tất cả vào giỏ hàng
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                        {products.map((product) => (
                                                            <WishListProductCard
                                                                key={product.id}
                                                                product={product}
                                                                wishlistId={selectedWishList!}
                                                                onRemove={handleRemoveFromWishList}
                                                                onAddToCart={addToCartLocal}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Heart className="mx-auto h-12 w-12 text-orange-300 mb-4" />
                                                    <p className="text-gray-600">Chưa có sản phẩm nào trong wish list này</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Heart className="mx-auto h-12 w-12 text-orange-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Chưa có wish list nào
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Tạo wish list đầu tiên để bắt đầu lưu trữ sản phẩm yêu thích
                        </p>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo wish list đầu tiên
                        </Button>
                    </div>
                )}
            </div>

            {/* Create/Edit Wish List Modal */}
            <WishListModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setEditWishList(null);
                }}
                userId={user?.id || 0}
                editWishList={editWishList}
                onSuccess={(message) => {
                    setSuccessMessage(message);
                    setShowSuccessNotification(true);
                    setTimeout(() => {
                        setShowSuccessNotification(false);
                    }, 3000);
                }}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDeleteDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setWishListToDelete(null);
                }}
                onConfirm={() => {
                    if (wishListToDelete && wishListToDelete.id) {
                        handleDeleteWishList(wishListToDelete.id);
                    } else {
                        toast.error('Không thể xác định wish list cần xóa');
                    }
                }}
                title="Xóa Wish List"
                message={`Bạn có chắc muốn xóa wish list "${wishListToDelete?.ten}"? Hành động này không thể hoàn tác.`}
                isLoading={deleteWishList.isPending}
            />

            {/* Toaster */}
            <Toaster position="top-center" richColors />

            {/* Share Wish List Dialog */}
            {selectedWishlistForShare && (
                <ShareWishListDialog
                    isOpen={showShareDialog}
                    onClose={() => {
                        setShowShareDialog(false);
                        setSelectedWishlistForShare(null);
                    }}
                    wishlistName={selectedWishlistForShare.name}
                    wishlistId={selectedWishlistForShare.id}
                />
            )}

            {/* Success Notification */}
            <SuccessNotification
                isVisible={showSuccessNotification}
                message={successMessage}
                onClose={() => setShowSuccessNotification(false)}
            />

            {/* Thông báo thêm giỏ hàng thành công */}
            {showAddToCartSuccess && (
                <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-8 flex flex-col items-center shadow-2xl max-w-sm w-full mx-4 border border-gray-700">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-xl font-semibold text-white text-center leading-tight">
                            Sản phẩm đã được thêm vào Giỏ hàng
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
} 