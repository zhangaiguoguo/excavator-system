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

  @Column({ type: 'tinyint' })
  type: number; // 1-Rental, 2-Recruitment

  @Column({ name: 'machine_types', type: 'json' })
  machineTypes: string[];

  @Column({ length: 50 })
  province: string;

  @Column({ length: 50 })
  city: string;

  @Column({ length: 50 })
  district: string;

  @Column({ length: 200 })
  address: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'budget_min', type: 'decimal', precision: 10, scale: 2, nullable: true })
  budgetMin: number;

  @Column({ name: 'budget_max', type: 'decimal', precision: 10, scale: 2, nullable: true })
  budgetMax: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'is_urgent', type: 'tinyint', default: 0 })
  isUrgent: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 0-Closed, 1-Active, 2-Completed

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'contact_count', default: 0 })
  contactCount: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
