import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { GeoService } from './geo.service';

@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  /** 逆地理编码：经纬度 -> 省市区/完整地址（服务端请求高德） */
  @Public()
  @Get('regeo')
  async regeo(
    @Query('longitude') longitude: string,
    @Query('latitude') latitude: string,
    @Query('extensions') extensions?: 'base' | 'all',
  ) {
    return this.geoService.regeo({
      longitude: Number(longitude),
      latitude: Number(latitude),
      extensions: extensions || 'all',
    });
  }
}

