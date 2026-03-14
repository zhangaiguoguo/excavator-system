import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './chat-message.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { getRequiredUserId } from '../common/get-user-id';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatRepo: Repository<ChatMessage>,
  ) {}

  @Get('messages')
  async listMessages(
    @Query('refType') refType: string,
    @Query('refId') refId: string,
    @Query('otherUserId') otherUserId?: string,
    @Request() req?: any,
  ) {
    if (!refType || !refId) {
      return { list: [], total: 0 };
    }
    const userId = getRequiredUserId(req || {});

    const qb = this.chatRepo
      .createQueryBuilder('m')
      .where('m.ref_type = :refType', { refType })
      .andWhere('m.ref_id = :refId', { refId })
      .orderBy('m.create_time', 'ASC');

    // 如果指定了会话双方，只取当前会话两个人之间的消息
    if (otherUserId) {
      qb.andWhere(
        '( (m.from_user_id = :me AND m.to_user_id = :other) OR (m.from_user_id = :other AND (m.to_user_id = :me OR m.to_user_id IS NULL)) )',
        { me: userId, other: otherUserId },
      );
    } else {
      // 否则默认只返回当前用户相关的消息
      qb.andWhere(
        '(m.from_user_id = :me OR m.to_user_id = :me)',
        { me: userId },
      );
    }

    const list = await qb.getMany();
    return { list, total: list.length };
  }

  /** 会话列表（微信式：按会话分组，每条会话取最新一条消息） */
  @Get('conversations')
  async listConversations(@Request() req: any) {
    const userId = getRequiredUserId(req);
    const all = await this.chatRepo
      .createQueryBuilder('m')
      .where('m.from_user_id = :me OR m.to_user_id = :me', { me: userId })
      .orderBy('m.create_time', 'DESC')
      .getMany();

    const map = new Map<string, { refType: string; refId: string; otherUserId: string; lastContent: string; lastTime: Date }>();
    for (const m of all) {
      const other = String(m.fromUserId) === String(userId) ? (m.toUserId || '') : String(m.fromUserId);
      const key = `${m.refType}:${m.refId}:${other}`;
      if (!map.has(key)) {
        map.set(key, {
          refType: m.refType,
          refId: String(m.refId),
          otherUserId: other,
          lastContent: m.content,
          lastTime: m.createTime,
        });
      }
    }
    const list = Array.from(map.values()).sort(
      (a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime(),
    );
    return { list, total: list.length };
  }
}

