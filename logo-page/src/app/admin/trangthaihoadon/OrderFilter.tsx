import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrderFilterProps {
  search: string;
  setSearch: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  STATUS: { value: string; label: string }[];
  filterPayment: string;
  setFilterPayment: (v: string) => void;
  paymentMethods: { value: string; label: string }[];
}
export const OrderFilter: React.FC<OrderFilterProps> = ({
  search, setSearch, filterStatus, setFilterStatus, STATUS,
  filterPayment, setFilterPayment, paymentMethods = []
}) => (
  <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
    <Input
      className="md:w-1/2 bg-[#232b3b] border border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500 shadow-md text-white placeholder-gray-400 rounded-lg transition-all duration-200 ease-in-out"
      placeholder="Tìm kiếm khách hàng hoặc dịch vụ..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    <Select value={filterStatus} onValueChange={setFilterStatus}>
      <SelectTrigger className="w-40 bg-[#232b3b] border border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500 shadow-md text-white rounded-lg transition-all duration-200 ease-in-out">
        <SelectValue placeholder="Tất cả trạng thái" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả trạng thái</SelectItem>
        {STATUS.map((st) => (
          <SelectItem key={st.value} value={st.value}>
            {st.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {/* Select lọc phương thức thanh toán */}
    {setFilterPayment && (
      <Select value={filterPayment} onValueChange={setFilterPayment}>
        <SelectTrigger className="w-40 bg-[#232b3b] border border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500 shadow-md text-white rounded-lg transition-all duration-200 ease-in-out">
          <SelectValue placeholder="Tất cả thanh toán" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả thanh toán</SelectItem>
          {paymentMethods.map((pm) => (
            <SelectItem key={pm} value={pm}>
              {pm}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  </div>
);
