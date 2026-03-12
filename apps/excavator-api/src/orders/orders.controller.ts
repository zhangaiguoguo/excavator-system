import { Controller, Get, Post, Body, Param, Delete, Put, Query, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { CreateDemandDto } from './dto/create-demand.dto';
import { UpdateDemandDto } from './dto/update-demand.dto';
import { getRequiredUserId } from '../common/get-user-id';

/** 需求模块：需求方发布 求租设备/招聘机手 PRD 4.3 */
@Controller('demands')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('machineTypes') machineTypes?: string,
    @Query('province') province?: string,
    @Query('city') city?: string,
    @Query('district') district?: string,
    @Query('budgetMin') budgetMin?: string,
    @Query('budgetMax') budgetMax?: string,
    @Query('keyword') keyword?: string,
    @Query('userId') userId?: string,
    @Query('sort') sort?: string,
    @Query('isUrgent') isUrgent?: string,
    @Query('hasVideo') hasVideo?: string,
    @Query('hasImage') hasImage?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : undefined;
    return this.ordersService.findAll({
      type,
      machineTypes,
      province,
      city,
      district,
      budgetMin,
      budgetMax,
      keyword,
      userId,
      sort,
      isUrgent,
      hasVideo,
      hasImage,
      page: pageNum,
      pageSize: pageSizeNum,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Order | null> {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateDemandDto): Promise<Order> {
    const userId = getRequiredUserId(req);
    return this.ordersService.create({ ...dto, userId });
  }

  @Put(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDemandDto,
  ): Promise<Order | null> {
    const userId = getRequiredUserId(req);
    return this.ordersService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.ordersService.remove(id);
  }
}
