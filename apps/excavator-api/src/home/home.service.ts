import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Machine } from '../machines/machine.entity';
import { Order } from '../orders/order.entity';
import { Favorite } from '../favorites/favorite.entity';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(Machine)
    private machinesRepository: Repository<Machine>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Favorite)
    private favRepository: Repository<Favorite>,
  ) {}

  /**
   * 猜你喜欢：基于用户收藏和发布过的设备类型做简单推荐；
   * 如果没有匹配数据，则按附近热门设备兜底。
   */
  async recommendMachines(
    userId?: string,
    limit = 6,
    latitude?: number,
    longitude?: number,
  ): Promise<{ list: Machine[] }> {
    const safeLimit = Math.max(1, Math.min(20, limit || 6));

    // 统计偏好类型：优先使用收藏的设备类型，其次是自己发布的设备类型
    const preferredTypes: string[] = [];

    if (userId) {
      const favs = await this.favRepository.find({
        where: { userId, refType: 'machine' },
        order: { createTime: 'DESC' },
        take: 100,
      });
      const machineIds = favs.map((f) => f.refId);
      if (machineIds.length) {
        const favMachines = await this.machinesRepository.find({
          where: { id: In(machineIds), status: '1' },
        });
        const counter: Record<string, number> = {};
        favMachines.forEach((m) => {
          if (!m.type) return;
          counter[m.type] = (counter[m.type] || 0) + 2; // 收藏权重更高
        });
        Object.entries(counter)
          .sort((a, b) => b[1] - a[1])
          .forEach(([t]) => {
            if (!preferredTypes.includes(t)) preferredTypes.push(t);
          });
      }

      if (preferredTypes.length === 0) {
        const ownMachines = await this.machinesRepository.find({
          where: { userId, status: '1' },
          take: 50,
        });
        const counter: Record<string, number> = {};
        ownMachines.forEach((m) => {
          if (!m.type) return;
          counter[m.type] = (counter[m.type] || 0) + 1;
        });
        Object.entries(counter)
          .sort((a, b) => b[1] - a[1])
          .forEach(([t]) => {
            if (!preferredTypes.includes(t)) preferredTypes.push(t);
          });
      }
    }

    const qb = this.machinesRepository
      .createQueryBuilder('m')
      .where('m.status = :status', { status: '1' });

    if (userId) {
      qb.andWhere('m.user_id <> :userId', { userId });
    }

    if (preferredTypes.length) {
      qb.andWhere('m.type IN (:...types)', { types: preferredTypes });
    }

    // 默认按最新时间倒序，偏好类型命中 + 最新优先
    qb.orderBy('m.createTime', 'DESC').take(safeLimit);

    let list = await qb.getMany();

    // 如果基于偏好没有查到数据，则按“附近热门”兜底
    if (!list.length) {
      const fallbackQb = this.machinesRepository
        .createQueryBuilder('m')
        .where('m.status = :status', { status: '1' });

      if (userId) {
        fallbackQb.andWhere('m.user_id <> :userId', { userId });
      }

      if (latitude != null && longitude != null) {
        const lat = Number(latitude);
        const lng = Number(longitude);
        fallbackQb
          .addSelect(
            '(6371000 * acos(least(1, cos(radians(:lat)) * cos(radians(m.latitude)) * cos(radians(m.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(m.latitude)))))',
            'distance',
          )
          .setParameter('lat', lat)
          .setParameter('lng', lng)
          .orderBy('distance', 'ASC')
          .addOrderBy('m.viewCount', 'DESC')
          .addOrderBy('m.createTime', 'DESC');
      } else {
        // 没有定位信息时，全局热门：按浏览量 + 最新排序
        fallbackQb.orderBy('m.viewCount', 'DESC').addOrderBy('m.createTime', 'DESC');
      }

      fallbackQb.take(safeLimit);
      list = await fallbackQb.getMany();
    }

    return { list };
  }

  /**
   * 最新需求：只返回未过期的需求（结束日期为空或在今天及之后），按创建时间倒序
   */
  async latestDemands(userId?: string, page = 1, pageSize = 10): Promise<{ list: Order[]; total: number }> {
    const safePage = Math.max(1, page ?? 1);
    const safeSize = Math.min(50, Math.max(1, pageSize ?? 10));

    const qb = this.ordersRepository
      .createQueryBuilder('d')
      .where('d.status = :status', { status: '1' })
      .andWhere('(d.end_date IS NULL OR d.end_date >= CURRENT_DATE())');

    if (userId) {
      qb.andWhere('d.user_id <> :userId', { userId });
    }

    qb.orderBy('d.createTime', 'DESC')
      .skip((safePage - 1) * safeSize)
      .take(safeSize);

    const [list, total] = await qb.getManyAndCount();
    return { list, total };
  }
}

