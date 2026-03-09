import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job } from './job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

/** 揽活模块：揽活方发布服务信息 PRD 4.2.2 */
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  findAll(
    @Query('experience') experience?: string,
    @Query('equipmentType') equipmentType?: string,
    @Query('province') province?: string,
    @Query('city') city?: string,
    @Query('district') district?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('userId') userId?: string,
    @Query('sort') sort?: string,
  ): Promise<Job[]> {
    return this.jobsService.findAll({ experience, equipmentType, province, city, district, priceMin, priceMax, userId, sort });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Job | null> {
    return this.jobsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateJobDto): Promise<Job> {
    return this.jobsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateJobDto): Promise<Job | null> {
    return this.jobsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.jobsService.remove(id);
  }
}
