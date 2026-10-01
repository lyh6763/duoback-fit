"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClass } from "@/components/ui/button";
import { compareHref } from "@/lib/compare/list";
import { useCompareList } from "@/lib/compare/store";

const NAV_LINK =
  "inline-flex items-center gap-1.5 px-2 py-1 text-sm font-medium underline-offset-8 hover:underline md:text-md";

export function SiteHeader() {
  const pathname = usePathname();
  const compareList = useCompareList();
  const compareCount = compareList?.length ?? 0;
  const chairsActive = pathname.startsWith("/chairs");
  const compareActive = pathname === "/compare";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="page-container flex h-14 items-center justify-between gap-3 md:h-16 lg:h-18">
        <Link href="/" className="flex shrink-0 items-baseline gap-1.5 text-lg font-bold tracking-tight">
          DUOBACK
          <span className="font-display text-md font-medium text-primary">Fit</span>
        </Link>
        <nav aria-label="주요 메뉴" className="flex items-center gap-1 md:gap-4">
          <Link
            href="/chairs"
            aria-current={chairsActive ? "page" : undefined}
            className={`${NAV_LINK} ${chairsActive ? "underline decoration-2" : ""}`}
          >
            의자
          </Link>
          <Link
            href={compareHref(compareList ?? [])}
            aria-current={compareActive ? "page" : undefined}
            className={`${NAV_LINK} ${compareActive ? "underline decoration-2" : ""}`}
          >
            비교
            {compareCount > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-primary text-xs font-semibold text-inverse tabular-nums">
                {compareCount}
                <span className="sr-only">개 담김</span>
              </span>
            )}
          </Link>
          <Link href="/fit" className={`${buttonClass({ size: "s" })} ml-1`}>
            내 의자 찾기
          </Link>
        </nav>
      </div>
    </header>
  );
}
