
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EnrichedOrder } from "./types";
import OrderCard from "./OrderCard";


interface OrderListProps {
    orders: EnrichedOrder[];
    productImages: Record<number, string>;
    handleViewDetail: (order: EnrichedOrder) => void;
    handleCancelOrder: (orderId: number) => void;
    handleConfirmDelivery: (orderId: number) => void;
    handleReorder: (order: EnrichedOrder) => void;
    cancelingId: number | null;
    reorderingId: number | null;
}

export default function OrderList({
    orders,
    productImages,
    handleViewDetail,
    handleCancelOrder,
    handleConfirmDelivery,
    handleReorder,
    cancelingId,
    reorderingId,
}: OrderListProps) {
    return (
        <AnimatePresence>
            <div className="space-y-4">
                {orders.map((order, index) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.06 }}
                    >
                        <OrderCard
                            order={order}
                            productImages={productImages}
                            handleViewDetail={handleViewDetail}
                            handleCancelOrder={handleCancelOrder}
                            handleConfirmDelivery={handleConfirmDelivery}
                            handleReorder={handleReorder}
                            cancelingId={cancelingId}
                            reorderingId={reorderingId}
                        />
                    </motion.div>
                ))}
            </div>
        </AnimatePresence>
    );
}
