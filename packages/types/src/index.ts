export interface User {
  id: string;
  wxOpenid: string;
  unionId?: string;
  phone: string;
  nickname?: string;
  avatar?: string;
  gender: number;
  role: number;
  realName?: string;
  idCard?: string;
  realNameStatus: number;
  companyName?: string;
  creditCode?: string;
  status: number;
  lastLoginAt?: Date;
  createTime: Date;
  updateTime: Date;
  password?: string;
}

export enum UserRole {
  OWNER = 1,
  CONSTRUCTOR = 2,
  OPERATOR = 3
}

export interface LoginResponse {
  access_token: string;
  user: User;
}
