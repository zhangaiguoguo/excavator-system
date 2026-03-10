import { Controller, Get, Put, Query, Param, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { getRequiredUserId } from '../common/get-user-id';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const userId = getRequiredUserId(req);
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 20;
    const unread = unreadOnly === 'true' || unreadOnly === '1';
    return this.notificationsService.list(userId, pageNum, pageSizeNum, unread);
  }

  @Put(':id/read')
  markRead(@Request() req: any, @Param('id') id: string) {
    const userId = getRequiredUserId(req);
    return this.notificationsService.markRead(id, userId);
  }

  @Put('read-all')
  markAllRead(@Request() req: any) {
    const userId = getRequiredUserId(req);
    return this.notificationsService.markAllRead(userId);
  }
}
