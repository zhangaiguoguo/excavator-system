import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { RecordsService } from './records.service';
import { Record } from './record.entity';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  findAll(@Query('userId') userId: string): Promise<Record[]> {
    return this.recordsService.findAll(userId);
  }

  @Get('stats')
  getStatistics(@Query('userId') userId: string): Promise<any> {
    return this.recordsService.getStatistics(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Record | null> {
    return this.recordsService.findOne(id);
  }

  @Post()
  create(@Body() record: Partial<Record>): Promise<Record> {
    return this.recordsService.create(record);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.recordsService.remove(id);
  }
}
