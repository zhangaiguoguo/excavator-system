import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('t_demand')
export class Order {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 64 })
  type: string; // dict: demand_type 1求租设备 2招聘机手

  @Column({ name: 'machine_types', type: 'json' })
  machineTypes: string[];

  /** 选「其他」设备时填写的说明 */
  @Column({
    name: 'machine_type_other',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  machineTypeOther: string | null;

  @Column({ length: 50 })
  province: string;

  @Column({ length: 50 })
  city: string;

  @Column({ length: 50 })
  district: string;

  @Column({ length: 200 })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'budget_min', type: 'decimal', precision: 10, scale: 2, nullable: true })
  budgetMin: number;

  @Column({ name: 'budget_max', type: 'decimal', precision: 10, scale: 2, nullable: true })
  budgetMax: number;

  /** 预算单位 (dict: work_hours_unit) 元/天、元/小时等 */
  @Column({ name: 'budget_unit', type: 'varchar', length: 32, nullable: true })
  budgetUnit: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json', nullable: true })
  images: Array<{ fileId: string; fileName: string }>;

  @Column({ type: 'json', nullable: true })
  video: { fileId: string; fileName: string } | string | null;

  @Column({ name: 'is_urgent', length: 1, default: 'N' })
  isUrgent: string; // dict: sys_yes_no

  @Column({ length: 64, default: '1' })
  status: string; // dict: demand_status 0已关闭 1进行中 2已完成

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'contact_count', default: 0 })
  contactCount: number;

  @Column({ name: 'create_by', length: 64, default: '' })
  createBy: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @Column({ name: 'update_by', length: 64, default: '' })
  updateBy: string;

  @UpdateDateColumn({ name: 'update_time', nullable: true })
  updateTime: Date;
}
