import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareView } from "@/components/compare/compare-view";

export const metadata: Metadata = {
  title: "비교",
  description: "최대 3개 모델의 체형 적합, 조절 기능, 소재, 크기를 나란히 비교해 보세요.",
  // 담은 모델에 따라 내용이 달라지는 페이지라 검색에 노출하지 않는다
  robots: { index: false },
};

export default function ComparePage() {
  return (
    <div className="page-container space-y-8 py-10 md:py-14">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">비교</h1>
        <p className="text-muted">최대 3개 모델을 나란히 놓고 차이를 확인해 보세요.</p>
      </header>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-data bg-surface" aria-busy="true" />}>
        <CompareView />
      </Suspense>
    </div>
  );
}
