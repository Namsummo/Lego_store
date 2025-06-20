'use client'

import React from 'react';
import { ToastContainer } from 'react-toastify';
import PromotionManagement from './PromotionManagement';

export default function AdminKhuyenMaiPage() {
    return (
        <div className="">
            <PromotionManagement />

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
}
