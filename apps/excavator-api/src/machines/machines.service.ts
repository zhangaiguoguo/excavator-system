import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Machine } from './machine.entity';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';

@Injectable()
export class MachinesService {
  constructor(
    @InjectRepository(Machine)
    private machinesRepository: Repository<Machine>,
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
    const qb = this.machinesRepository.createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'user')
      .where('m.status = :status', { status: '1' });
    if (filters?.type) qb.andWhere('m.type = :type', { type: filters.type });
    if (filters?.condition) qb.andWhere('m.condition_type = :condition', { condition: filters.condition });
    if (filters?.priceMin) qb.andWhere('m.rent_amount >= :priceMin', { priceMin: filters.priceMin });
    if (filters?.priceMax) qb.andWhere('m.rent_amount <= :priceMax', { priceMax: filters.priceMax });
    if (filters?.province) qb.andWhere('m.province = :province', { province: filters.province });
    if (filters?.city) qb.andWhere('m.city = :city', { city: filters.city });
    if (filters?.district) qb.andWhere('m.district = :district', { district: filters.district });
    if (filters?.userId) qb.andWhere('m.user_id = :userId', { userId: filters.userId });
    if (filters?.keyword) {
      qb.andWhere('(m.model LIKE :kw OR m.brand LIKE :kw OR m.description LIKE :kw)', {
        kw: '%' + filters.keyword + '%',
      });
    }
    if (filters?.sort === 'price_asc') qb.orderBy('m.rent_amount', 'ASC');
    else if (filters?.sort === 'price_desc') qb.orderBy('m.rent_amount', 'DESC');
    else if (filters?.sort === 'latest') qb.orderBy('m.create_time', 'DESC');
    else if (filters?.sort === 'distance' && filters?.latitude != null && filters?.longitude != null) {
      const lat = parseFloat(filters.latitude);
      const lng = parseFloat(filters.longitude);
      const expr = `(6371000 * acos(least(1, cos(radians(${lat})) * cos(radians(m.latitude)) * cos(radians(m.longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(m.latitude)))))`;
      qb.orderBy(expr, 'ASC');
    } else qb.orderBy('m.create_time', 'DESC');
    const [list, total] = await qb.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { list, total };
  }

  findOne(id: string): Promise<Machine | null> {
    return this.machinesRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async create(createMachineDto: CreateMachineDto): Promise<Machine> {
    const payload = {
      ...createMachineDto,
      rentStartDate: createMachineDto.rentStartDate ? new Date(createMachineDto.rentStartDate) : undefined,
      rentEndDate: createMachineDto.rentEndDate ? new Date(createMachineDto.rentEndDate) : undefined,
      isLongTerm: createMachineDto.isLongTerm ?? 'N',
    };
    const machine = this.machinesRepository.create(payload);
    return this.machinesRepository.save(machine);
  }

  async update(id: string, updateMachineDto: UpdateMachineDto): Promise<Machine | null> {
    const payload = { ...updateMachineDto } as Record<string, unknown>;
    if (payload.rentStartDate) payload.rentStartDate = new Date(payload.rentStartDate as string);
    if (payload.rentEndDate) payload.rentEndDate = new Date(payload.rentEndDate as string);
    await this.machinesRepository.update(id, payload);
    return this.machinesRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async remove(id: string): Promise<void> {
    await this.machinesRepository.delete(id);
  }
}
