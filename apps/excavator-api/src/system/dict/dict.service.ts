import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictType } from './entities/dict-type.entity';
import { DictData } from './entities/dict-data.entity';
import { CreateDictTypeDto } from './dto/create-dict-type.dto';
import { UpdateDictTypeDto } from './dto/update-dict-type.dto';
import { CreateDictDataDto } from './dto/create-dict-data.dto';
import { UpdateDictDataDto } from './dto/update-dict-data.dto';

@Injectable()
export class DictService {
  constructor(
    @InjectRepository(DictType)
    private dictTypeRepository: Repository<DictType>,
    @InjectRepository(DictData)
    private dictDataRepository: Repository<DictData>,
  ) {}

  // DictType CRUD

  async createType(createDictTypeDto: CreateDictTypeDto) {
    return this.dictTypeRepository.save(createDictTypeDto);
  }

  async findAllType(query: any) {
    // Basic search implementation
    const qb = this.dictTypeRepository.createQueryBuilder('dictType');
    if (query.dictName) {
      qb.andWhere('dictType.dictName LIKE :dictName', { dictName: `%${query.dictName}%` });
    }
    if (query.dictType) {
      qb.andWhere('dictType.dictType LIKE :dictType', { dictType: `%${query.dictType}%` });
    }
    if (query.status) {
      qb.andWhere('dictType.status = :status', { status: query.status });
    }
    return qb.orderBy('dictType.createTime', 'DESC').getMany();
  }

  async findOneType(id: string) {
    return this.dictTypeRepository.findOneBy({ id });
  }

  async updateType(id: string, updateDictTypeDto: UpdateDictTypeDto) {
    // If updating dictType string, we should probably update associated dictData too?
    // For now simple update.
    await this.dictTypeRepository.update(id, updateDictTypeDto);
    return this.findOneType(id);
  }

  async removeType(id: string) {
    // Check if data exists?
    const type = await this.findOneType(id);
    if (type) {
        // Also delete associated data
        await this.dictDataRepository.delete({ dictType: type.dictType });
        return this.dictTypeRepository.delete(id);
    }
    return null;
  }

  // DictData CRUD

  async createData(createDictDataDto: CreateDictDataDto) {
    return this.dictDataRepository.save(createDictDataDto);
  }

  async findAllData(query: any) {
    const qb = this.dictDataRepository.createQueryBuilder('dictData');
    if (query.dictType) {
      qb.andWhere('dictData.dictType = :dictType', { dictType: query.dictType });
    }
    if (query.dictLabel) {
      qb.andWhere('dictData.dictLabel LIKE :dictLabel', { dictLabel: `%${query.dictLabel}%` });
    }
    if (query.status) {
      qb.andWhere('dictData.status = :status', { status: query.status });
    }
    return qb.orderBy('dictData.dictSort', 'ASC').getMany();
  }

  async findOneData(id: string) {
    return this.dictDataRepository.findOneBy({ id });
  }

  async updateData(id: string, updateDictDataDto: UpdateDictDataDto) {
    await this.dictDataRepository.update(id, updateDictDataDto);
    return this.findOneData(id);
  }

  async removeData(id: string) {
    return this.dictDataRepository.delete(id);
  }

  // Public/Utility

  async getDataByType(dictType: string) {
    return this.dictDataRepository.find({
      where: { dictType, status: 0 },
      order: { dictSort: 'ASC' },
    });
  }
}
