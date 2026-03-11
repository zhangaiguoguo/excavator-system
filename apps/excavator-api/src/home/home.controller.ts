import { Controller, Get, Query, Request } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  /** 首页猜你喜欢设备列表 */
  @Get('recommendations')
  recommend(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
  ) {
    const currentUser =
      req?.user && req.user.userId && req.user.isTemp !== true && req.user.userId !== 'temp'
        ? String(req.user.userId)
        : undefined;
    const size = limit ? parseInt(limit, 10) || 6 : 6;
    const lat = latitude != null ? parseFloat(latitude) : undefined;
    const lng = longitude != null ? parseFloat(longitude) : undefined;
    return this.homeService.recommendMachines(currentUser, size, lat, lng);
  }

  /** 首页最新需求列表（仅未过期） */
  @Get('latest-demands')
  latestDemands(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const currentUser =
      req?.user && req.user.userId && req.user.isTemp !== true && req.user.userId !== 'temp'
        ? String(req.user.userId)
        : undefined;
    const pageNum = page ? parseInt(page, 10) : 1;
    const sizeNum = pageSize ? parseInt(pageSize, 10) : 10;
    return this.homeService.latestDemands(currentUser, pageNum, sizeNum);
  }
}

