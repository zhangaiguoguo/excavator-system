import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { getRequiredUserId } from '../common/get-user-id';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findByRef(
    @Query('refType') refType: string,
    @Query('refId') refId: string,
    @Request() req: any,
  ) {
    const userId = req?.user?.userId;
    return this.commentsService.findByRef(refType || '', refId || '', userId);
  }

  @Post(':id/like')
  toggleLike(@Param('id') id: string, @Request() req: any) {
    const userId = getRequiredUserId(req);
    return this.commentsService.toggleLike(id, userId);
  }

  @Post()
  create(
    @Request() req: any,
    @Body() body: { refType: string; refId: string; content: string },
  ) {
    const userId = getRequiredUserId(req);
    return this.commentsService.create(
      body.refType,
      body.refId,
      userId,
      body.content || '',
    );
  }
}
