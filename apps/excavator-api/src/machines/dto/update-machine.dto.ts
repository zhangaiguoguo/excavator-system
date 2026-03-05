import { PartialType } from '@nestjs/mapped-types';
import { CreateMachineDto } from './create-machine.dto';

export class UpdateMachineDto extends PartialType(CreateMachineDto) {
  status?: string; // Dictionary: machine_status
  isTop?: string; // Dictionary: sys_yes_no
  topExpireAt?: Date;
}
