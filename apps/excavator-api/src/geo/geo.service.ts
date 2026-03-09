import { Injectable, BadRequestException, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

type AmapRegeoResponse = {
  status?: string;
  info?: string;
  infocode?: string;
  regeocode?: {
    formatted_address?: string;
    addressComponent?: {
      province?: string;
      city?: string | string[];
      district?: string;
      township?: string;
      adcode?: string;
      streetNumber?: { street?: string; number?: string };
    };
  };
};

@Injectable()
export class GeoService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async regeo(params: {
    longitude: number;
    latitude: number;
    extensions?: 'base' | 'all';
  }) {
    const key = this.configService.get<string>('AMAP_KEY') || '';
    if (!key) throw new BadRequestException('服务未配置 AMAP_KEY');
    if (
      typeof params.longitude !== 'number' ||
      typeof params.latitude !== 'number' ||
      Number.isNaN(params.longitude) ||
      Number.isNaN(params.latitude)
    ) {
      throw new HttpException('经纬度参数错误', 500);
    }

    const location = `${params.longitude},${params.latitude}`;
    const extensions = params.extensions || 'all';

    const { data } = await firstValueFrom(
      this.httpService.get<AmapRegeoResponse>(
        'https://restapi.amap.com/v3/geocode/regeo',
        {
          params: {
            key,
            location,
            extensions,
            output: 'json',
          },
          timeout: 8000,
        },
      ),
    );

    if (!data || data.status !== '1' || !data.regeocode) {
      throw new HttpException(
        `高德解析失败: ${data?.info || data?.infocode || 'unknown'}`,
        500,
      );
    }

    const formattedAddress = data.regeocode.formatted_address || '';
    const ac = data.regeocode.addressComponent || {};
    const province = ac.province || '';
    // 直辖市/特殊城市 city 可能为空或数组，这里统一转成字符串
    const city = Array.isArray(ac.city) ? ac.city[0] || '' : ac.city || '';
    const district = ac.district || '';

    return {
      formattedAddress,
      province,
      city,
      district,
      township: ac.township || '',
      adcode: ac.adcode || '',
      latitude: params.latitude,
      longitude: params.longitude,
    };
  }
}
