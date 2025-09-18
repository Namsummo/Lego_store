import { FaClipboardList } from "react-icons/fa";
import { MdAssignmentReturn } from "react-icons/md";

interface TabHeaderProps {
    tabIndex: number;
    setTabIndex: (idx: number) => void;
}

export default function TabHeader({ tabIndex, setTabIndex }: TabHeaderProps) {
    return (
        <div
            className="w-full"
            style={{
                background: "#1a2233", // xanh đen
                borderRadius: "0.5rem 0.5rem 0 0",
                padding: "1rem 2rem",
                transition: "background 0.4s cubic-bezier(.4,0,.2,1)",
            }}
        >
            <div className="flex gap-6">
                <button
                    className={`flex items-center gap-2 text-lg font-semibold px-4 py-2 rounded-lg relative
            ${tabIndex === 0
                            ? "text-[#ffb86b] bg-[#232b3e] shadow transition-all duration-300"
                            : "text-[#ffb86b]/80 bg-transparent transition-all duration-300"
                        }`}
                    style={{
                        border: "none",
                        outline: "none",
                        boxShadow: tabIndex === 0 ? "0 2px 8px 0 rgba(0,0,0,0.07)" : "none",
                        transition: "all 0.25s cubic-bezier(.4,0,.2,1)"
                    }}
                    onClick={() => setTabIndex(0)}
                >
                    <FaClipboardList className="text-2xl transition-all duration-300" />
                    <span>Quản Lý Đơn Hàng</span>
                    {tabIndex === 0 && (
                        <span
                            className="absolute left-0 bottom-0 w-full h-[3px] rounded bg-gradient-to-r from-[#ffb86b] to-[#ffcb8b] transition-all duration-300"
                        />
                    )}
                </button>
                <button
                    className={`flex items-center gap-2 text-lg font-semibold px-4 py-2 rounded-lg relative
            ${tabIndex === 1
                            ? "text-[#50aaff] bg-[#232b3e] shadow transition-all duration-300"
                            : "text-[#50aaff]/80 bg-transparent transition-all duration-300"
                        }`}
                    style={{
                        border: "none",
                        outline: "none",
                        boxShadow: tabIndex === 1 ? "0 2px 8px 0 rgba(0,0,0,0.07)" : "none",
                        transition: "all 0.25s cubic-bezier(.4,0,.2,1)"
                    }}
                    onClick={() => setTabIndex(1)}
                >
                    <MdAssignmentReturn className="text-2xl transition-all duration-300" />
                    <span>Quản Lý Hoàn Hàng</span>
                    {tabIndex === 1 && (
                        <span
                            className="absolute left-0 bottom-0 w-full h-[3px] rounded bg-gradient-to-r from-[#50aaff] to-[#9fdcff] transition-all duration-300"
                        />
                    )}
                </button>
            </div>
        </div>
    );
}