import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('t_user_favorite')
export class Favorite {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'ref_type', length: 20 })
  refType: string; // machine | demand | job

  @Column({ name: 'ref_id', type: 'bigint' })
  refId: string;

  @Column({ name: 'create_by', length: 64, default: '' })
  createBy: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
