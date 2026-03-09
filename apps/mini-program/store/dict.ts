import { defineStore } from "pinia";
import { DictData } from "@excavator/types";
import { reactive, ref, watch } from "vue";
import type { Ref } from "vue";
import { deepClone } from "@/common/util/util";
import apiService from "@/api/api";

const dictStore = defineStore("dict", () => {
  const dictCaches = reactive(new Map());
  const dictCachesWatch = new Map();
  function transDictDto(arr: DictData[]) {
    return (arr || []).map((item) => {
      return {
        label: item.dictLabel,
        value: item.dictValue,
        text: item.dictLabel,
        elTagType: item.listClass,
        elTagClass: item.cssClass,
        remark: item.remark,
      };
    });
  }

  /**
   * 获取字典数据
   */

  function useDict(...args: string[]) {
    const dicts: Record<string, Ref<ReturnType<typeof transDictDto>>> = {};
    args.forEach((dictType) => {
      dicts[dictType] = ref([]);
      if (dictCaches.has(dictType)) {
        let l;
        if ((l = dictCaches.get(dictType))) {
          dicts[dictType].value = deepClone(l);
        } else {
          if (!dictCachesWatch.has(dictType)) {
            dictCachesWatch.set(dictType, {
              effect: watch(
                () => dictCaches.get(dictType),
                () => {
                  dictCachesWatch.get(dictType).fns.forEach((fn: () => any) => {
                    fn();
                  });
                  dictCachesWatch.delete(dictType);
                },
                {
                  once: true,
                },
              ),
              fns: [],
            });
          }
          dictCachesWatch.get(dictType).fns.push(() => {
            dicts[dictType].value = deepClone(dictCaches.get(dictType));
          });
        }
        return;
      }
      dictCaches.set(dictType, void 0);
      apiService
        .getDictData(dictType)
        .then(({ data }: { data: DictData[]  }) => {
          dicts[dictType].value = transDictDto(data);
          dictCaches.set(dictType, deepClone(dicts[dictType].value));
        });
    });
    return dicts;
  }

  return {
    useDict,
  };
});

export default dictStore;
