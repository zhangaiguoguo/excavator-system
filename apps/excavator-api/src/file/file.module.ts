import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { LocalStorageService } from './local-storage.service';
import { MinioStorageService } from './minio-storage.service';

@Module({
  imports: [ConfigModule],
  controllers: [FileController],
  providers: [FileService, LocalStorageService, MinioStorageService],
  exports: [FileService],
})
export class FileModule {}
