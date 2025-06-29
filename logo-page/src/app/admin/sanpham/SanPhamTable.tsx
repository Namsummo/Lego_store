import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash2 } from "lucide-react";
import { useBoSuutap } from "@/hooks/useBoSutap";
import { useDanhMuc } from "@/hooks/useDanhMuc";
import { SanPham } from "@/components/types/product.type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AnhSanPhamManager from "./AnhSanPhamManager";

interface Props {
  sanPhams: SanPham[];
  onEdit: (product: SanPham) => void;
  onDelete: (id: number) => void;
}

export default function SanPhamTable({ sanPhams, onDelete, onEdit }: Props) {
  const { data: danhMucs = [] } = useDanhMuc();
  const { data: boSuuTaps = [] } = useBoSuutap();

  const getTenDanhMuc = (id: number) =>
    danhMucs.find((dm) => dm.id === id)?.tenDanhMuc || "Không rõ";

  const getTenBST = (id: number) =>
    boSuuTaps.find((bst) => bst.id === id)?.tenBoSuuTap || "Không rõ";

  return (
    <Table className="border-3 border-blue-900">
      <TableHeader>
        <TableRow>
          <TableHead>STT</TableHead>
          <TableHead>Mã sản phẩm</TableHead>
          <TableHead>Tên sản phẩm</TableHead>
          <TableHead>Mô tả</TableHead>
          <TableHead>Danh mục</TableHead>
          <TableHead>Bộ sưu tập</TableHead>
          <TableHead>Độ tuổi</TableHead>
          <TableHead>Giá</TableHead>
          <TableHead>Số lượng tồn</TableHead>
          <TableHead>Số lượng mảnh ghép</TableHead>
          <TableHead>Trạng Thái</TableHead>
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
              <TableCell className="max-w-[170px] truncate">
                {sanPham.moTa
                  ? sanPham.moTa.length > 100
                    ? sanPham.moTa.slice(0, 100) + "..."
                    : sanPham.moTa
                  : ""}
              </TableCell>
              <TableCell>{getTenDanhMuc(sanPham.idDanhMuc)}</TableCell>
              <TableCell>{getTenBST(sanPham.idBoSuuTap)}</TableCell>
              <TableCell>{sanPham.doTuoi}</TableCell>
              <TableCell>{sanPham.gia}</TableCell>
              <TableCell>{sanPham.soLuongTon}</TableCell>
              <TableCell>{sanPham.soLuongManhGhep}</TableCell>
              <TableCell>
                {sanPham.trangThai === "Đang kinh doanh" ? (
                  <span className="text-green-600 font-semibold">
                    Đang kinh doanh
                  </span>
                ) : (
                  <span className="text-red-300 font-semibold">
                    Ngừng kinh doanh
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <AnhSanPhamManager
                    sanPhamId={sanPham.id}
                    maSanPham={sanPham.maSanPham ?? ""}
                    tenSanPham={sanPham.tenSanPham}
                    trigger={
                      <Button title="Ảnh sản phẩm">
                        <Eye className="size-4 text-black" />
                      </Button>
                    }
                  />
                  <Button onClick={() => onEdit(sanPham)} title="Chỉnh sửa">
                    <Edit className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button onClick={() => onDelete(sanPham.id)} title="Xóa">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
