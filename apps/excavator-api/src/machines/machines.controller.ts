import { Controller, Get, Post, Body, Param, Delete, Put, Query, Request } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { Machine } from './machine.entity';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { getRequiredUserId } from '../common/get-user-id';

@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('condition') condition?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('province') province?: string,
    @Query('city') city?: string,
    @Query('district') district?: string,
    @Query('keyword') keyword?: string,
    @Query('userId') userId?: string,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : undefined;
    return this.machinesService.findAll({
      type,
      condition,
      priceMin,
      priceMax,
      province,
      city,
      district,
      keyword,
      userId,
      latitude,
      longitude,
      sort,
      page: pageNum,
      pageSize: pageSizeNum,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Machine | null> {
    return this.machinesService.findOne(id);
  }

  @Post()
  create(
    @Request() req: any,
    @Body() createMachineDto: CreateMachineDto,
  ): Promise<Machine> {
    const userId = getRequiredUserId(req);
    return this.machinesService.create({ ...createMachineDto, userId });
  }

  @Put(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateMachineDto: UpdateMachineDto,
  ): Promise<Machine | null> {
    const userId = getRequiredUserId(req);
    return this.machinesService.update(id, updateMachineDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.machinesService.remove(id);
  }
}
