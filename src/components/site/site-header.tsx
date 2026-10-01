"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClass } from "@/components/ui/button";
import { compareHref } from "@/lib/compare/list";
import { useCompareList } from "@/lib/compare/store";

type NavItem = { href: string; label: string; active: boolean; badge?: number };

/**
 * 데스크톱은 한 줄, 모바일은 두 줄(로고 + CTA / 메뉴 탭).
 * 헤더 높이는 globals.css의 --header-h와 맞춰야 한다(비교표 머리글이 그 아래에 고정된다).
 */
export function SiteHeader() {
  const pathname = usePathname();
  const compareList = useCompareList();
  const compareCount = compareList?.length ?? 0;

  const items: NavItem[] = [
    { href: "/chairs", label: "의자", active: pathname.startsWith("/chairs") },
    { href: compareHref(compareList ?? []), label: "비교", active: pathname === "/compare", badge: compareCount },
    { href: "/stores", label: "매장", active: pathname === "/stores" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="page-container flex h-14 items-center justify-between gap-3 md:h-16 lg:h-18">
        <Link href="/" className="flex shrink-0 items-baseline gap-1.5 text-lg font-bold tracking-tight">
          DUOBACK
          <span className="font-display text-md font-medium text-primary">Fit</span>
        </Link>
        <nav aria-label="주요 메뉴" className="hidden items-center gap-4 md:flex">
          {items.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
          <Link href="/fit" className={`${buttonClass({ size: "s" })} ml-1`}>
            내 의자 찾기
          </Link>
        </nav>
        <Link href="/fit" className={`${buttonClass({ size: "s" })} md:hidden`}>
          내 의자 찾기
        </Link>
      </div>

      <nav aria-label="주요 메뉴" className="border-t border-line md:hidden">
        <ul className="page-container grid h-11 grid-cols-3">
          {items.map((item) => (
            <li key={item.label} className="grid">
              <NavLink item={item} tab />
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function NavLink({ item, tab = false }: { item: NavItem; tab?: boolean }) {
  const layout = tab
    ? `justify-center border-b-2 text-sm ${item.active ? "border-ink" : "border-transparent"}`
    : `px-2 py-1 text-md underline-offset-8 hover:underline ${item.active ? "underline decoration-2" : ""}`;

  return (
    <Link
      href={item.href}
      aria-current={item.active ? "page" : undefined}
      className={`inline-flex items-center gap-1.5 font-medium ${layout}`}
    >
      {item.label}
      {item.badge ? (
        <span className="grid size-5 place-items-center rounded-full bg-primary text-xs font-semibold text-inverse tabular-nums">
          {item.badge}
          <span className="sr-only">개 담김</span>
        </span>
      ) : null}
    </Link>
  );
}
