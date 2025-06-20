import { SanPham } from "@/components/types/product.type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBoSuutap } from "@/hooks/useBoSutap";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";

interface Props {
  sanPhams: SanPham[];
  onEdit: (product: SanPham) => void;
  onDelete: (id: number) => void;
}

export default function SanPhamTable({ sanPhams, onDelete, onEdit }: Props) {
  const { data: danhMucs = [] } = useDanhMuc();
  const { data: boSuuTaps = [] } = useBoSuutap();

  const isValidUrl = (url?: string | null): boolean => {
    if (!url || url.trim() === "") return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getTenDanhMuc = (id: number) =>
    danhMucs.find((dm) => dm.id === id)?.tenDanhMuc || "Không rõ";

  const getTenBST = (id: number) =>
    boSuuTaps.find((bst) => bst.id === id)?.tenBoSuuTap || "Không rõ";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>STT</TableHead>
          <TableHead>Mã sản phẩm</TableHead>
          <TableHead>Tên sản phẩm</TableHead>
          <TableHead>Mô tả</TableHead>
          <TableHead>Danh mục</TableHead>
          <TableHead>Bộ sưu tập</TableHead>
          <TableHead>Giá</TableHead>
          <TableHead>Số lượng tồn</TableHead>
          <TableHead>Số lượng mảnh ghép</TableHead>
          <TableHead>Trạng Thái</TableHead>
          <TableHead>Ảnh đại diện</TableHead>
          <TableHead>Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sanPhams.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center">
              Không có sản phẩm nào
            </TableCell>
          </TableRow>
        ) : (
          sanPhams.map((sanPham, index) => (
            <TableRow key={sanPham.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{sanPham.maSanPham}</TableCell>
              <TableCell>{sanPham.tenSanPham}</TableCell>
              <TableCell>{sanPham.moTa}</TableCell>
              <TableCell>{getTenDanhMuc(sanPham.idDanhMuc)}</TableCell>
              <TableCell>{getTenBST(sanPham.idBoSuuTap)}</TableCell>
              <TableCell>{sanPham.gia}</TableCell>
              <TableCell>{sanPham.soLuongTon}</TableCell>
              <TableCell>{sanPham.soLuongManhGhep}</TableCell>
              <TableCell>{sanPham.trangThai}</TableCell>
              <TableCell>
                {isValidUrl(sanPham.anhDaiDien) ? (
                  <div className="w-16 h-16 relative">
                    <Image
                      src={sanPham.anhDaiDien!}
                      alt={sanPham.tenSanPham}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                ) : (
                  "Không có ảnh"
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(sanPham)} title="Chỉnh sửa">
                    <Edit className="w-4 h-4 text-yellow-500" />
                  </button>
                  <button onClick={() => onDelete(sanPham.id)} title="Xóa">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
