import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) {}

  async create(data: {
    userId: string;
    type: string;
    title: string;
    content?: string;
    refType?: string;
    refId?: string;
  }): Promise<Notification> {
    const notification = this.repo.create(data);
    return this.repo.save(notification);
  }

  async list(
    userId: string,
    page = 1,
    pageSize = 20,
    unreadOnly?: boolean,
  ): Promise<{ list: Notification[]; total: number }> {
    const qb = this.repo
      .createQueryBuilder('n')
      .where('n.user_id = :userId', { userId })
      .orderBy('n.create_time', 'DESC');
    if (unreadOnly) {
      qb.andWhere('n.is_read = 0');
    }
    const total = await qb.getCount();
    const list = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    return { list, total };
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.repo.update(
      { id, userId },
      { isRead: 1 },
    );
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repo.update({ userId }, { isRead: 1 });
  }
}
