import { useMemo, useSyncExternalStore } from "react";
import * as z from "zod/mini";
import { createStorageStore } from "@/lib/storage";
import { addToCompareList, removeFromCompareList, sanitizeCompareList, type AddResult } from "./list";

const store = createStorageStore("duoback-fit:compare", "local", z.array(z.string()).check(z.maxLength(10)));

/** 데이터에서 사라진 모델이 저장돼 있어도 걸러서 돌려준다. 하이드레이션 전에는 undefined. */
export function useCompareList() {
  const raw = store.useValue();
  return useMemo(() => (raw === undefined ? undefined : sanitizeCompareList(raw ?? [])), [raw]);
}

function current() {
  return sanitizeCompareList(store.get() ?? []);
}

/* "가득 참" 신호: 트레이가 이 값의 변화를 보고 흔들림 애니메이션을 다시 재생한다. */
let fullSignal = 0;
const fullListeners = new Set<() => void>();

export function useCompareFullSignal() {
  return useSyncExternalStore(
    (listener) => {
      fullListeners.add(listener);
      return () => fullListeners.delete(listener);
    },
    () => fullSignal,
    () => 0,
  );
}

export const compareActions = {
  add(slug: string): AddResult {
    const { list, result } = addToCompareList(current(), slug);
    if (result === "added") store.set(list);
    if (result === "full") {
      fullSignal += 1;
      fullListeners.forEach((listener) => listener());
    }
    return result;
  },
  remove(slug: string) {
    store.set(removeFromCompareList(current(), slug));
  },
  replace(slugs: readonly string[]) {
    store.set(sanitizeCompareList(slugs));
  },
  clear() {
    store.set([]);
  },
  get: current,
};
