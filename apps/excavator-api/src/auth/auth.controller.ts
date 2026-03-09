
import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: { code: string; userInfo?: any; phoneCode?: string }) {
    return this.authService.wechatLogin(body.code, body.userInfo, body.phoneCode);
  }

  @Public()
  @Get('temp-token')
  async getTempToken() {
    return this.authService.generateTempToken();
  }
}
