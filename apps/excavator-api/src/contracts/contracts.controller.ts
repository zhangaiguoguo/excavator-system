import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { Contract } from './contract.entity';
import { getRequiredUserId } from '../common/get-user-id';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const userId = getRequiredUserId(req);
    const pageNum = page ? parseInt(page, 10) : undefined;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : undefined;
    const statusNum =
      status !== undefined && status !== '' ? parseInt(status, 10) : undefined;
    return this.contractsService.findAll(
      userId,
      pageNum,
      pageSizeNum,
      statusNum,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Contract | null> {
    return this.contractsService.findOne(id);
  }

  @Post()
  create(
    @Request() req: any,
    @Body() contract: Partial<Contract>,
  ): Promise<Contract> {
    const userId = getRequiredUserId(req);
    return this.contractsService.create({
      ...contract,
      createBy: userId,
    });
  }

  @Put(':id/sign')
  sign(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { role: 'lessor' | 'lessee' },
  ): Promise<Contract> {
    const userId = getRequiredUserId(req);
    return this.contractsService.sign(
      id,
      userId,
      body.role,
    ) as Promise<Contract>;
  }
}
