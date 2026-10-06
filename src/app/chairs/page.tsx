import type { Metadata } from "next";
import { Suspense } from "react";
import { ChairBrowser } from "@/components/chairs/chair-browser";
import { ChairCard } from "@/components/chairs/chair-card";
import { CHAIRS } from "@/data/chairs";

export const metadata: Metadata = {
  title: "의자",
  description: "사무용·학생용 의자 라인업을 내 키에 맞는 범위와 함께 비교해 보세요.",
};

export default function ChairsPage() {
  return (
    <div className="page-container space-y-10 py-10 md:py-14">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">의자</h1>
        <p className="text-muted">모델마다 좌판 높이로 계산한 권장 키 범위를 함께 보여드려요.</p>
      </header>
      {/* 카드 제목(h3) 위에 목록 제목(h2)을 둬서 h1 → h3로 건너뛰지 않게 한다. 화면에는 보이지 않는다. */}
      <section aria-labelledby="chair-list-title">
        <h2 id="chair-list-title" className="sr-only">
          의자 목록
        </h2>
        {/* 필터는 URL 쿼리를 읽는 클라이언트 영역이다. 초기 HTML에는 전체 목록을 담아 검색 엔진이 읽을 수 있게 한다. */}
        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6">
              {CHAIRS.map((chair) => (
                <ChairCard key={chair.slug} chair={chair} />
              ))}
            </div>
          }
        >
          <ChairBrowser />
        </Suspense>
      </section>
    </div>
  );
}
