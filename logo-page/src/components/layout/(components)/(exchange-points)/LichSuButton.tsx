"use client";

import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

interface LichSuButtonProps {
  onClick: () => void;
  count?: number;
}

export function LichSuButton({ onClick, count = 0 }: LichSuButtonProps) {
  return (
    <Button
      onClick={onClick} 
      className="bg-blue-50 border-2 border-blue-500 hover:bg-blue-100 text-blue-700 hover:text-blue-800 transition-colors font-semibold px-8 py-3 rounded-lg hover:scale-105"
    >
      <History className="h-4 w-4 mr-2" />
      Lịch Sử Đổi Điểm
      {count > 0 && (
        <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
          {count}
        </span>
      )}
    </Button>
  );
}
