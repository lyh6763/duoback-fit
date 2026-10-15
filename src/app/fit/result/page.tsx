import type { Metadata } from "next";
import { Suspense } from "react";
import { FitResult, ResultSkeleton } from "@/components/fit/fit-result";

export const metadata: Metadata = {
  title: "내 의자 찾기 결과",
  // 사용자마다 다른 결과이므로 검색에 노출하지 않는다
  robots: { index: false },
};

export default function FitResultPage() {
  // 공유 코드(?share=)를 읽는 클라이언트 영역이라 Suspense로 감싼다
  return (
    <Suspense fallback={<ResultSkeleton />}>
      <FitResult />
    </Suspense>
  );
}
