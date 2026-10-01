"use client";

import { buttonClass } from "@/components/ui/button";
import { useCompareToggle } from "./use-compare-toggle";

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 4v12M4 10h12" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 카드 이미지 위에 겹치는 원형 아이콘 버튼 */
export function CompareIconToggle({ slug, name }: { slug: string; name: string }) {
  const { inCompare, toggle } = useCompareToggle(slug);
  return (
    <button
      type="button"
      aria-pressed={inCompare}
      aria-label={`${name} 비교에 담기`}
      title={inCompare ? "비교에서 빼기" : "비교에 담기"}
      onClick={toggle}
      className={`grid size-9 place-items-center rounded-full border shadow-sm transition-colors ${
        inCompare
          ? "border-primary bg-primary text-inverse hover:bg-primary-hover"
          : "border-line bg-elevated text-ink hover:border-stone-500"
      }`}
    >
      {inCompare ? <CheckIcon /> : <PlusIcon />}
    </button>
  );
}

/** 상세 페이지의 텍스트 버튼 */
export function CompareButton({ slug }: { slug: string }) {
  const { inCompare, toggle } = useCompareToggle(slug);
  return (
    <button
      type="button"
      aria-pressed={inCompare}
      onClick={toggle}
      className={buttonClass({ variant: "secondary", size: "l" })}
    >
      {inCompare ? <CheckIcon /> : <PlusIcon />}
      {inCompare ? "비교에 담김" : "비교에 담기"}
    </button>
  );
}
