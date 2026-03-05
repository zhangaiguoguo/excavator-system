export class CreateMachineDto {
  userId: string;
  type: string; // Dictionary: machine_type
  brand: string;
  model: string;
  year: number;
  workHours: string; // Dictionary: work_hours_unit
  rentAmount: number;
  rentUnit: string; // Dictionary: work_hours_unit
  province: string;
  city: string;
  district: string;
  address: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  images: string[];
}
