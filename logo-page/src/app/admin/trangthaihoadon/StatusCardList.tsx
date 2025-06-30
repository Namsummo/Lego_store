import React from "react";
import {
  LucideIcon,
  Package,
  Loader2,
  Truck,
  CheckCircle2,
  Ban,
} from "lucide-react";

const statusIcons: Record<string, LucideIcon> = {
  PENDING: Loader2,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: Ban,
};

interface StatusCardListProps {
  statusCounts: {
    value: string;
    label: string;
    border: string;
    count: number;
  }[];
  filterStatus: string;
  onCardClick: (status: string) => void;
}

export const StatusCardList: React.FC<StatusCardListProps> = ({
  statusCounts,
  filterStatus,
  onCardClick,
}) => (
  <div className="flex flex-wrap items-center justify-center gap-0 mb-12">
    {statusCounts.map((st, index) => {
      const Icon = statusIcons[st.value] || Package;
      const isActive = filterStatus === st.value;

      return (
        <React.Fragment key={st.value}>
          <button
            onClick={() => onCardClick(st.value)}
            className={`
              group relative w-48 h-24 p-6 rounded-2xl transition-all duration-300
              flex flex-col justify-between items-start
              border ${st.border} bg-white/5 text-left
              shadow-sm hover:shadow-lg
              ${isActive ? "bg-white/10 border-opacity-100" : "border-opacity-30"}
              hover:border-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-400
            `}
            tabIndex={0}
          >
            <span className="text-sm text-gray-300 mb-1 tracking-wide">
              {st.label}
            </span>
            <div className="flex justify-between items-center w-full">
              <span className="text-4xl font-bold text-white">{st.count}</span>
              <Icon className="w-8 h-8 text-blue-300 group-hover:text-blue-400 transition-colors duration-200" />
            </div>
          </button>

          {/* Gạch nối ngang */}
          {index < statusCounts.length - 1 && (
            <div className="w-4 h-1 bg-gray-600 mx-1 rounded-full opacity-40" />
          )}
        </React.Fragment>
      );
    })}
  </div>
);
