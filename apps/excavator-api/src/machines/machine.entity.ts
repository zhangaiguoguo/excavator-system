import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('t_machine')
export class Machine {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 64 })
  type: string; // dict: machine_type 挖斗/炮头/挖掘机整机/其他

  @Column({ length: 50, nullable: true })
  brand: string;

  @Column({ length: 100 })
  model: string;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ name: 'condition_type', length: 64 })
  conditionType: string; // dict: machine_condition 全新/9成新/8成新/7成新及以下

  @Column({ name: 'rent_amount', type: 'decimal', precision: 10, scale: 2 })
  rentAmount: number;

  @Column({ name: 'rent_unit', length: 64 })
  rentUnit: string; // dict: work_hours_unit 元/小时、元/天、元/月

  @Column({ name: 'rent_start_date', type: 'date', nullable: true })
  rentStartDate: Date;

  @Column({ name: 'rent_end_date', type: 'date', nullable: true })
  rentEndDate: Date;

  @Column({ name: 'is_long_term', length: 1, default: 'N' })
  isLongTerm: string; // dict: sys_yes_no

  @Column({ length: 50 })
  province: string;

  @Column({ length: 50 })
  city: string;

  @Column({ length: 50 })
  district: string;

  @Column({ length: 50, nullable: true })
  town: string;

  @Column({ length: 200 })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ type: 'json' })
  images: Array<{ fileId: string; fileName: string }>;

  @Column({ type: 'json', nullable: true })
  video: { fileId: string; fileName: string } | string | null;

  @Column({ length: 64, default: '1' })
  status: string; // dict: machine_status

  @Column({ name: 'is_top', length: 1, default: 'N' })
  isTop: string;

  @Column({ name: 'top_expire_at', type: 'datetime', nullable: true })
  topExpireAt: Date;

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
