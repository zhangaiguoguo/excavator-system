import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './contract.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private contractsRepository: Repository<Contract>,
  ) {}

  findAll(): Promise<Contract[]> {
    return this.contractsRepository.find({
      relations: ['lessor', 'lessee', 'machine'],
      order: { createTime: 'DESC' },
    });
  }

  findOne(id: string): Promise<Contract | null> {
    return this.contractsRepository.findOne({
      where: { id },
      relations: ['lessor', 'lessee', 'machine'],
    });
  }

  async create(contractData: Partial<Contract>): Promise<Contract> {
    const contract = this.contractsRepository.create({
      ...contractData,
      contractNo:
        'HT' +
        new Date().toISOString().slice(0, 10).replace(/-/g, '') +
        Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, '0'),
      contentHash: uuidv4(), // Placeholder for hash
      status: 0, // Draft
    });
    return this.contractsRepository.save(contract);
  }

  async update(
    id: string,
    contractData: Partial<Contract>,
  ): Promise<Contract | null> {
    await this.contractsRepository.update(id, contractData);
    return this.contractsRepository.findOneBy({ id });
  }

  async sign(
    id: string,
    userId: string,
    role: 'lessor' | 'lessee',
  ): Promise<Contract | null> {
    const updateData: Partial<Contract> = {};
    if (role === 'lessor') {
      updateData.lessorSignStatus = 1;
    } else {
      updateData.lesseeSignStatus = 1;
    }

    // Check if both signed
    const contract = await this.findOne(id);
    if (!contract) {
      throw new Error('Contract not found');
    }

    // Check if other party already signed (check current state + new signature)
    const isLessorSigning = role === 'lessor';
    const isLesseeSigning = role === 'lessee';

    if (
      (isLessorSigning && contract.lesseeSignStatus === 1) ||
      (isLesseeSigning && contract.lessorSignStatus === 1)
    ) {
      updateData.status = 2; // Signed (Both parties signed)
    } else {
      updateData.status = 1; // Pending (One party signed)
    }

    await this.contractsRepository.update(id, updateData);
    return this.contractsRepository.findOneBy({ id });
  }
}
