/**
 * 列表刷新通用方法：新增/编辑/删除成功后刷新列表
 * 用法：const refreshList = useListRefresh(getList); 在提交成功的 then 里调用 refreshList()
 */
export function useListRefresh(refreshFn: () => void): () => void {
  return refreshFn;
}
