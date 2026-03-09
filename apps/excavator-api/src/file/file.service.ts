import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from './storage.interface';
import { LocalStorageService } from './local-storage.service';
import { MinioStorageService } from './minio-storage.service';
import * as fs from 'fs/promises';

export interface GetFileResult {
  stream?: NodeJS.ReadableStream;
  mimeType?: string;
  redirectUrl?: string;
}

@Injectable()
export class FileService {
  private readonly storage: IStorageService;
  private readonly storageType: string;

  constructor(
    private configService: ConfigService,
    private localStorage: LocalStorageService,
    private minioStorage: MinioStorageService,
  ) {
    this.storageType = this.configService.get<string>('STORAGE_TYPE', 'local');
    this.storage =
      this.storageType === 'minio' ? this.minioStorage : this.localStorage;
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder?: string,
  ): Promise<{ path: string; url: string }> {
    return this.storage.upload(buffer, originalName, mimeType, folder);
  }

  async getFile(filePath: string): Promise<GetFileResult | null> {
    if (this.storageType === 'minio') {
      const redirectUrl = this.storage.getUrl(filePath);
      return { redirectUrl };
    }
    const local = this.storage as LocalStorageService;
    const fullPath = local.getFullPath(filePath);
    try {
      await fs.access(fullPath);
    } catch {
      return null;
    }
    return local.getStream(filePath);
  }
}
