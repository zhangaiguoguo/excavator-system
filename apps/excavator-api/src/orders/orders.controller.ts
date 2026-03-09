import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { CreateDemandDto } from './dto/create-demand.dto';
import { UpdateDemandDto } from './dto/update-demand.dto';

/** 需求模块：需求方发布 求租设备/招聘机手 PRD 4.3 */
@Controller('demands')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('province') province?: string,
    @Query('city') city?: string,
    @Query('district') district?: string,
    @Query('budgetMin') budgetMin?: string,
    @Query('budgetMax') budgetMax?: string,
    @Query('keyword') keyword?: string,
    @Query('userId') userId?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : undefined;
    return this.ordersService.findAll({
      type, province, city, district, budgetMin, budgetMax, keyword, userId, sort,
      page: pageNum, pageSize: pageSizeNum,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Order | null> {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDemandDto): Promise<Order> {
    return this.ordersService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDemandDto): Promise<Order | null> {
    return this.ordersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.ordersService.remove(id);
  }
}
