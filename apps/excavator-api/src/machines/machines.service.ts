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

  findAll(): Promise<Machine[]> {
    return this.machinesRepository.find({ 
      relations: ['user'],
      order: { createTime: 'DESC' }
    });
  }

  findOne(id: string): Promise<Machine | null> {
    return this.machinesRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async create(createMachineDto: CreateMachineDto): Promise<Machine> {
    const machine = this.machinesRepository.create(createMachineDto);
    return this.machinesRepository.save(machine);
  }

  async update(id: string, updateMachineDto: UpdateMachineDto): Promise<Machine | null> {
    await this.machinesRepository.update(id, updateMachineDto);
    return this.machinesRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.machinesRepository.delete(id);
  }
}
