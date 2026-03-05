
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { code: string; userInfo?: any; phoneCode?: string }) {
    return this.authService.wechatLogin(body.code, body.userInfo, body.phoneCode);
  }
}
