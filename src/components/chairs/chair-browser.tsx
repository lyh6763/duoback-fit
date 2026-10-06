"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { buttonClass } from "@/components/ui/button";
import { CHAIRS } from "@/data/chairs";
import { CATEGORY_LABEL } from "@/lib/chairs/format";
import { CATEGORIES, type Chair } from "@/lib/chairs/types";
import { scoreChair } from "@/lib/fit/score";
import { profileStore } from "@/lib/fit/store";
import { ChairCard } from "./chair-card";

const SORTS = {
  recommended: "추천순",
  "price-asc": "낮은 가격순",
  "price-desc": "높은 가격순",
  newest: "최신순",
} as const;
type SortKey = keyof typeof SORTS;

function isSortKey(value: string | null): value is SortKey {
  return value !== null && Object.hasOwn(SORTS, value);
}

export function ChairBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const profile = profileStore.useValue();

  const categoryParam = params.get("category");
  const category = CATEGORIES.find((c) => c === categoryParam) ?? null;
  const headrestOnly = params.get("headrest") === "1";
  const sortParam = params.get("sort");
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "recommended";

  const scores = useMemo(() => {
    const map = new Map<string, number>();
    if (!profile) return map;
    for (const chair of CHAIRS) {
      const result = scoreChair(profile, chair);
      if (result) map.set(chair.slug, result.total);
    }
    return map;
  }, [profile]);

  const chairs = useMemo(() => {
    const filtered = CHAIRS.filter(
      (chair) => (category === null || chair.category === category) && (!headrestOnly || chair.spec.headrest),
    );
    const byScore = (a: Chair, b: Chair) => (scores.get(b.slug) ?? -1) - (scores.get(a.slug) ?? -1);
    const compare: Record<SortKey, (a: Chair, b: Chair) => number> = {
      recommended: profile ? byScore : () => 0,
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      newest: (a, b) => b.releaseDate.localeCompare(a.releaseDate),
    };
    return [...filtered].sort(compare[sort]);
  }, [category, headrestOnly, sort, scores, profile]);

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const chipClass = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
      active ? "border-ink bg-ink text-inverse" : "border-line bg-elevated hover:border-stone-500"
    }`;

  return (
    <div className="space-y-8">
      {profile === null && (
        <Link
          href="/fit"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-primary-subtle px-5 py-4 text-moss-700 hover:bg-moss-100"
        >
          <span className="font-medium">내 몸에 맞는 의자만 보고 싶다면 1분 질문에 답해 보세요</span>
          <span className="text-sm font-semibold">내 의자 찾기 →</span>
        </Link>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="용도" className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={category === null} onClick={() => update({ category: null })} className={chipClass(category === null)}>
              전체
            </button>
            {CATEGORIES.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={category === key}
                onClick={() => update({ category: key })}
                className={chipClass(category === key)}
              >
                {CATEGORY_LABEL[key]}
              </button>
            ))}
          </div>
          <span aria-hidden="true" className="mx-1 h-6 w-px bg-line" />
          <button
            type="button"
            aria-pressed={headrestOnly}
            onClick={() => update({ headrest: headrestOnly ? null : "1" })}
            className={chipClass(headrestOnly)}
          >
            헤드레스트 있음
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">정렬</span>
          <select
            value={sort}
            onChange={(event) => update({ sort: event.target.value === "recommended" ? null : event.target.value })}
            className="h-10 rounded-sm border border-line bg-elevated px-3 font-medium"
          >
            {Object.entries(SORTS).map(([key, label]) => (
              <option key={key} value={key}>
                {key === "recommended" && profile ? "적합도순" : label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm text-muted" aria-live="polite">
        <span className="font-semibold text-ink tabular-nums">{chairs.length}</span>개 모델
      </p>

      {chairs.length === 0 ? (
        <div className="space-y-4 rounded-lg bg-elevated p-10 text-center">
          <p className="text-lg font-semibold">조건에 맞는 의자가 없어요</p>
          <button type="button" onClick={() => update({ category: null, headrest: null })} className={buttonClass({ variant: "secondary" })}>
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6">
          {chairs.map((chair, index) => (
            <ChairCard key={chair.slug} chair={chair} score={scores.get(chair.slug)} priority={index < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
