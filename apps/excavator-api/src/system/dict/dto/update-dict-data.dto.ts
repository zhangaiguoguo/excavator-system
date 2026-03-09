import { PartialType } from '@nestjs/mapped-types';
import { CreateDictDataDto } from './create-dict-data.dto';

export class UpdateDictDataDto extends PartialType(CreateDictDataDto) {}
