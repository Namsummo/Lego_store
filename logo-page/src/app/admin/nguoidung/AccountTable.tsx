"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { DTOUser, Role } from "@/components/types/account.type";
import { parseBackendDate } from "@/utils/dateUtils";

type DTOUserWithId = DTOUser & { id: number };

type AccountTableProps = {
  accounts: DTOUserWithId[];
  roles: Role[];
  onEdit: (acc: DTOUserWithId) => void;
  onDelete: (acc: DTOUserWithId) => void;
  type: "employee" | "customer" | "inactive";
};

const AccountTable: React.FC<AccountTableProps> = ({
  accounts,
  roles,
  onEdit,
  onDelete,
}) => {

  const getRoleName = (roleId: number | string | null | undefined) => {
    if (!roleId || !roles || roles.length === 0) return "Không xác định";

    const id = typeof roleId === "string" ? Number(roleId) : roleId;
    const foundRole = roles.find((r) => r.id === id);

    return foundRole?.name || "Không xác định";
  };

  console.log("Roles list:", roles);
  console.log("Account role_ids:", accounts.map((a) => a.role_id));
  
  return (
    <div className="rounded-md border mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Họ tên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>SĐT</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {accounts.map((acc, idx) => (
            <TableRow key={acc.id}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{acc.ten}</TableCell>
              <TableCell>{acc.email}</TableCell>
              <TableCell>{acc.sdt}</TableCell>
              <TableCell>
                {acc.ngayTao
                  ? parseBackendDate(acc.ngayTao)?.toLocaleString("vi-VN") ?? "-"
                  : "-"}
              </TableCell>
              <TableCell>{acc.diaChi}</TableCell>

              {/* TÊN VAI TRÒ */}
              <TableCell>
                {typeof acc.role_id === "number" && roles.find((r) => r.id === acc.role_id) ? (
                  <Badge variant="outline">{getRoleName(acc.role_id)}</Badge>
                ) : (
                  <Badge variant="destructive">Sai role ID: {String(acc.role_id)}</Badge>
                )}
              </TableCell>

              {/* Trạng thái */}
              <TableCell>
                {acc.trangThai === 1 ? (
                  <Badge variant="default" className="bg-green-600">
                    Hoạt động
                  </Badge>
                ) : (
                  <Badge variant="destructive">Ngừng hoạt động</Badge>
                )}
              </TableCell>

              {/* Action */}
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="icon" onClick={() => onEdit(acc)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(acc)}
                  disabled={acc.trangThai === 0}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AccountTable;
