import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { UsersService } from '../users/users.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    private usersService: UsersService,
  ) {}

  async findAll(filters?: {
    experience?: string;
    equipmentType?: string;
    province?: string;
    city?: string;
    district?: string;
    priceMin?: string;
    priceMax?: string;
    userId?: string;
    sort?: string;
  }): Promise<Job[]> {
    const qb = this.jobsRepository.createQueryBuilder('j')
      .leftJoinAndSelect('j.user', 'user')
      .where('j.status = :status', { status: '1' });
    if (filters?.experience) qb.andWhere('j.experience = :experience', { experience: filters.experience });
    if (filters?.equipmentType) qb.andWhere("JSON_CONTAINS(j.equipment_types, CAST(:eq AS JSON)) = 1", { eq: JSON.stringify(filters.equipmentType) });
    if (filters?.province) qb.andWhere('j.province = :province', { province: filters.province });
    if (filters?.city) qb.andWhere('j.city = :city', { city: filters.city });
    if (filters?.district) qb.andWhere('j.district = :district', { district: filters.district });
    if (filters?.priceMin) qb.andWhere('j.price >= :priceMin', { priceMin: filters.priceMin });
    if (filters?.priceMax) qb.andWhere('j.price <= :priceMax', { priceMax: filters.priceMax });
    if (filters?.userId) qb.andWhere('j.user_id = :userId', { userId: filters.userId });
    if (filters?.sort === 'price_asc') qb.orderBy('j.price', 'ASC');
    else qb.orderBy('j.createTime', 'DESC');
    return qb.getMany();
  }

  findOne(id: string): Promise<Job | null> {
    return this.jobsRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async create(dto: CreateJobDto): Promise<Job> {
    await this.usersService.ensureUserCanPublish(dto.userId);
    const payload = {
      ...dto,
      workStartDate: new Date(dto.workStartDate),
      workEndDate: new Date(dto.workEndDate),
      isLongTerm: dto.isLongTerm ?? 'N',
      status: '1',
    };
    const job = this.jobsRepository.create(payload);
    return this.jobsRepository.save(job);
  }

  async update(id: string, dto: UpdateJobDto): Promise<Job | null> {
    const payload: Record<string, unknown> = { ...dto };
    if (dto.workStartDate) payload.workStartDate = new Date(dto.workStartDate);
    if (dto.workEndDate) payload.workEndDate = new Date(dto.workEndDate);
    await this.jobsRepository.update(id, payload as Partial<Job>);
    return this.jobsRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async remove(id: string): Promise<void> {
    await this.jobsRepository.delete(id);
  }
}
