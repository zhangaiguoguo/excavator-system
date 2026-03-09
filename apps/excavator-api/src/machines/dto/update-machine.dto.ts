import { PartialType } from '@nestjs/mapped-types';
import { CreateMachineDto } from './create-machine.dto';

export class UpdateMachineDto extends PartialType(CreateMachineDto) {
  status?: string; // dict: machine_status
  isTop?: string;
  topExpireAt?: Date;
}
