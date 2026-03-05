import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from './record.entity';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(Record)
    private recordsRepository: Repository<Record>,
  ) {}

  findAll(userId: string): Promise<Record[]> {
    return this.recordsRepository.find({
      where: { userId },
      order: { recordDate: 'DESC' }
    });
  }

  findOne(id: string): Promise<Record | null> {
    return this.recordsRepository.findOneBy({ id });
  }

  async create(recordData: Partial<Record>): Promise<Record> {
    const record = this.recordsRepository.create(recordData);
    return this.recordsRepository.save(record);
  }

  async remove(id: string): Promise<void> {
    await this.recordsRepository.delete(id);
  }

  async getStatistics(userId: string): Promise<any> {
    const records = await this.findAll(userId);
    let income = 0;
    let expense = 0;

    records.forEach(r => {
      const amount = Number(r.amount);
      if (r.type === 1) income += amount;
      if (r.type === 2) expense += amount;
    });

    return {
      income,
      expense,
      profit: income - expense
    };
  }
}
