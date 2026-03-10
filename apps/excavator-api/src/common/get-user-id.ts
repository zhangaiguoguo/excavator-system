import { UnauthorizedException } from '@nestjs/common';

export interface JwtUser {
  userId: string;
  role?: string;
  isTemp?: boolean;
}

/**
 * 从请求中获取当前登录用户 ID，必须为真实用户（非临时 token）。
 * 用于创建/修改需要归属用户的资源（设备、需求、揽活、收藏等）。
 * @throws UnauthorizedException 未登录、临时 token 或 userId 为空时
 */
export function getRequiredUserId(req: { user?: JwtUser }): string {
  const user = req?.user;
  const userId = user?.userId;
  if (
    userId == null ||
    String(userId).trim() === '' ||
    user?.isTemp === true ||
    userId === 'temp'
  ) {
    throw new UnauthorizedException('请先登录');
  }
  return String(userId);
}
