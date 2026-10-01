"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClass } from "@/components/ui/button";

export function SiteHeader() {
  const pathname = usePathname();
  const chairsActive = pathname.startsWith("/chairs");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="page-container flex h-14 items-center justify-between gap-4 md:h-16 lg:h-18">
        <Link href="/" className="flex items-baseline gap-1.5 text-lg font-bold tracking-tight">
          DUOBACK
          <span className="font-display text-md font-medium text-primary">Fit</span>
        </Link>
        <nav aria-label="주요 메뉴" className="flex items-center gap-2 md:gap-4">
          <Link
            href="/chairs"
            aria-current={chairsActive ? "page" : undefined}
            className={`px-2 py-1 text-sm font-medium underline-offset-8 hover:underline md:text-md ${
              chairsActive ? "underline decoration-2" : ""
            }`}
          >
            의자
          </Link>
          <Link href="/fit" className={buttonClass({ size: "s" })}>
            내 의자 찾기
          </Link>
        </nav>
      </div>
    </header>
  );
}
