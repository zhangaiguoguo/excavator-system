import { ref, toRefs } from 'vue';
import { getDicts } from '@/api/dict';
import type { DictData } from '@excavator/types';
import { useDictStore } from '@/store/dict';

/**
 * 获取字典数据
 */
export function useDict(...args: string[]) {
  const res = ref<{ [key: string]: DictData[] }>({});
  const dictStore = useDictStore();

  return (() => {
    args.forEach((dictType) => {
      res.value[dictType] = [];
      const dicts = dictStore.getDict(dictType);
      if (dicts) {
        res.value[dictType] = dicts;
      } else {
        getDicts(dictType).then((resp: any) => {
          // Assuming API returns array of DictData
          // If wrapped in { data: ... } adjust accordingly
          // My API returns Repository.find() which is array
          res.value[dictType] = resp;
          dictStore.setDict(dictType, res.value[dictType]);
        });
      }
    });
    return toRefs(res.value);
  })();
}
