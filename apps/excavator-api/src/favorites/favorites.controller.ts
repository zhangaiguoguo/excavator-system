import { Controller, Get, Post, Delete, Query, Body, Request } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { getRequiredUserId } from '../common/get-user-id';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  list(@Request() req: any) {
    const userId = getRequiredUserId(req);
    return this.favoritesService.list(userId);
  }

  @Post()
  add(@Request() req: any, @Body() body: { refType: string; refId: string }) {
    const userId = getRequiredUserId(req);
    return this.favoritesService.add(userId, body.refType, body.refId);
  }

  @Delete()
  remove(
    @Request() req: any,
    @Query('refType') refType: string,
    @Query('refId') refId: string,
  ) {
    const userId = getRequiredUserId(req);
    return this.favoritesService.remove(userId, refType, refId);
  }

  @Get('check')
  check(
    @Request() req: any,
    @Query('refType') refType: string,
    @Query('refId') refId: string,
  ) {
    const userId = getRequiredUserId(req);
    return this.favoritesService.isFav(userId, refType, refId);
  }
}
