import type { Metadata } from "next";
import { Suspense } from "react";
import { FitFlow } from "@/components/fit/fit-flow";

export const metadata: Metadata = {
  title: "내 의자 찾기",
  description: "질문 6개로 내 몸에 맞는 의자와 그 이유를 알려드려요.",
};

export default function FitPage() {
  return (
    <Suspense fallback={<div className="page-container h-96" aria-busy="true" />}>
      <FitFlow />
    </Suspense>
  );
}
