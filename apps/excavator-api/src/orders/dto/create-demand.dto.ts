/** 需求方发布需求 PRD 4.3：求租设备 / 招聘机手 */
export class CreateDemandDto {
  userId: string;
  type: string; // '1' 求租设备 | '2' 招聘机手
  machineTypes: string[]; // 所需机型/设备类型
  province: string;
  city: string;
  district: string;
  address: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  budgetMin?: number;
  budgetMax?: number;
  description: string;
  images?: string[]; // 至少1张，最多5张
  video?: string; // 选填
  isUrgent?: string; // 'Y' | 'N'
}
