import { useSyncExternalStore } from "react";

export type Toast = {
  id: number;
  message: string;
  action?: { label: string; href?: string; onClick?: () => void };
};

const DURATION_MS = 4000;

let current: Toast | null = null;
let nextId = 1;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/** 화면 하단에 한 번에 하나만 띄운다. 새 토스트가 오면 이전 것을 대체한다. */
export function showToast(message: string, action?: Toast["action"]) {
  current = { id: nextId++, message, action };
  clearTimeout(timer);
  timer = setTimeout(dismissToast, DURATION_MS);
  emit();
}

export function dismissToast() {
  clearTimeout(timer);
  current = null;
  emit();
}

export function useToast() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
    () => null,
  );
}
