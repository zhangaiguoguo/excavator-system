import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Machine } from '../machines/machine.entity';

@Entity('t_contract')
export class Contract {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'contract_no', length: 32, unique: true })
  contractNo: string;

  @Column({ name: 'machine_id', type: 'bigint', nullable: true })
  machineId: string;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: 'machine_id' })
  machine: Machine;

  @Column({ name: 'demand_id', type: 'bigint', nullable: true })
  demandId: string;

  @Column({ name: 'lessor_id', type: 'bigint' })
  lessorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'lessor_id' })
  lessor: User;

  @Column({ name: 'lessee_id', type: 'bigint' })
  lesseeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'lessee_id' })
  lessee: User;

  @Column({ name: 'template_id', type: 'bigint' })
  templateId: string;

  @Column({ name: 'content_hash', length: 64 })
  contentHash: string;

  @Column({ name: 'pdf_url', length: 255, nullable: true })
  pdfUrl: string;

  @Column({ name: 'lessor_sign_status', type: 'tinyint', default: 0 })
  lessorSignStatus: number;

  @Column({ name: 'lessee_sign_status', type: 'tinyint', default: 0 })
  lesseeSignStatus: number;

  @Column({ name: 'sign_expire_at', type: 'datetime', nullable: true })
  signExpireAt: Date;

  @Column({ type: 'tinyint', default: 0 })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
