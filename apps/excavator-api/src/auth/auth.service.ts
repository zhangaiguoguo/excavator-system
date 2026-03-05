import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { LoginResponse } from '@excavator/types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async wechatLogin(
    code: string,
    userInfo?: any,
    phoneCode?: string,
  ): Promise<LoginResponse> {
    // 1. Get OpenID and SessionKey from WeChat API
    const appId = this.configService.get<string>('WECHAT_APP_ID');
    const appSecret = this.configService.get<string>('WECHAT_APP_SECRET');

    let openid: string;
    let sessionKey: string;
    let unionid: string | undefined;

    if (code.startsWith('mock_')) {
      openid = 'mock_openid_' + code.split('_')[1];
      sessionKey = 'mock_session_key';
      unionid = undefined;
    } else {
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { data } = (await firstValueFrom(this.httpService.get(url))) as {
          data: {
            errcode: number;
            errmsg: string;
            openid: string;
            session_key: string;
            unionid: string;
          };
        };
        if (data.errcode) {
          throw new UnauthorizedException(`WeChat API Error: ${data.errmsg}`);
        }
        openid = data.openid;
        sessionKey = data.session_key;
        unionid = data.unionid;
      } catch (error: any) {
        throw new UnauthorizedException(
          `Failed to authenticate with WeChat -> ${error + ''}`,
        );
      }
    }

    // 2. Handle Phone Number (if provided)
    let phoneNumber: string = '';
    if (phoneCode) {
      // Use the code to get phone number (New WeChat API since late 2023)
      // https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html
      try {
        const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
        const tokenRes = (await firstValueFrom(
          this.httpService.get(tokenUrl),
        )) as Record<any, any>;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        const accessToken = tokenRes.data.access_token;

        const phoneUrl = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;
        const phoneRes = await firstValueFrom(
          this.httpService.post(phoneUrl, { code: phoneCode }),
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (phoneRes.data.errcode === 0) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          phoneNumber = phoneRes.data.phone_info.phoneNumber;
        }
      } catch (e) {
        console.error('Failed to get phone number', e);
      }
    }

    // 3. Find or create/update user
    let user = (await this.usersService.findByOpenId(openid)) as any;

    const userData: any = {
      wxOpenid: openid,
      unionId: unionid,
      lastLoginAt: new Date(),
    };

    if (phoneNumber) {
      userData.phone = phoneNumber;
    }

    if (userInfo) {
      userData.nickname = userInfo.nickName;
      userData.avatar = userInfo.avatarUrl;
      userData.gender = userInfo.gender;
    }

    if (!user) {
      // Create new user
      userData.role = 1; // Default role
      if (!userData.phone) userData.phone = 'Unknown'; // Placeholder if no phone
      user = await this.usersService.create(userData);
    } else {
      // Update existing user
      user = await this.usersService.update(user.id, userData);
    }

    // 4. Generate JWT
    const payload = { sub: user!.id, openid: user!.wxOpenid, role: user!.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }
}
