/**
 * 发布前校验：是否已绑定手机号、是否已通过实名认证
 * 用于发布设备/需求/揽活等入口
 * @param {object} userInfo 用户信息 { id, phone, realNameStatus }
 * @returns {{ can: boolean, message?: string }} can 为 true 表示可发布；否则 message 为提示文案
 */
import { Constants, UserRealNameStatus } from '@excavator/types';

export function checkUserCanPublish(userInfo) {
  if (!userInfo || !userInfo.id) {
    return { can: false, message: '请先登录' };
  }
  const phone = (userInfo.phone || '').trim();
  if (!phone || phone === Constants.DEFAULT_PHOTO) {
    return { can: false, message: '请先绑定手机号后再发布' };
  }
  if (userInfo.realNameStatus !== UserRealNameStatus.APPROVED) {
    return { can: false, message: '请先完成实名认证后再发布' };
  }
  return { can: true };
}
