import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('t_comment')
export class Comment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'ref_type', length: 20 })
  refType: string; // 'machine' | 'demand'

  @Column({ name: 'ref_id', type: 'bigint' })
  refId: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 500 })
  content: string;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
