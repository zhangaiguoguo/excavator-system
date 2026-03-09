import { Controller, Get, Post, Delete, Query, Body } from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  list(@Query('userId') userId: string) {
    return this.favoritesService.list(userId);
  }

  @Post()
  add(@Body() body: { userId: string; refType: string; refId: string }) {
    return this.favoritesService.add(body.userId, body.refType, body.refId);
  }

  @Delete()
  remove(
    @Query('userId') userId: string,
    @Query('refType') refType: string,
    @Query('refId') refId: string,
  ) {
    return this.favoritesService.remove(userId, refType, refId);
  }

  @Get('check')
  check(
    @Query('userId') userId: string,
    @Query('refType') refType: string,
    @Query('refId') refId: string,
  ) {
    return this.favoritesService.isFav(userId, refType, refId);
  }
}
