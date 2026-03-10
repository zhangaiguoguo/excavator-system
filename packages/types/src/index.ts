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
    OPERATOR = 3,
    UNKNOWN = 0
}

export enum UserRealNameStatus {
    NOT_SUBMITTED = 0,
    PENDING = 1,
    APPROVED = 2,
    REJECTED = 3
}

export interface LoginResponse {
    access_token: string;
    user: User;
}

export interface DictType {
    id: string;
    dictName: string;
    dictType: string;
    status: number;
    remark?: string;
    createTime: Date;
    updateTime: Date;
}

export interface DictData {
    id: string;
    dictSort: number;
    dictLabel: string;
    dictValue: string;
    dictType: string;
    cssClass?: string;
    listClass?: string;
    isDefault: number; // 0 no, 1 yes
    status: number; // 0 normal, 1 disabled
    remark?: string;
    createTime: Date;
    updateTime: Date;
}

export enum Constants {
    DEFAULT_PHOTO = "Unknown",
    YES = "Y",
    NO = "N",
}