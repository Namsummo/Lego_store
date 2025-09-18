import StickyHeader from "@/components/layout/(components)/(pages)/StickyHeader";
import Footer from "@/components/layout/(components)/(pages)/Footer";
import Link from "next/link";

export default function LuckyWheelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <StickyHeader />

            {/* Breadcrumb */}
            <div className="w-full pt-24 relative z-10">
                <div className="bg-gray-200 shadow-sm border-b border-gray-100 p-4">
                    <div className="max-w-6xl mx-auto">
                        <nav className="flex items-center space-x-2 text-sm text-gray-600">
                            <Link href="/" className="hover:text-blue-600 transition-colors">
                                Trang Chủ
                            </Link>
                            <span className="text-gray-400">{'>'}</span>
                            <span className="text-gray-900 font-medium">
                                Cờ Caro
                            </span>
                        </nav>
                    </div>
                </div>
            </div>

            <main className="flex-1 relative z-10">
                {children}
            </main>

            <Footer />
        </div>
    );
} 