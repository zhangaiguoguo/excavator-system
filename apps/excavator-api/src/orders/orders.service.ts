import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateDemandDto } from './dto/create-demand.dto';
import { UpdateDemandDto } from './dto/update-demand.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async findAll(filters?: {
    type?: string;
    province?: string;
    city?: string;
    district?: string;
    budgetMin?: string;
    budgetMax?: string;
    keyword?: string;
    userId?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ list: Order[]; total: number }> {
    const page = Math.max(1, filters?.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 10));
    const qb = this.ordersRepository.createQueryBuilder('d')
      .leftJoinAndSelect('d.user', 'user')
      .where('d.status = :status', { status: '1' });
    if (filters?.type) qb.andWhere('d.type = :type', { type: filters.type });
    if (filters?.province) qb.andWhere('d.province = :province', { province: filters.province });
    if (filters?.city) qb.andWhere('d.city = :city', { city: filters.city });
    if (filters?.district) qb.andWhere('d.district = :district', { district: filters.district });
    if (filters?.budgetMin) qb.andWhere('d.budget_max >= :budgetMin', { budgetMin: filters.budgetMin });
    if (filters?.budgetMax) qb.andWhere('d.budget_min <= :budgetMax', { budgetMax: filters.budgetMax });
    if (filters?.userId) qb.andWhere('d.user_id = :userId', { userId: filters.userId });
    if (filters?.keyword) {
      qb.andWhere('(d.description LIKE :kw OR d.address LIKE :kw)', { kw: '%' + filters.keyword + '%' });
    }
    if (filters?.sort === 'price_asc') qb.orderBy('d.budgetMin', 'ASC');
    else if (filters?.sort === 'latest') qb.orderBy('d.createTime', 'DESC');
    else qb.orderBy('d.createTime', 'DESC');
    const [list, total] = await qb.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { list, total };
  }

  findOne(id: string): Promise<Order | null> {
    return this.ordersRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async create(dto: CreateDemandDto): Promise<Order> {
    const payload = {
      userId: dto.userId,
      type: dto.type,
      machineTypes: dto.machineTypes,
      province: dto.province,
      city: dto.city,
      district: dto.district,
      address: dto.address,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      budgetMin: dto.budgetMin,
      budgetMax: dto.budgetMax,
      description: dto.description,
      images: dto.images ?? [],
      video: dto.video,
      isUrgent: dto.isUrgent ?? 'N',
      status: '1',
    };
    const order = this.ordersRepository.create(payload);
    return this.ordersRepository.save(order);
  }

  async update(id: string, dto: UpdateDemandDto): Promise<Order | null> {
    const payload: Record<string, unknown> = { ...dto };
    if (dto.startDate) payload.startDate = new Date(dto.startDate);
    if (dto.endDate) payload.endDate = new Date(dto.endDate);
    await this.ordersRepository.update(id, payload as Partial<Order>);
    return this.ordersRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async remove(id: string): Promise<void> {
    await this.ordersRepository.delete(id);
  }
}
