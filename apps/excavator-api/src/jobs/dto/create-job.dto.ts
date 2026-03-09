/** 揽活方发布揽活信息 PRD 4.2.2 */
export class CreateJobDto {
  userId: string;
  experience: string; // dict: job_experience
  equipmentTypes: string[]; // 多选 dict: machine_type
  province: string;
  city: string;
  district?: string;
  town?: string;
  serviceAreasExtra?: Array<{ province?: string; city?: string; district?: string; town?: string }>;
  price: number;
  priceUnit: string; // dict: work_hours_unit
  workStartDate: string;
  workEndDate: string;
  isLongTerm?: string;
  certificateImages?: string[];
  relatedEquipment?: string;
  remark?: string;
}
