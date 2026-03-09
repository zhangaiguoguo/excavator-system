import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { Contract } from './contract.entity';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : undefined;
    const statusNum = status !== undefined && status !== '' ? parseInt(status, 10) : undefined;
    return this.contractsService.findAll(userId, pageNum, pageSizeNum, statusNum);
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
