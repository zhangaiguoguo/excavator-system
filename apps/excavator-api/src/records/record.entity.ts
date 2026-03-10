import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Contract } from '../contracts/contract.entity';
import { Machine } from '../machines/machine.entity';

@Entity('t_finance_record')
export class Record {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'contract_id', type: 'bigint', nullable: true })
  contractId: string;

  @ManyToOne(() => Contract)
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @Column({ name: 'machine_id', type: 'bigint', nullable: true })
  machineId: string;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: 'machine_id' })
  machine: Machine;

  @Column({ type: 'tinyint' })
  type: number; // 1-Income, 2-Expense

  @Column({ type: 'tinyint' })
  category: number; // 1-Rent, 2-Fuel, 3-Repair, 4-Salary, 5-Other

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'record_date', type: 'date' })
  recordDate: Date;

  @Column({ length: 200, nullable: true })
  remark: string;

  @Column({ name: 'voucher_images', type: 'json', nullable: true })
  voucherImages: string[];

  @Column({ name: 'create_by', length: 64, default: '' })
  createBy: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @Column({ name: 'update_by', length: 64, default: '' })
  updateBy: string;

  @UpdateDateColumn({ name: 'update_time', nullable: true })
  updateTime: Date;
}
