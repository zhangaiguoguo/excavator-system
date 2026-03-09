import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('profile')
  getProfile(@Request() req) {
    // In a real app with JWT Guard, use req.user.id
    // For now we mock it or use a query param if no auth guard yet
    // return this.usersService.findOne(req.user.id);
    return { message: 'This endpoint needs AuthGuard to get current user' };
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() user: Partial<User>): Promise<User> {
    return this.usersService.create(user);
  }

  @Post('/update')
  update(@Body() user: Partial<User>): Promise<User | null> {
    return this.usersService.update(user.id as string, user);
  }

  @Post('/authorizeRealName')
  authorizeRealName(@Body() body: Partial<User>): Promise<User | null> {
    return this.usersService.authorizeRealName(body);
  }

  @Post(':id/password')
  updatePassword(@Param('id') id: string, @Body() body: any): Promise<any> {
    return this.usersService.updatePassword(
      id,
      body.oldPassword,
      body.newPassword,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
