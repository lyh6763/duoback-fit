"use client";

import { COMPARE_MAX, compareHref } from "@/lib/compare/list";
import { compareActions, useCompareList } from "@/lib/compare/store";
import { showToast } from "@/lib/toast";

/** 비교 담기/빼기와 그 결과 안내(토스트)를 한곳에서 처리한다. */
export function useCompareToggle(slug: string) {
  const list = useCompareList();
  const inCompare = list?.includes(slug) ?? false;

  function toggle() {
    if (inCompare) {
      compareActions.remove(slug);
      showToast("비교에서 뺐어요", { label: "되돌리기", onClick: () => compareActions.add(slug) });
      return;
    }
    const result = compareActions.add(slug);
    if (result === "full") {
      showToast(`최대 ${COMPARE_MAX}개까지 비교할 수 있어요. 하나를 빼고 담아주세요.`);
      return;
    }
    const next = compareActions.get();
    showToast(
      `비교에 담았어요 · ${next.length}/${COMPARE_MAX}`,
      next.length >= 2 ? { label: "비교하기", href: compareHref(next) } : undefined,
    );
  }

  return { inCompare, toggle, ready: list !== undefined };
}
