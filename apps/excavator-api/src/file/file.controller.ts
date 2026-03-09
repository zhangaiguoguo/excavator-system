import {
  Controller,
  Post,
  Get,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type{ Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { FileService } from './file.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }), // 20MB，支持图片和短视频
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file?.buffer) {
      throw new BadRequestException('请选择要上传的文件');
    }
    const folder = 'common';
    const result = await this.fileService.upload(
      file.buffer,
      file.originalname || 'file',
      file.mimetype || 'application/octet-stream',
      folder,
    );
    const baseUrl = this.configService.get<string>('APP_PUBLIC_URL') || '';
    const url =
      result.url.startsWith('http')
        ? result.url
        : baseUrl
          ? `${baseUrl.replace(/\/$/, '')}${result.url.startsWith('/') ? result.url : '/' + result.url}`
          : result.url;
    return {
      url,
      fileName: result.path,
      path: result.path,
    };
  }

  /** 兼容小程序：POST /file/commom/Upload，支持图片与视频(≤20MB) */
  @Public()
  @Post('commom/Upload')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }),
  )
  async uploadCompat(@UploadedFile() file: Express.Multer.File) {
    return this.upload(file);
  }

  @Public()
  @Get('view')
  async view(
    @Query('fileName') fileName: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!fileName) {
      res.status(400).json({ code: 400, msg: '缺少 fileName' });
      return;
    }
    const decoded = decodeURIComponent(fileName);
    if (decoded.includes('..') || path.isAbsolute(decoded)) {
      res.status(400).json({ code: 400, msg: '非法文件名' });
      return;
    }
    const result = await this.fileService.getFile(decoded);
    if (!result) {
      res.status(404).json({ code: 404, msg: '文件不存在' });
      return;
    }
    if (result.redirectUrl) {
      res.redirect(302, result.redirectUrl);
      return;
    }
    if (result.stream) {
      res.setHeader('Content-Type', result.mimeType || 'application/octet-stream');
      result.stream.pipe(res);
      return;
    }
    res.status(404).json({ code: 404, msg: '文件不可用' });
  }

  /** 兼容小程序：GET /file/commom/View?fileName=xxx */
  @Public()
  @Get('commom/View')
  async viewCompat(
    @Query('fileName') fileName: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.view(fileName, res);
  }
}
