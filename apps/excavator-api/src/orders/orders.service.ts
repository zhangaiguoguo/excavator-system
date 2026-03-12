import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { UsersService } from '../users/users.service';
import { CryptoService } from '../common/crypto/crypto.service';
import { CreateDemandDto, FileItemDto } from './dto/create-demand.dto';
import { UpdateDemandDto } from './dto/update-demand.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';

function normalizeFileItem(
  v: string | FileItemDto | undefined | null,
): { fileId: string; fileName: string } | null {
  if (v == null || v === '') return null;
  if (typeof v === 'string') return { fileId: v, fileName: v };
  if (v.fileId || v.fileName)
    return { fileId: v.fileId || v.fileName, fileName: v.fileName || v.fileId };
  return null;
}

function normalizeFileItems(
  v: (string | FileItemDto)[] | undefined,
): Array<{ fileId: string; fileName: string }> {
  if (!Array.isArray(v)) return [];
  return v
    .map((it) => normalizeFileItem(it))
    .filter((x): x is { fileId: string; fileName: string } => x != null);
}

function parseDateOrThrow(value: string | undefined, fieldName: string): Date {
  if (!value) {
    throw new BadRequestException(
      `${fieldName} is required and must be in YYYY-MM-DD format`,
    );
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException(
      `${fieldName} is invalid, expected YYYY-MM-DD`,
    );
  }
  return d;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private cryptoService: CryptoService,
    private usersService: UsersService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  async findAll(filters?: {
    type?: string;
    machineTypes?: string;
    province?: string;
    city?: string;
    district?: string;
    budgetMin?: string;
    budgetMax?: string;
    keyword?: string;
    userId?: string;
    sort?: string;
    isUrgent?: string;
    hasVideo?: string;
    hasImage?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ list: Order[]; total: number }> {
    const page = Math.max(1, filters?.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 10));
    const qb = this.ordersRepository
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.user', 'user')
      .where('d.status = :status', { status: '1' });
    if (filters?.type) {
      const types = String(filters.type)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (types.length <= 1) qb.andWhere('d.type = :type', { type: types[0] });
      else qb.andWhere('d.type IN (:...types)', { types });
    }
    /* 地区按省、市筛选；有区时按区排序：同区优先，区不同往后排 */
    if (filters?.province)
      qb.andWhere('d.province = :province', { province: filters.province });
    if (filters?.city) qb.andWhere('d.city = :city', { city: filters.city });
    if (filters?.district) {
      qb.addSelect('(d.district = :districtOrder)', 'districtMatch')
        .setParameter('districtOrder', filters.district)
        .addOrderBy('districtMatch', 'DESC');
    }
    if (filters?.machineTypes) {
      const codes = String(filters.machineTypes)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (codes.length) {
        const conds = codes
          .map((_, idx) => `JSON_CONTAINS(d.machine_types, :mt${idx})`)
          .join(' OR ');
        const params: Record<string, unknown> = {};
        codes.forEach((code, idx) => {
          params[`mt${idx}`] = JSON.stringify([code]);
        });
        qb.andWhere(`(${conds})`, params);
      }
    }
    if (filters?.budgetMin)
      qb.andWhere('d.budget_max >= :budgetMin', {
        budgetMin: filters.budgetMin,
      });
    if (filters?.budgetMax)
      qb.andWhere('d.budget_min <= :budgetMax', {
        budgetMax: filters.budgetMax,
      });
    if (filters?.userId)
      qb.andWhere('d.user_id = :userId', { userId: filters.userId });
    if (filters?.isUrgent === 'Y')
      qb.andWhere('d.is_urgent = :isUrgent', { isUrgent: 'Y' });
    if (filters?.hasVideo === '1')
      qb.andWhere('d.video IS NOT NULL AND d.video <> \'\'');
    if (filters?.hasImage === '1')
      qb.andWhere('JSON_LENGTH(d.images) > 0');
    if (filters?.keyword) {
      qb.andWhere('(d.description LIKE :kw OR d.address LIKE :kw)', {
        kw: '%' + filters.keyword + '%',
      });
    }
    if (filters?.sort === 'price_asc') qb.addOrderBy('d.budgetMin', 'ASC');
    else if (filters?.sort === 'price_desc') qb.addOrderBy('d.budgetMax', 'DESC');
    else if (filters?.sort === 'view_desc') qb.addOrderBy('d.viewCount', 'DESC');
    else if (filters?.sort === 'urgent_first')
      qb.addOrderBy('d.is_urgent', 'DESC').addOrderBy('d.createTime', 'DESC');
    else if (filters?.sort === 'latest') qb.addOrderBy('d.createTime', 'DESC');
    else qb.addOrderBy('d.createTime', 'DESC');
    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    const safeList = list.map((d) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { user, ...rest } = d as any;
      let safeUser: any = undefined;
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const decryptedPhone =
          user.phone != null
            ? (this.cryptoService.decrypt(user.phone) ?? user.phone)
            : undefined;
        safeUser = {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role,
          realNameStatus: user.realNameStatus,
          phone: decryptedPhone,
        };
      }
      return { ...rest, user: safeUser } as Order & { user?: any };
    });
    return { list: safeList, total };
  }

  async findOne(id: string): Promise<Order | null> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!order) return null;
    const { user, ...rest } = order as any;
    let safeUser: any = undefined;
    if (user) {
      const decryptedPhone =
        user.phone != null
          ? (this.cryptoService.decrypt(user.phone) ?? user.phone)
          : undefined;
      safeUser = {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        realNameStatus: user.realNameStatus,
        phone: decryptedPhone,
      };
    }
    return { ...rest, user: safeUser } as Order & { user?: any };
  }

  async create(dto: CreateDemandDto): Promise<Order> {
    await this.usersService.ensureUserCanPublish(dto.userId);
    const images = normalizeFileItems(dto.images);
    const video = normalizeFileItem(dto.video);
    const userIdStr = String(dto.userId ?? '');
    const payload = {
      userId: dto.userId,
      type: dto.type,
      machineTypes: dto.machineTypes,
      machineTypeOther: dto.machineTypeOther?.trim() || null,
      province: dto.province,
      city: dto.city,
      district: dto.district,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      address: dto.address,
      startDate: parseDateOrThrow(dto.startDate, 'startDate'),
      endDate: parseDateOrThrow(dto.endDate, 'endDate'),
      budgetMin: dto.budgetMin,
      budgetMax: dto.budgetMax,
      description: dto.description,
      images,
      video,
      isUrgent: dto.isUrgent ?? 'N',
      status: '1',
      createBy: userIdStr,
      updateBy: userIdStr,
    };
    const order = this.ordersRepository.create(payload);
    return this.ordersRepository.save(order);
  }

  async update(
    id: string,
    dto: UpdateDemandDto,
    updateByUserId?: string,
  ): Promise<Order | null> {
    const payload: Record<string, unknown> = { ...dto };
    if (dto.startDate) payload.startDate = new Date(dto.startDate);
    if (dto.endDate) payload.endDate = new Date(dto.endDate);
    if (dto.images !== undefined)
      payload.images = normalizeFileItems(
        dto.images as (string | FileItemDto)[],
      );
    if (dto.video !== undefined) payload.video = normalizeFileItem(dto.video);
    if (dto.machineTypeOther !== undefined)
      payload.machineTypeOther = dto.machineTypeOther?.trim() || null;
    if (dto.latitude !== undefined) payload.latitude = dto.latitude ?? null;
    if (dto.longitude !== undefined) payload.longitude = dto.longitude ?? null;
    if (updateByUserId !== undefined)
      payload.updateBy = String(updateByUserId);
    await this.ordersRepository.update(id, payload as Partial<Order>);
    this.realtimeGateway.notifyContentUpdated('demand', String(id));
    return this.ordersRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async remove(id: string): Promise<void> {
    await this.ordersRepository.delete(id);
  }
}
