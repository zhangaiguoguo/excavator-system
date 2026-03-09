import { defineStore } from 'pinia';
import type { DictData } from '@excavator/types';

export const useDictStore = defineStore('dict', {
  state: () => ({
    dict: {} as Record<string, DictData[]>
  }),
  actions: {
    // 获取字典
    getDict(key: string): DictData[] | null {
      if (key == null && key == "") {
        return null;
      }
      try {
        return this.dict[key] || null;
      } catch (e) {
        return null;
      }
    },
    // 设置字典
    setDict(key: string, value: DictData[]) {
      if (key !== null && key !== "") {
        this.dict[key] = value;
      }
    },
    // 删除字典
    removeDict(key: string) {
      try {
        delete this.dict[key];
      } catch (e) {}
    },
    // 清空字典
    cleanDict() {
      this.dict = {};
    }
  }
});
