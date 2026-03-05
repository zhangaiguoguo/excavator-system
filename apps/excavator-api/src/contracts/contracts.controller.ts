import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { Contract } from './contract.entity';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  findAll(): Promise<Contract[]> {
    return this.contractsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Contract | null> {
    return this.contractsService.findOne(id);
  }

  @Post()
  create(@Body() contract: Partial<Contract>): Promise<Contract> {
    return this.contractsService.create(contract);
  }

  @Put(':id/sign')
  sign(
    @Param('id') id: string,
    @Body() body: { userId: string; role: 'lessor' | 'lessee' },
  ): Promise<Contract> {
    return this.contractsService.sign(
      id,
      body.userId,
      body.role,
    ) as Promise<Contract>;
  }
}
