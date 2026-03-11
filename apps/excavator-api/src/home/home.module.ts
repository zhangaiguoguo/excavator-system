import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { Machine } from '../machines/machine.entity';
import { Order } from '../orders/order.entity';
import { Favorite } from '../favorites/favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Machine, Order, Favorite])],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}

