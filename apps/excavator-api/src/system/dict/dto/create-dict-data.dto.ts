export class CreateDictDataDto {
  dictSort: number;
  dictLabel: string;
  dictValue: string;
  dictType: string;
  cssClass?: string;
  listClass?: string;
  isDefault: number;
  status: number;
  remark?: string;
}
