/** 文件项：存库与接口统一用 JSON { fileId, fileName } */
export interface FileItemDto {
  fileId: string;
  fileName: string;
}

export class CreateMachineDto {
  userId: string;
  type: string; // dict: machine_type
  brand?: string;
  model: string;
  year?: number;
  conditionType: string; // dict: machine_condition
  rentAmount: number;
  rentUnit: string; // dict: work_hours_unit
  rentStartDate?: string; // YYYY-MM-DD
  rentEndDate?: string;
  isLongTerm?: string; // Y | N
  province: string;
  city: string;
  district: string;
  town?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  images: FileItemDto[]; // 1-5 张，每项 { fileId, fileName }
  video?: FileItemDto | string; // 单个，{ fileId, fileName } 或兼容旧 string
}
