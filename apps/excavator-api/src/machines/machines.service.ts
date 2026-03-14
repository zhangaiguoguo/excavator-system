import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Machine } from './machine.entity';
import { UsersService } from '../users/users.service';
import { CryptoService } from '../common/crypto/crypto.service';
import { CreateMachineDto, FileItemDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { Constants, PublishStatus } from '@excavator/types';
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

@Injectable()
export class MachinesService {
  constructor(
    @InjectRepository(Machine)
    private machinesRepository: Repository<Machine>,
    private cryptoService: CryptoService,
    private usersService: UsersService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  async findAll(filters?: {
    type?: string;
    condition?: string;
    priceMin?: string;
    priceMax?: string;
    province?: string;
    city?: string;
    district?: string;
    keyword?: string;
    userId?: string;
    latitude?: string;
    longitude?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ list: Machine[]; total: number }> {
    const page = Math.max(1, filters?.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 10));
    const qb = this.machinesRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'user');
    if (filters?.userId) {
      qb.andWhere('m.user_id = :userId', { userId: filters.userId });
    } else {
      qb.andWhere('m.status = :status', { status: PublishStatus.ON_SHELF });
    }
    if (filters?.type) {
      const types = String(filters.type)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (types.length <= 1) qb.andWhere('m.type = :type', { type: types[0] });
      else qb.andWhere('m.type IN (:...types)', { types });
    }
    if (filters?.condition)
      qb.andWhere('m.condition_type = :condition', {
        condition: filters.condition,
      });
    if (filters?.priceMin)
      qb.andWhere('m.rent_amount >= :priceMin', { priceMin: filters.priceMin });
    if (filters?.priceMax)
      qb.andWhere('m.rent_amount <= :priceMax', { priceMax: filters.priceMax });
    /* 地区按省、市筛选；有区时按区排序：同区优先，区不同往后排 */
    if (filters?.province)
      qb.andWhere('m.province = :province', { province: filters.province });
    if (filters?.city) qb.andWhere('m.city = :city', { city: filters.city });
    if (filters?.district) {
      qb.addSelect('(m.district = :districtOrder)', 'districtMatch')
        .setParameter('districtOrder', filters.district)
        .addOrderBy('districtMatch', 'DESC');
    }
    if (filters?.keyword) {
      qb.andWhere(
        '(m.model LIKE :kw OR m.brand LIKE :kw OR m.description LIKE :kw)',
        {
          kw: '%' + filters.keyword + '%',
        },
      );
    }
    if (filters?.sort === 'price_asc') qb.addOrderBy('m.rentAmount', 'ASC');
    else if (filters?.sort === 'price_desc')
      qb.addOrderBy('m.rentAmount', 'DESC');
    else if (filters?.sort === 'latest') qb.addOrderBy('m.createTime', 'DESC');
    else if (
      filters?.sort === 'distance' &&
      filters?.latitude != null &&
      filters?.longitude != null
    ) {
      const lat = parseFloat(String(filters.latitude));
      const lng = parseFloat(String(filters.longitude));
      qb.addSelect(
        '(6371000 * acos(least(1, cos(radians(:lat)) * cos(radians(m.latitude)) * cos(radians(m.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(m.latitude)))))',
        'distance',
      )
        .setParameter('lat', lat)
        .setParameter('lng', lng);
      qb.addOrderBy('distance', 'ASC');
    } else qb.addOrderBy('m.createTime', 'DESC');
    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    const safeList = list.map((m) => {
      const { user, ...rest } = m as any;
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
      return { ...rest, user: safeUser } as Machine & { user?: any };
    });
    return { list: safeList, total };
  }

  async findOne(id: string): Promise<Machine | null> {
    const machine = await this.machinesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!machine) return null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { user, ...rest } = machine as any;
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
    return { ...rest, user: safeUser } as Machine & { user?: any };
  }

  async create(createMachineDto: CreateMachineDto): Promise<Machine> {
    await this.usersService.ensureUserCanPublish(createMachineDto.userId);
    const images = normalizeFileItems(createMachineDto.images);
    const video = normalizeFileItem(createMachineDto.video);
    const userIdStr = String(createMachineDto.userId ?? '');
    const payload = {
      ...createMachineDto,
      images,
      video,
      rentStartDate: createMachineDto.rentStartDate
        ? new Date(createMachineDto.rentStartDate)
        : undefined,
      rentEndDate: createMachineDto.rentEndDate
        ? new Date(createMachineDto.rentEndDate)
        : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      isLongTerm: createMachineDto.isLongTerm ?? Constants.NO,
      createBy: userIdStr,
      updateBy: userIdStr,
    };
    const machine = this.machinesRepository.create(payload);
    return this.machinesRepository.save(machine);
  }

  async update(
    id: string,
    updateMachineDto: UpdateMachineDto,
    updateByUserId?: string,
  ): Promise<Machine | null> {
    const existing = await this.machinesRepository.findOne({ where: { id }, select: ['id', 'userId'] });
    if (!existing) return null;
    if (updateByUserId != null && String(existing.userId) !== String(updateByUserId)) {
      throw new ForbiddenException('只能操作自己的设备');
    }
    const payload = { ...updateMachineDto } as Record<string, unknown>;
    if (payload.rentStartDate)
      payload.rentStartDate = new Date(payload.rentStartDate as string);
    if (payload.rentEndDate)
      payload.rentEndDate = new Date(payload.rentEndDate as string);
    if (payload.images !== undefined)
      payload.images = normalizeFileItems(
        payload.images as (string | FileItemDto)[],
      );
    if (payload.video !== undefined)
      payload.video = normalizeFileItem(payload.video as string | FileItemDto);
    payload.rentStartDate = payload.rentStartDate || null;
    payload.rentEndDate = payload.rentEndDate || null;
    if (updateByUserId !== undefined)
      payload.updateBy = String(updateByUserId);
    await this.machinesRepository.update(id, payload);
    this.realtimeGateway.notifyContentUpdated('machine', String(id));
    return this.machinesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async remove(id: string): Promise<void> {
    await this.machinesRepository.delete(id);
  }
}
