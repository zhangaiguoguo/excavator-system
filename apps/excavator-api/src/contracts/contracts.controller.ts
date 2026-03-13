import {
  Body,
  Controller,
  Get,
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

  /** 供应方确认预约：待确认 -> 待服务 */
  @Put(':id/confirm')
  confirm(@Request() req: any, @Param('id') id: string): Promise<Contract> {
    const userId = getRequiredUserId(req);
    return this.contractsService.confirm(id, userId);
  }

  /** 任一方取消订单（需填写原因） */
  @Put(':id/cancel')
  cancel(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ): Promise<Contract> {
    const userId = getRequiredUserId(req);
    return this.contractsService.cancel(id, userId, body.reason);
  }

  /** 任一方确认完成：待服务 -> 已完成 */
  @Put(':id/complete')
  complete(@Request() req: any, @Param('id') id: string): Promise<Contract> {
    const userId = getRequiredUserId(req);
    return this.contractsService.complete(id, userId);
  }
}
