import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('t_notification')
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ length: 32 })
  type: string; // contract_invite | contract_signed | system

  @Column({ length: 128 })
  title: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  content: string;

  @Column({ name: 'ref_type', length: 32, nullable: true })
  refType: string; // contract | demand | machine

  @Column({ name: 'ref_id', type: 'bigint', nullable: true })
  refId: string;

  @Column({ name: 'is_read', type: 'tinyint', default: 0 })
  isRead: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
