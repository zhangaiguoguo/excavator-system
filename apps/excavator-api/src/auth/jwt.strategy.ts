import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'excavator_secret_key',
    });
  }

  async validate(payload: any) {
    // If payload.isTemp is true, it's a temporary guest token
    // We can return a specific user object or just the payload
    return { userId: payload.sub, role: payload.role, isTemp: payload.isTemp };
  }
}
