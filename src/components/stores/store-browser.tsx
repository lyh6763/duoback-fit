"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { CHAIRS, getChair } from "@/data/chairs";
import { STORES } from "@/data/stores";
import { rankChairs } from "@/lib/fit/score";
import { profileStore } from "@/lib/fit/store";
import { StoreCard } from "./store-card";

const CHIP = "inline-block rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors";

/** 모델 필터(?model=)로 해당 모델을 전시한 매장만 보여준다. 필터 칩은 링크라 뒤로가기와 공유가 된다. */
export function StoreBrowser() {
  const params = useSearchParams();
  const modelParam = params.get("model");
  const model = modelParam && getChair(modelParam) ? modelParam : null;
  const profile = profileStore.useValue();

  const recommended = useMemo(
    () => (profile ? (rankChairs(profile, CHAIRS)[0]?.chair.slug ?? null) : null),
    [profile],
  );

  const stores = model ? STORES.filter((store) => store.displayModels.includes(model)) : STORES;
  const modelName = model ? getChair(model)?.name : null;

  return (
    <div className="space-y-8">
      <nav aria-label="모델별 매장 필터">
        <ul className="flex gap-2 overflow-x-auto pb-1">
          <li>
            <Link
              href="/stores"
              scroll={false}
              aria-current={model === null ? "page" : undefined}
              className={`${CHIP} ${model === null ? "border-ink bg-ink text-inverse" : "border-line bg-elevated hover:border-stone-500"}`}
            >
              전체
            </Link>
          </li>
          {CHAIRS.map((chair) => {
            const active = chair.slug === model;
            return (
              <li key={chair.slug}>
                <Link
                  href={`/stores?model=${chair.slug}`}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={`${CHIP} ${active ? "border-ink bg-ink text-inverse" : "border-line bg-elevated hover:border-stone-500"}`}
                >
                  {chair.name}
                  {chair.slug === recommended && <span className="sr-only"> (내 추천 1순위)</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className="text-sm text-muted" aria-live="polite">
        {modelName ? (
          <>
            <span className="font-semibold text-ink">{modelName}</span> 전시 매장{" "}
            <span className="font-semibold text-ink tabular-nums">{stores.length}</span>곳
          </>
        ) : (
          <>
            전국 매장 <span className="font-semibold text-ink tabular-nums">{stores.length}</span>곳
          </>
        )}
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} highlight={model} recommended={recommended} />
        ))}
      </div>
    </div>
  );
}
