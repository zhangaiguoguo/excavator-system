import dictStore from "@/store/dict";

export default function useDict(...args: string[]) {
  return dictStore().useDict(...args);
}

export function useDictOne(dictType:string){
  return dictStore().useDict(dictType)[dictType];
}