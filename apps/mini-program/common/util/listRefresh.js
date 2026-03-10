/**
 * 列表刷新提示（通用）：新增/编辑成功后返回列表时自动刷新
 * 用法：
 * - 在新增/编辑页提交成功后调用 setListRefreshHint('machine')，再 navigateBack
 * - 在列表页 onShow 里调用 tryRefreshList('machine', () => this.fetchMachines(true))
 */

const hints = {};

/**
 * 设置返回列表时需要刷新（在新增/编辑页提交成功后、navigateBack 前调用）
 * @param {string} key 列表标识，如 'machine' | 'demand' | 'job' | 'record' | 'contract'
 */
export function setListRefreshHint(key) {
  if (key) hints[key] = true;
}

/**
 * 取出并清除刷新标记，若需要刷新则返回 true
 * @param {string} key 列表标识
 * @returns {boolean}
 */
export function getAndClearListRefreshHint(key) {
  const need = !!hints[key];
  hints[key] = false;
  return need;
}

/**
 * 列表页 onShow 中调用：若从新增/编辑返回则执行刷新
 * @param {string} key 列表标识
 * @param {() => void} fetchFn 刷新方法，如 () => this.fetchMachines(true)
 */
export function tryRefreshList(key, fetchFn) {
  if (getAndClearListRefreshHint(key) && typeof fetchFn === 'function') {
    fetchFn();
  }
}
