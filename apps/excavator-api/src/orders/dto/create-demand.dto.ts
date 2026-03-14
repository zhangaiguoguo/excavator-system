/** 文件项：存库与接口统一用 JSON { fileId, fileName } */
export interface FileItemDto {
  fileId: string;
  fileName: string;
}

/** 需求方发布需求 PRD 4.3：求租设备 / 招聘机手 */
export class CreateDemandDto {
  userId: string;
  type: string; // '1' 求租设备 | '2' 招聘机手
  machineTypes: string[]; // 所需机型/设备类型
  machineTypeOther?: string; // 选「其他」时填写的设备说明
  province: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  address: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetUnit?: string; // dict: work_hours_unit
  description: string;
  images?: FileItemDto[]; // 至少1张，最多5张，每项 { fileId, fileName }
  video?: FileItemDto | string; // 选填，{ fileId, fileName } 或兼容旧 string
  isUrgent?: string; // 'Y' | 'N'
}
