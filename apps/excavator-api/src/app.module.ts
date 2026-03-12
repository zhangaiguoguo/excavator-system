import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
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
import { Job } from './jobs/job.entity';
import { Favorite } from './favorites/favorite.entity';
import { Notification } from './notifications/notification.entity';
import { DictModule } from './system/dict/dict.module';
import { JobsModule } from './jobs/jobs.module';
import { FavoritesModule } from './favorites/favorites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CommentsModule } from './comments/comments.module';
import { Comment } from './comments/comment.entity';
import { CommentLike } from './comments/comment-like.entity';
import { DictType } from './system/dict/entities/dict-type.entity';
import { DictData } from './system/dict/entities/dict-data.entity';
import { FileModule } from './file/file.module';
import { CryptoModule } from './common/crypto/crypto.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { GeoModule } from './geo/geo.module';

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
        entities: [User, Machine, Contract, Record, Order, Job, Favorite, Notification, Comment, CommentLike, DictType, DictData],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
      }),
    }),
    CryptoModule,
    UsersModule,
    MachinesModule,
    ContractsModule,
    RecordsModule,
    OrdersModule,
    JobsModule,
    FavoritesModule,
    NotificationsModule,
    CommentsModule,
    AuthModule,
    DictModule,
    FileModule,
    GeoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
