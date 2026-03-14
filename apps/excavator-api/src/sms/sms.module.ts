import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../users/user.entity';
import { SmsService } from './sms.service';
import { CryptoModule } from '../common/crypto/crypto.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    CryptoModule,
  ],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
