"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, RotateCcw, Star } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useGetPhieuGiam, useGetPhieuGiamGiaNoiBat } from "@/hooks/usePhieuGiam";
import { PhieuGiamGia } from "@/components/types/phieugiam.type";
import { viPhieuGiamService } from "@/services/viPhieuGiamService";
import { toast } from "sonner";

interface VoucherPrize {
    id: number;
    name: string;
    discount: string;
    probability: number;
    color: string;
    bgColor: string;
}

const getUserIdFromLocalStorage = (): number | null => {
    try {
        const stored = localStorage.getItem("lego-store");
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        return parsed?.state?.user?.id ?? null;
    } catch (err) {
        console.error("Lỗi lấy userId:", err);
        return null;
    }
};

const getColorByIndex = (index: number): string => {
    const colors = ["text-blue-600", "text-blue-700", "text-blue-800", "text-blue-900", "text-indigo-600", "text-indigo-700"];
    return colors[index % colors.length];
};

const getBgColorByIndex = (index: number): string => {
    const bgColors = [
        "bg-gradient-to-r from-blue-200 to-blue-400",
        "bg-gradient-to-r from-blue-300 to-blue-500",
        "bg-gradient-to-r from-blue-400 to-blue-600",
        "bg-gradient-to-r from-blue-500 to-blue-700",
        "bg-gradient-to-r from-indigo-200 to-indigo-400",
        "bg-gradient-to-r from-indigo-300 to-indigo-500"
    ];
    return bgColors[index % bgColors.length];
};

