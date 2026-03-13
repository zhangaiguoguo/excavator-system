import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('t_chat_message')
export class ChatMessage {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'ref_type', length: 32 })
  @Index('idx_chat_ref_type')
  refType: string; // machine | demand

  @Column({ name: 'ref_id', type: 'bigint' })
  @Index('idx_chat_ref_id')
  refId: string;

  @Column({ name: 'from_user_id', type: 'bigint' })
  @Index('idx_chat_from_user')
  fromUserId: string;

  @Column({ name: 'to_user_id', type: 'bigint', nullable: true })
  @Index('idx_chat_to_user')
  toUserId: string | null;

  @Column({ type: 'varchar', length: 512 })
  content: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}

