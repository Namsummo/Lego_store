export const palette = {
    pageBg: "bg-[#FFF3CC]",
    panelBg: "bg-white",
    chipBg: "bg-[#FFFAE6]",
    text: "text-[#0f172a]",
    subText: "text-slate-600",
    accent: "text-[#006DB7]",
    border: "border border-yellow-400",
    softBorder: "border border-slate-200",
    track: "bg-slate-200",
};

const badgeBase = "px-2 py-0.5 rounded-full text-xs bg-yellow-100";

export const statusBadge = (status: string) => {
    switch (status) {
        case "Đang xử lý":
            return `${badgeBase} text-[#E3000B] border border-red-400`;
        case "Đã xác nhận":
            return `${badgeBase} text-[#006DB7] border border-blue-400`;
        case "Đang đóng gói":
            return `${badgeBase} text-purple-700 border border-purple-400`;
        case "Đang vận chuyển":
            return `${badgeBase} text-indigo-700 border border-indigo-400`;
        case "Đã giao":
        case "Hoàn tất":
            return `${badgeBase} text-green-700 border border-green-400`;
        case "Đã hủy":
            return `${badgeBase} text-red-700 border border-red-400`;
        default:
            return `${badgeBase} text-slate-700 border border-slate-300`;
    }
};