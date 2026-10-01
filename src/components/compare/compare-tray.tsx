"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClass } from "@/components/ui/button";
import { getChair } from "@/data/chairs";
import { chairImage } from "@/lib/chairs/format";
import { COMPARE_MAX, compareHref } from "@/lib/compare/list";
import { compareActions, useCompareFullSignal, useCompareList } from "@/lib/compare/store";

/**
 * 하단 고정 비교 트레이(O01). 담긴 모델이 있을 때만 나타나고, 비교 페이지에서는 숨긴다.
 * 고정 바 높이만큼 흐름 안에 빈 공간을 두어 푸터가 가려지지 않게 한다.
 */
export function CompareTray() {
  const pathname = usePathname();
  const list = useCompareList();
  const fullSignal = useCompareFullSignal();

  if (!list || list.length === 0 || pathname === "/compare") return null;

  const chairs = list.flatMap((slug) => getChair(slug) ?? []);
  const slots = Array.from({ length: COMPARE_MAX }, (_, index) => chairs[index]);
  const ready = chairs.length >= 2;

  return (
    <>
      {/* 고정 바 높이 + 위쪽 보더 1px */}
      <div aria-hidden="true" className="h-[81px] md:h-[97px]" />
      <aside
        aria-label="비교 목록"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-elevated/95 shadow-lg backdrop-blur"
      >
        <div
          key={fullSignal}
          className={`page-container flex h-20 items-center gap-3 md:h-24 md:gap-6 ${fullSignal ? "animate-shake" : ""}`}
        >
          <p className="hidden text-sm font-semibold md:block">
            비교 <span className="tabular-nums">{chairs.length}/{COMPARE_MAX}</span>
          </p>
          <ul className="flex flex-1 items-center gap-2 md:gap-3">
            {slots.map((chair, index) =>
              chair ? (
                <li key={chair.slug} className="relative">
                  <Image
                    src={chairImage(chair, chair.colors[0].slug)}
                    alt={chair.name}
                    width={112}
                    height={112}
                    sizes="56px"
                    className="size-12 rounded-sm bg-photo object-cover md:size-14"
                  />
                  <button
                    type="button"
                    aria-label={`${chair.name} 비교에서 빼기`}
                    onClick={() => compareActions.remove(chair.slug)}
                    className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-ink text-[11px] text-inverse hover:bg-stone-600"
                  >
                    ✕
                  </button>
                </li>
              ) : (
                <li
                  key={`empty-${index}`}
                  aria-hidden="true"
                  className="hidden size-12 rounded-sm border border-dashed border-line sm:block md:size-14"
                />
              ),
            )}
            {!ready && <li className="text-xs text-muted md:text-sm">하나 더 담아주세요</li>}
          </ul>
          <button
            type="button"
            onClick={() => compareActions.clear()}
            className="hidden text-sm text-muted hover:text-ink hover:underline md:block"
          >
            비우기
          </button>
          <Link href={compareHref(list)} className={buttonClass({ size: "m" })}>
            비교하기
            <span className="sr-only"> ({chairs.length}개)</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
