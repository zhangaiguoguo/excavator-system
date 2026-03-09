import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream } from 'fs';
import { IStorageService } from './storage.interface';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly uploadDir: string;
  private readonly publicPath: string;

  constructor(private configService: ConfigService) {
    this.uploadDir =
      this.configService.get<string>('UPLOAD_DIR') ||
      path.join(process.cwd(), 'uploads');
    this.publicPath =
      this.configService.get<string>('FILE_PUBLIC_PATH') || '/file/view';
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder = 'common',
  ): Promise<{ path: string; url: string }> {
    const ext = path.extname(originalName) || '.bin';
    const baseName = path.basename(originalName, ext).replace(/[^\w\u4e00-\u9fa5-]/g, '_');
    const fileName = `${baseName}_${Date.now()}${ext}`;
    const relativePath = path.join(folder, fileName);
    const fullPath = path.join(this.uploadDir, relativePath);
    const dir = path.dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, buffer);

    const url = `${this.publicPath}?fileName=${encodeURIComponent(relativePath)}`;
    return { path: relativePath, url };
  }

  getUrl(filePath: string): string {
    return `${this.publicPath}?fileName=${encodeURIComponent(filePath)}`;
  }

  getFullPath(relativePath: string): string {
    return path.join(this.uploadDir, relativePath);
  }

  async getStream(relativePath: string) {
    const fullPath = this.getFullPath(relativePath);
    const stream = createReadStream(fullPath);
    const ext = path.extname(relativePath).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    };
    const mimeType = mimeMap[ext] || 'application/octet-stream';
    return { stream, mimeType };
  }
}
