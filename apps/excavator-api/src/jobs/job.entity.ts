import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('t_job')
export class Job {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 64 })
  experience: string; // dict: job_experience

  @Column({ name: 'equipment_types', type: 'json' })
  equipmentTypes: string[]; // 多选 machine_type

  @Column({ length: 50 })
  province: string;

  @Column({ length: 50 })
  city: string;

  @Column({ length: 50, nullable: true })
  district: string;

  @Column({ length: 50, nullable: true })
  town: string;

  @Column({ name: 'service_areas_extra', type: 'json', nullable: true })
  serviceAreasExtra: Array<{ province?: string; city?: string; district?: string; town?: string }>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'price_unit', length: 64 })
  priceUnit: string; // dict: work_hours_unit

  @Column({ name: 'work_start_date', type: 'date' })
  workStartDate: Date;

  @Column({ name: 'work_end_date', type: 'date' })
  workEndDate: Date;

  @Column({ name: 'is_long_term', length: 1, default: 'N' })
  isLongTerm: string;

  @Column({ name: 'certificate_images', type: 'json', nullable: true })
  certificateImages: string[]; // 最多3张

  @Column({ name: 'related_equipment', length: 300, nullable: true })
  relatedEquipment: string;

  @Column({ length: 500, nullable: true })
  remark: string;

  @Column({ length: 64, default: '1' })
  status: string; // 1 上架 0 下架

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'contact_count', default: 0 })
  contactCount: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', nullable: true })
  updateTime: Date;
}
