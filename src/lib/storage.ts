import { useSyncExternalStore } from "react";
import type { ZodMiniType } from "zod/mini";

type Listener = () => void;

/**
 * Web Storage 값을 검증된 타입으로 구독하는 작은 외부 스토어.
 * - 시크릿 모드 등에서 Storage 접근이 막히면 메모리에만 보관한다.
 * - 서버 렌더와 하이드레이션 중에는 `undefined`(아직 모름)를 돌려준다.
 */
export function createStorageStore<T>(key: string, area: "local" | "session", schema: ZodMiniType<T>) {
  const listeners = new Set<Listener>();
  let memory: string | null = null;
  let cachedRaw: string | null | undefined;
  let cachedValue: T | null = null;

  function storage() {
    try {
      return area === "local" ? window.localStorage : window.sessionStorage;
    } catch {
      return null;
    }
  }

  function readRaw() {
    try {
      return storage()?.getItem(key) ?? memory;
    } catch {
      return memory;
    }
  }

  function get(): T | null {
    const raw = readRaw();
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    if (raw === null) {
      cachedValue = null;
    } else {
      try {
        const parsed = schema.safeParse(JSON.parse(raw));
        cachedValue = parsed.success ? parsed.data : null;
      } catch {
        cachedValue = null;
      }
    }
    return cachedValue;
  }

  function set(value: T | null) {
    const raw = value === null ? null : JSON.stringify(value);
    memory = raw;
    try {
      if (raw === null) storage()?.removeItem(key);
      else storage()?.setItem(key, raw);
    } catch {
      // 저장 실패 시 메모리 값만 유지한다
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function useValue(): T | null | undefined {
    return useSyncExternalStore(subscribe, get, () => undefined);
  }

  return { get, set, useValue };
}