export default function LuckyWheel() {
    const { data: phieuGiamList, isLoading } = useGetPhieuGiamGiaNoiBat();
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [selectedPrize, setSelectedPrize] = useState<VoucherPrize | null>(null);
    const [showResult, setShowResult] = useState(false);
    const wheelRef = useRef<HTMLDivElement>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const controls = useAnimation();

    useEffect(() => {
        const id = getUserIdFromLocalStorage();
        setUserId(id);
    }, []);

    React.useEffect(() => {
        if (phieuGiamList) {
            console.log("Voucher API FE trạngThai:", phieuGiamList.map(v => v.trangThai));
        }
    }, [phieuGiamList]);

    const voucherPrizes: VoucherPrize[] = React.useMemo(() => {
        const activeList = phieuGiamList?.filter(
            (phieu: PhieuGiamGia) =>
                phieu.trangThai && phieu.trangThai.trim().toLowerCase() === "active"
        ) || [];

        const prizes: VoucherPrize[] = [];

        if (activeList.length > 0) {
            activeList.forEach((phieu: PhieuGiamGia, index: number) => {
                prizes.push({
                    id: phieu.id,
                    name: phieu.tenPhieu || `Voucher ${index + 1}`,
                    discount: phieu.loaiPhieuGiam === "theo_phan_tram"
                        ? `${phieu.giaTriGiam}% OFF`
                        : `${phieu.giaTriGiam.toLocaleString()}₫ OFF`,
                    probability: Math.max(5, 25 - index * 3),
                    color: getColorByIndex(index),
                    bgColor: getBgColorByIndex(index)
                });
            });

            while (prizes.length < 6) {
                prizes.push({
                    id: -(prizes.length + 1),
                    name: `May mắn lần sau`,
                    discount: "Chúc bạn may mắn lần sau!",
                    probability: 50,
                    color: "text-gray-600",
                    bgColor: "bg-gradient-to-r from-gray-200 to-gray-400"
                });
            }
        } else {
            for (let i = 0; i < 6; i++) {
                prizes.push({
                    id: -i,
                    name: `May mắn lần sau`,
                    discount: "Chúc bạn may mắn lần sau!",
                    probability: 50,
                    color: "text-gray-600",
                    bgColor: "bg-gradient-to-r from-gray-200 to-gray-400"
                });
            }
        }

        // Normalize probabilities
        const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
        return prizes.map(prize => ({
            ...prize,
            probability: (prize.probability / totalProbability) * 100
        }));
    }, [phieuGiamList]);

    const getToday = () => {
        const d = new Date();
        return d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
    };

    const [spinsLeft, setSpinsLeft] = useState(1);

    useEffect(() => {
        try {
            const lastSpinDate = localStorage.getItem('luckyWheelLastSpinDate');
            const today = getToday();
            const now = new Date();
            if (lastSpinDate === today) {
                const lastSpinTime = localStorage.getItem('luckyWheelLastSpinTime');
                if (lastSpinTime) {
                    const lastSpin = new Date(lastSpinTime);
                    const diffMs = now.getTime() - lastSpin.getTime();
                    const diffHours = diffMs / (1000 * 60 * 60);
                    if (diffHours < 24) {
                        setTimeLeft(Math.floor((24 - diffHours) * 3600));
                        setSpinsLeft(0);
                    } else {
                        setSpinsLeft(1);
                    }
                }
            } else {
                setSpinsLeft(1);
            }
        } catch (err) {
            console.error("Lỗi truy cập localStorage:", err);
            setSpinsLeft(1);
        }
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (timeLeft > 0 && spinsLeft === 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setSpinsLeft(1);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [timeLeft, spinsLeft]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const spinWheel = async () => {
        if (isSpinning || spinsLeft <= 0) return;

        setIsSpinning(true);
        setShowResult(false);
        setSelectedPrize(null);

        // Thêm nhiều vòng quay để tạo hiệu ứng
        const minSpins = 4;
        const maxSpins = 7;
        const randomSpins = minSpins + Math.random() * (maxSpins - minSpins);
        const spinRotation = randomSpins * 360;

        // Random góc cuối cùng để tạo tính ngẫu nhiên
        const finalAngle = Math.random() * 360;
        const newRotation = rotation + spinRotation + finalAngle;

        const spinDuration = 3.5 + Math.random() * 1.5;
        const easingCurve = [0.25, 0.1, 0.25, 1.0];

        await controls.start({
            rotate: newRotation,
            transition: {
                duration: spinDuration,
                ease: easingCurve,
                type: "tween"
            }
        });

        setRotation(newRotation);
        setSpinsLeft(0);
        try {
            localStorage.setItem('luckyWheelLastSpinDate', getToday());
            localStorage.setItem('luckyWheelLastSpinTime', new Date().toISOString());
        } catch (err) {
            console.error("Lỗi lưu localStorage:", err);
        }

        const resultDelay = 800 + Math.random() * 400;


        setTimeout(async () => {
            setIsSpinning(false);
            setShowResult(true);

            const segmentAngle = 360 / voucherPrizes.length;
            const normalizedAngle = ((newRotation % 360) + 360) % 360;

            const angleAtPointer = (360 - normalizedAngle + segmentAngle / 2) % 360;

            const selectedPrizeIndex = Math.round(angleAtPointer / segmentAngle) % voucherPrizes.length;

            const prize = voucherPrizes[selectedPrizeIndex];
            setSelectedPrize(prize);

            // Xử lý nhận phiếu
            if (prize.id > 0 && userId) {
                try {
                    await viPhieuGiamService.themPhieuGiamChoUser({
                        userId: Number(userId),
                        phieuGiamGiaId: prize.id,
                    });
                    toast.success(`🎉 Chúc mừng! Bạn đã nhận được ${prize.name}: ${prize.discount}!`);
                } catch (error) {
                    const err = error as any;
                    let message = "Lỗi không xác định khi thêm phiếu giảm giá.";
                    try {
                        const parsed = JSON.parse(err.message);
                        message = parsed.message;
                    } catch {
                        message = err?.response?.data?.message || err.message || "Lỗi kết nối mạng.";
                    }

                    if (message.includes("đã nhận")) {
                        toast.error("❌ Bạn đã nhận phiếu giảm giá này rồi!");
                    } else {
                        toast.error(`❌ ${message}`);
                    }
                }
            } else if (prize.id <= 0) {
                toast.info("😔 Chúc bạn may mắn lần sau!");
            } else if (!userId) {
                toast.warning("⚠️ Vui lòng đăng nhập để nhận phiếu giảm giá!");
            }
        }, resultDelay);

    };

    const resetWheel = () => {
        if (isSpinning) return; // Prevent reset during spin
        setSpinsLeft(1);
        setSelectedPrize(null);
        setShowResult(false);
        setRotation(0);
        setTimeLeft(0);
        controls.start({ rotate: 0 });
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-lg">
                    <CardContent className="flex items-center justify-center py-12">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="rounded-full h-12 w-12 border-t-4 border-indigo-600 mx-auto mb-4"
                        />
                        <p className="text-gray-600 text-lg">Đang tải phiếu giảm giá...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (voucherPrizes.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-lg">
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Gift className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                            <p className="text-2xl font-semibold text-gray-700">Hiện không có voucher nào đang hoạt động.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-8 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-2xl border-2 border-blue-600 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="relative w-full lg:w-1/2 p-6">
                    <h1 className="text-4xl font-extrabold text-blue-700 text-center mb-6 drop-shadow-md">
                        Vòng Quay May Mắn 3D
                    </h1>
                    <motion.div
                        className="relative w-80 h-80 mx-auto"
                    >
                        <motion.div
                            ref={wheelRef}
                            className="absolute inset-0 rounded-full border-4 border-white shadow-2xl"
                            animate={controls}
                            style={{
                                transformOrigin: "center",
                                background: voucherPrizes.length > 0 ? `conic-gradient(${voucherPrizes.map((_, i) => {
                                    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#a8edea', '#ff9a9e', '#ffecd2'];
                                    const segmentSize = 360 / voucherPrizes.length;
                                    const start = segmentSize * i;
                                    const end = segmentSize * (i + 1);
                                    return `${colors[i % colors.length]} ${start}deg ${end}deg`;
                                }).join(', ')})` : 'conic-gradient(#667eea 0deg 60deg, #f093fb 60deg 120deg, #4facfe 120deg 180deg, #43e97b 180deg 240deg, #fa709a 240deg 300deg, #a8edea 300deg 360deg)'
                            }}
                        >
                            {voucherPrizes.map((prize, index) => {
                                const segmentAngle = 360 / voucherPrizes.length;
                                const angle = segmentAngle * index + segmentAngle / 2;
                                const radius = 120;
                                const x = 50 + (radius / 3) * Math.cos((angle - 90) * Math.PI / 180);
                                const y = 50 + (radius / 3) * Math.sin((angle - 90) * Math.PI / 180);

                                return (
                                    <div
                                        key={`text-${prize.id || index}`}
                                        className="absolute font-bold text-center pointer-events-none"
                                        style={{
                                            left: `${x}%`,
                                            top: `${y}%`,
                                            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                                            fontSize: '12px',
                                            fontWeight: '900',
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                            zIndex: 20,
                                            width: '80px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#ffffff'
                                        }}
                                    >
                                        <span style={{
                                            wordBreak: 'break-word',
                                            lineHeight: '1.2',
                                            textAlign: 'center'
                                        }}>
                                            {prize.name || `Giải ${index + 1}`}
                                        </span>
                                    </div>
                                );
                            })}

                            {Array.from({ length: voucherPrizes.length }).map((_, index) => {
                                const angle = (360 / voucherPrizes.length) * index;
                                return (
                                    <div
                                        key={`divider-${index}`}
                                        className="absolute bg-white"
                                        style={{
                                            width: '2px',
                                            height: '50%',
                                            left: '50%',
                                            top: '0%',
                                            transformOrigin: 'bottom center',
                                            transform: `translateX(-50%) rotate(${angle}deg)`,
                                            zIndex: 15,
                                            opacity: 0.7
                                        }}
                                    />
                                );
                            })}

                            <div
                                className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center"
                                style={{
                                    background: 'radial-gradient(circle, #ffffff 0%, #f0f0f0 100%)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.8)',
                                    border: '3px solid #ddd'
                                }}
                            >
                                <Star className="w-6 h-6 text-yellow-500" />
                            </div>
                        </motion.div>

                        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-40">
                            <div
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderTop: '20px solid transparent',
                                    borderBottom: '20px solid transparent',
                                    borderRight: '40px solid #ff4757',
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                }}
                            />
                        </div>
                    </motion.div>
                    <motion.div
                        className="text-center mt-4 text-sm text-gray-600 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Thời gian còn lại để quay tiếp
                    </motion.div>
                    <div className="text-center text-2xl font-bold text-blue-700">{formatTime(timeLeft)}</div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 disabled:from-gray-400 disabled:to-gray-500 text-lg py-6 rounded-xl shadow-lg"
                            disabled={isSpinning || spinsLeft <= 0}
                            onClick={spinWheel}
                        >
                            {isSpinning ? "ĐANG QUAY..." : spinsLeft > 0 ? "QUAY NGAY!" : "ĐÃ QUAY HÔM NAY"}
                        </Button>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-4"
                    >
                        {/* <Button
                            className="w-full bg-gray-800 text-white hover:bg-gray-900 text-sm py-4 rounded-xl shadow"
                            onClick={resetWheel}
                            disabled={isSpinning}
                        >
                            <RotateCcw className="w-5 h-5 mr-2" /> Đặt Lại Vòng Quay
                        </Button> */}
                    </motion.div>
                </div>

                <motion.div
                    className="w-full lg:w-1/2 p-6"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-bold text-blue-800 text-center mb-6 drop-shadow-md">
                        Bảng Phiếu Giảm Giá
                    </h2>
                    <div className="space-y-3">
                        {voucherPrizes.map((prize) => (
                            <motion.div
                                key={prize.id}
                                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                whileHover={{ scale: 1.02 }}
                            >
                                <span className="text-blue-800 font-medium">{prize.name}</span>
                                <Badge variant="outline" className={`${prize.color} border-2 font-bold`}>{prize.discount}</Badge>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {showResult && selectedPrize && (
                <motion.div
                    className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                >
                    <motion.div
                        className="bg-gradient-to-br from-white to-gray-100 p-6 text-center relative rounded-xl shadow-2xl max-w-sm w-full border-2 border-blue-200"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, type: "spring" }}
                    >
                        <motion.div
                            className="absolute inset-0 rounded-xl"
                            style={{ boxShadow: "0 0 15px rgba(59, 130, 246, 0.4)" }}
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />

                        <div className="relative z-10">
                            <div className="text-4xl mb-3">
                                {selectedPrize.id > 0 ? "🎉" : "😔"}
                            </div>
                            <div className="text-xl font-bold text-blue-700 mb-3">
                                {selectedPrize.id > 0 ? "Chúc Mừng!" : "Chúc Bạn May Mắn Lần Sau!"}
                            </div>
                            <div className="text-lg font-semibold text-gray-800 mb-2">
                                {selectedPrize.name}
                            </div>
                            <div className="text-md font-medium text-blue-600 mb-4">
                                {selectedPrize.discount}
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                                    onClick={() => setShowResult(false)}
                                >
                                    Đóng
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}


