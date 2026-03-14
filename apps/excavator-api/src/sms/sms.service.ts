import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CryptoService } from '../common/crypto/crypto.service';
import Dysmsapi20170525, {
  SendSmsRequest,
} from '@alicloud/dysmsapi20170525';
import { Config as OpenApiConfig } from '@alicloud/openapi-core/dist/utils';

@Injectable()
export class SmsService {
  private readonly enabled: boolean;
  private client: Dysmsapi20170525 | null = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cryptoService: CryptoService,
  ) {
    this.enabled =
      this.configService.get<string>('SMS_ENABLED') === 'true' &&
      !!this.configService.get<string>('SMS_ALIYUN_ACCESS_KEY_ID') &&
      !!this.configService.get<string>('SMS_ALIYUN_ACCESS_KEY_SECRET');
    if (this.enabled) {
      this.client = new Dysmsapi20170525(
        new OpenApiConfig({
          accessKeyId: this.configService.get<string>(
            'SMS_ALIYUN_ACCESS_KEY_ID',
          ),
          accessKeySecret: this.configService.get<string>(
            'SMS_ALIYUN_ACCESS_KEY_SECRET',
          ),
          endpoint: 'dysmsapi.aliyuncs.com',
          regionId:
            this.configService.get<string>('SMS_ALIYUN_REGION_ID') ||
            'cn-hangzhou',
        }),
      );
    }
  }

  /**
   * 向指定手机号发送短信（使用配置的模板，模板变量 content）
   */
  async send(phone: string, content: string): Promise<boolean> {
    if (!this.enabled || !this.client) return false;
    const signName =
      this.configService.get<string>('SMS_SIGN_NAME') || '';
    const templateCode =
      this.configService.get<string>('SMS_TEMPLATE_CODE') || '';
    if (!signName || !templateCode) return false;
    const normalized = phone.replace(/\D/g, '');
    const phoneNumbers =
      normalized.length === 11 && /^1\d{10}$/.test(normalized)
        ? normalized
        : normalized.startsWith('86')
          ? normalized
          : '86' + normalized;
    const request = new SendSmsRequest({
      phoneNumbers: phoneNumbers,
      signName,
      templateCode,
      templateParam: JSON.stringify({ content }),
    });
    try {
      const res = await this.client.sendSms(request);
      return res.body?.code === 'OK';
    } catch {
      return false;
    }
  }

  /**
   * 根据用户 ID 查询手机号并发送短信（站内通知同内容）
   */
  async sendToUser(userId: string, content: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'phone'],
    });
    if (!user?.phone) return false;
    const plain = this.cryptoService.decrypt(user.phone) ?? user.phone;
    return this.send(plain, content);
  }
}
