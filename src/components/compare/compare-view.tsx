"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { getChair } from "@/data/chairs";
import { compareHref, parseCompareParam } from "@/lib/compare/list";
import { compareActions, useCompareList } from "@/lib/compare/store";
import { profileStore } from "@/lib/fit/store";
import { showToast } from "@/lib/toast";
import { CompareTable } from "./compare-table";

function sameList(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((slug, index) => slug === b[index]);
}

/**
 * 비교 페이지(S07).
 * 처음 들어올 때 URL(?m=)에 목록이 있으면 그것을 비교 목록으로 가져오고(공유 링크),
 * 그 뒤로는 저장된 목록이 기준이 되어 URL을 따라 갱신한다(트레이·되돌리기와 동기화).
 */
export function CompareView() {
  const router = useRouter();
  const params = useSearchParams();
  const urlParam = params.get("m");
  const list = useCompareList();
  const profile = profileStore.useValue();
  const [diffOnly, setDiffOnly] = useState(false);
  const imported = useRef(false);

  useEffect(() => {
    if (list === undefined) return;
    if (!imported.current) {
      imported.current = true;
      const fromUrl = parseCompareParam(urlParam);
      // 유효한 모델이 하나도 없는 링크라면 내 목록을 지우지 않는다
      if (fromUrl.length > 0 && !sameList(fromUrl, list)) {
        compareActions.replace(fromUrl);
        return;
      }
    }
    if (!sameList(parseCompareParam(urlParam), list) || (urlParam !== null && list.length === 0)) {
      router.replace(compareHref(list), { scroll: false });
    }
  }, [list, urlParam, router]);

  if (list === undefined || profile === undefined) {
    return <div className="h-96 animate-pulse rounded-data bg-surface" aria-busy="true" />;
  }

  const chairs = list.flatMap((slug) => getChair(slug) ?? []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("비교 링크를 복사했어요");
    } catch {
      showToast("복사하지 못했어요. 주소창의 링크를 복사해 주세요.");
    }
  }

  if (chairs.length === 0) {
    return (
      <div className="space-y-6 rounded-lg bg-elevated px-6 py-16 text-center">
        <p className="text-xl font-semibold">비교할 의자를 담아주세요</p>
        <p className="text-muted">의자 카드의 + 버튼으로 최대 3개까지 담을 수 있어요.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/chairs" className={buttonClass({ size: "l" })}>
            의자 보러 가기
          </Link>
          <Link href="/fit" className={buttonClass({ size: "l", variant: "secondary" })}>
            내 의자 찾기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={diffOnly}
          disabled={chairs.length < 2}
          onClick={() => setDiffOnly((value) => !value)}
          className="inline-flex items-center gap-3 text-sm font-medium disabled:opacity-50"
        >
          <span
            aria-hidden="true"
            className={`relative h-6 w-11 rounded-full transition-colors ${diffOnly ? "bg-primary" : "bg-sand-300"}`}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
                diffOnly ? "translate-x-5.5" : "translate-x-0.5"
              }`}
            />
          </span>
          차이 나는 항목만
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={copyLink} className={buttonClass({ variant: "secondary", size: "s" })}>
            링크 복사
          </button>
          <button
            type="button"
            onClick={() => {
              const previous = compareActions.get();
              compareActions.clear();
              showToast("비교 목록을 비웠어요", { label: "되돌리기", onClick: () => compareActions.replace(previous) });
            }}
            className={buttonClass({ variant: "ghost", size: "s" })}
          >
            비우기
          </button>
        </div>
      </div>

      {chairs.length < 2 && (
        <p className="text-sm text-muted">한 개 더 담으면 차이 나는 항목과 더 나은 값을 표시해 드려요.</p>
      )}

      <CompareTable chairs={chairs} profile={profile} diffOnly={diffOnly && chairs.length >= 2} />

      <p className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-clay-400" />
          모델마다 값이 다른 항목
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="font-semibold text-data-best">
            ▲
          </span>
          가장 유리한 값 (가격은 낮을수록, 하중·조절 기능은 많을수록)
        </span>
      </p>
    </div>
  );
}
