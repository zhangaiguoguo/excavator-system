export class CreateMachineDto {
  userId: string;
  type: string; // dict: machine_type
  brand?: string;
  model: string;
  year?: number;
  conditionType: string; // dict: machine_condition
  rentAmount: number;
  rentUnit: string; // dict: work_hours_unit
  rentStartDate: string; // YYYY-MM-DD
  rentEndDate: string;
  isLongTerm?: string; // Y | N
  province: string;
  city: string;
  district: string;
  town?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  images: string[]; // 1-5 张
  video?: string; // 最多 1 个
}
