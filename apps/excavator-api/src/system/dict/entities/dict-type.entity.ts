import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DictType as IDictType } from '@excavator/types';

@Entity('sys_dict_type')
export class DictType implements IDictType {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'dict_name', length: 100, comment: '字典名称' })
  dictName: string;

  @Column({ name: 'dict_type', length: 100, unique: true, comment: '字典类型' })
  dictType: string;

  @Column({ type: 'tinyint', default: 0, comment: '状态（0正常 1停用）' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', nullable: true })
  updateTime: Date;
}
