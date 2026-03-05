import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MachinesModule } from './machines/machines.module';
import { ContractsModule } from './contracts/contracts.module';
import { RecordsModule } from './records/records.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { Machine } from './machines/machine.entity';
import { Contract } from './contracts/contract.entity';
import { Record } from './records/record.entity';
import { Order } from './orders/order.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Machine, Contract, Record, Order],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
      }),
    }),
    UsersModule,
    MachinesModule,
    ContractsModule,
    RecordsModule,
    OrdersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
