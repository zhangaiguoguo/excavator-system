/**
 * 存储接口：本地与 MinIO 统一抽象
 */
export interface IStorageService {
  /**
   * 上传文件，返回访问路径（相对或绝对 URL）
   */
  upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder?: string,
  ): Promise<{ path: string; url: string }>;

  /**
   * 获取文件可访问 URL（本地为相对路径，MinIO 为完整 URL）
   */
  getUrl(filePath: string): string;

  /**
   * 获取文件流（用于本地 GET 下载/预览）
   */
  getStream?(filePath: string): Promise<{ stream: NodeJS.ReadableStream; mimeType?: string }>;
}
