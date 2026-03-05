import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User as IUser } from '@excavator/types';

@Entity('t_user')
export class User implements IUser {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string; // BigInt is returned as string in JS/TS when using TypeORM

  @Column({ name: 'wx_openid', length: 64, unique: true })
  wxOpenid: string;

  @Column({ name: 'union_id', length: 64, nullable: true })
  unionId: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 50, nullable: true })
  nickname: string;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'tinyint', default: 0 })
  gender: number;

  @Column({ type: 'tinyint', default: 1 })
  role: number;

  @Column({ name: 'real_name', length: 50, nullable: true })
  realName: string;

  @Column({ name: 'id_card', length: 32, nullable: true })
  idCard: string;

  @Column({ name: 'real_name_status', type: 'tinyint', default: 0 })
  realNameStatus: number;

  @Column({ name: 'company_name', length: 100, nullable: true })
  companyName: string;

  @Column({ name: 'credit_code', length: 32, nullable: true })
  creditCode: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @Column({ length: 100, nullable: true })
  password?: string;
}
