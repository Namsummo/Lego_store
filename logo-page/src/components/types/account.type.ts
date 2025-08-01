export interface Role {
  id: number;
  name: string;
}

export interface DTOUser {
  id?: number;
  ten: string;
  email: string;
  matKhau: string;
  sdt: string;
  diaChi: string;
  ngaySinh?: string | Date;
  trangThai: number;
  role_id: number;
  ngayTao?: number[];
  role?: Role;
}


export type DTOUserWithId = DTOUser & {
  id: number;
};
