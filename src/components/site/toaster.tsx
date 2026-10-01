"use client";

import Link from "next/link";
import { dismissToast, useToast } from "@/lib/toast";

/**
 * 토스트 영역. 라이브 영역은 항상 DOM에 두어야 스크린 리더가 새 메시지를 읽는다.
 * 비교 트레이(최대 높이 88px) 위에 뜨도록 하단 여백을 둔다.
 */
export function Toaster() {
  const toast = useToast();

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center px-5"
    >
      {toast && (
        <div
          key={toast.id}
          className="pointer-events-auto flex max-w-md animate-toast-in items-center gap-4 rounded-full bg-ink py-3 pr-3 pl-5 text-sm text-inverse shadow-lg"
        >
          <span>{toast.message}</span>
          {toast.action &&
            (toast.action.href ? (
              <Link
                href={toast.action.href}
                onClick={dismissToast}
                className="shrink-0 rounded-full px-3 py-1 font-semibold text-moss-100 underline-offset-4 hover:underline"
              >
                {toast.action.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick?.();
                  dismissToast();
                }}
                className="shrink-0 rounded-full px-3 py-1 font-semibold text-moss-100 underline-offset-4 hover:underline"
              >
                {toast.action.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
