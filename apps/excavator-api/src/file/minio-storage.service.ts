import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import * as path from 'path';
import { IStorageService } from './storage.interface';

@Injectable()
export class MinioStorageService implements IStorageService {
  private readonly client: Minio.Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private configService: ConfigService) {
    this.client = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: this.configService.get<number>('MINIO_PORT', 9000),
      useSSL: this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
    });
    this.bucket = this.configService.get<string>('MINIO_BUCKET', 'excavator');
    this.publicUrl = this.configService.get<string>(
      'MINIO_PUBLIC_URL',
      '',
    ).replace(/\/$/, '');
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder = 'common',
  ): Promise<{ path: string; url: string }> {
    const ext = path.extname(originalName) || '.bin';
    const baseName = path.basename(originalName, ext).replace(/[^\w\u4e00-\u9fa5-]/g, '_');
    const objectName = `${folder}/${baseName}_${Date.now()}${ext}`;

    await this.ensureBucket();
    await this.client.putObject(this.bucket, objectName, buffer, buffer.length, {
      'Content-Type': mimeType,
    });

    const url = this.getUrl(objectName);
    return { path: objectName, url };
  }

  getUrl(objectName: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${this.bucket}/${objectName}`;
    }
    const port = this.configService.get<number>('MINIO_PORT', 9000);
    const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const protocol = useSSL ? 'https' : 'http';
    return `${protocol}://${endpoint}:${port}/${this.bucket}/${objectName}`;
  }

  private async ensureBucket(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket, 'us-east-1');
    }
  }
}
