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
  trangThai: number;
  role_id: number;
  ngayTao?: number[];
  role?: Role;  
}
