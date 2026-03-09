import {
  computed,
  ComputedRef,
  DebuggerOptions,
  WritableComputedRef,
  ComputedSetter,
  ComputedGetter,
} from "vue";
import { isFunction } from "@/common/util/util";

export default function useComputed<T, T2>(
  getter: ComputedGetter<T>,
  setter?: (ComputedSetter<T> | DebuggerOptions) & T2,
  options?: DebuggerOptions,
): T2 extends Function ? WritableComputedRef<T> : ComputedRef<T> {
  if (arguments.length > 1 && isFunction(setter)) {
    // @ts-ignore
    return computed(
      {
        set: setter as ComputedSetter<T>,
        get: getter,
      },
      options,
    ) as WritableComputedRef<T>;
  }
  // @ts-ignore
  return computed(getter, setter as DebuggerOptions);
}
