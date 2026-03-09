import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DictData as IDictData } from '@excavator/types';

@Entity('sys_dict_data')
export class DictData implements IDictData {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'dict_sort', type: 'int', default: 0, comment: '字典排序' })
  dictSort: number;

  @Column({ name: 'dict_label', length: 100, comment: '字典标签' })
  dictLabel: string;

  @Column({ name: 'dict_value', length: 100, comment: '字典键值' })
  dictValue: string;

  @Column({ name: 'dict_type', length: 100, comment: '字典类型' })
  dictType: string;

  @Column({ name: 'css_class', length: 100, nullable: true, comment: '样式属性（其他样式扩展）' })
  cssClass: string;

  @Column({ name: 'list_class', length: 100, nullable: true, comment: '表格回显样式' })
  listClass: string;

  @Column({ name: 'is_default', type: 'tinyint', default: 0, comment: '是否默认（1是 0否）' })
  isDefault: number;

  @Column({ type: 'tinyint', default: 0, comment: '状态（0正常 1停用）' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', nullable: true })
  updateTime: Date;
}
