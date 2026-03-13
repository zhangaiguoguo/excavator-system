import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealtimeGateway } from './realtime.gateway';
import { ChatController } from './chat.controller';
import { Order } from '../orders/order.entity';
import { Machine } from '../machines/machine.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { ChatMessage } from './chat-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Machine, ChatMessage]), NotificationsModule],
  providers: [RealtimeGateway],
  controllers: [ChatController],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}

