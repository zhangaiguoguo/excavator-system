import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
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
  type: string; // Dictionary: machine_type

  @Column({ length: 50 })
  brand: string;

  @Column({ length: 50 })
  model: string;

  @Column({ type: 'year' })
  year: number;

  @Column({ name: 'work_hours', length: 64 })
  workHours: string; // Dictionary: work_hours_unit

  @Column({ name: 'rent_amount', type: 'decimal', precision: 10, scale: 2 })
  rentAmount: number;

  @Column({ name: 'rent_unit', length: 64 })
  rentUnit: string; // Dictionary: work_hours_unit

  @Column({ length: 50 })
  province: string;

  @Column({ length: 50 })
  city: string;

  @Column({ length: 50 })
  district: string;

  @Column({ length: 200 })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json' })
  images: string[];

  @Column({ length: 64, default: '1' })
  status: string; // Dictionary: machine_status

  @Column({ name: 'is_top', length: 1, default: 'N' })
  isTop: string; // Dictionary: sys_yes_no

  @Column({ name: 'top_expire_at', type: 'datetime', nullable: true })
  topExpireAt: Date;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'contact_count', default: 0 })
  contactCount: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
