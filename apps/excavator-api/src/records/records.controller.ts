import { Controller, Get, Post, Body, Param, Delete, Query, Request } from '@nestjs/common';
import { RecordsService } from './records.service';
import { Record } from './record.entity';
import { getRequiredUserId } from '../common/get-user-id';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  findAll(@Request() req: any): Promise<Record[]> {
    const userId = getRequiredUserId(req);
    return this.recordsService.findAll(userId);
  }

  @Get('stats')
  getStatistics(@Request() req: any): Promise<any> {
    const userId = getRequiredUserId(req);
    return this.recordsService.getStatistics(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Record | null> {
    return this.recordsService.findOne(id);
  }

  @Post()
  create(@Request() req: any, @Body() record: Partial<Record>): Promise<Record> {
    const userId = getRequiredUserId(req);
    return this.recordsService.create({ ...record, userId });
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.recordsService.remove(id);
  }
}
