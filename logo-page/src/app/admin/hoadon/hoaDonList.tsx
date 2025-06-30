// src/components/hoa-don/HoaDonList.tsx
import React, { useState } from 'react';

import {  HoaDonDTO } from '@/components/types/hoaDon-types';
import { useHoaDonPaging } from '@/hooks/useHoaDon';

export default function HoaDonList() {
    const [page, setPage] = useState(0);
    const size = 10;

    const { data, isLoading, isError, error } = useHoaDonPaging(page, size);

    if (isLoading) return <p>Đang tải hóa đơn...</p>;
    if (isError) return <p>Lỗi: {error.message}</p>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Danh sách hóa đơn</h2>
            <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border">Mã hóa đơn</th>
                        <th className="p-2 border">Trạng thái</th>
                        <th className="p-2 border">Tên người dùng</th>
                        <th className="p-2 border">Tổng tiền</th>
                        <th className="p-2 border">Ngày tạo</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.content.map((hd: HoaDonDTO) => (
                        <tr key={hd.idHoaDon} className="hover:bg-gray-50">
                            <td className="p-2 border">{hd.idHoaDon}</td> {/* Sửa lại đúng mã hóa đơn */}
                            <td className="p-2 border">{hd.trangThai}</td>
                            <td className="p-2 border">{hd.tennd}</td>
                            <td className="p-2 border">{hd.tongTien?.toLocaleString()} ₫</td>
                            <td className="p-2 border">{new Date(hd.ngayTao).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    disabled={page === 0}
                    className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    Trang trước
                </button>
                <span>
                    Trang {page + 1} / {data?.totalPages ?? 1}
                </span>
                <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page + 1 >= (data?.totalPages ?? 0)}
                    className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    Trang sau
                </button>
            </div>
        </div>
    );
}
