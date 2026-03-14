export const ACCESS_TOKEN = 'Access-Token'
export const USER_NAME = 'login_username'
export const USER_INFO = 'login_user_info'
export const X_TENANT_ID = 'X-Tenant-Id'

/** 发布物状态：上架/进行中 vs 下架/已关闭（设备、需求、揽活通用） */
export const PublishStatus = {
  OFF_SHELF: '0',
  ON_SHELF: '1',
}

/** 是否上架/进行中 */
export function isOnShelf(status) {
  return status === PublishStatus.ON_SHELF
}

/** 是否已下架/已关闭 */
export function isOffShelf(status) {
  return status === PublishStatus.OFF_SHELF
}

/** 需求状态（与 PublishStatus 兼容，多一个已完成） */
export const DemandStatus = {
  OFF_SHELF: '0',
  ON_SHELF: '1',
  COMPLETED: '2',
}

/** 内容引用类型（聊天、通知、订阅、收藏等） */
export const RefType = {
  MACHINE: 'machine',
  DEMAND: 'demand',
  JOB: 'job',
}


const STORAGE_OPTIONS = {
  namespace: 'pro__', // key prefix
    name: 'ls', // name variable Vue.[ls] or this.[$ls],
    storage: 'local', // storage name session, local, memory
}

export default STORAGE_OPTIONS;


