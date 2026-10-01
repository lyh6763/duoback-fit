import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="page-container grid gap-8 py-12 md:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <p className="font-bold">
            DUOBACK <span className="font-display font-medium text-primary">Fit</span>
          </p>
          <p className="max-w-md text-sm text-muted-strong">
            포트폴리오용 프로젝트입니다. 제품 정보와 스펙은 가상 데이터이며 실제 브랜드·제품과 관련이 없습니다.
          </p>
        </div>
        <nav aria-label="하단 메뉴">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <li>
              <Link href="/chairs" className="hover:underline">
                의자
              </Link>
            </li>
            <li>
              <Link href="/fit" className="hover:underline">
                내 의자 찾기
              </Link>
            </li>
            <li>
              <Link href="/fit/method" className="hover:underline">
                Fit 계산 방식
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
