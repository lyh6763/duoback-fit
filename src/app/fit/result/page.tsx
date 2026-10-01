import type { Metadata } from "next";
import { FitResult } from "@/components/fit/fit-result";

export const metadata: Metadata = {
  title: "내 의자 찾기 결과",
  // 사용자마다 다른 결과이므로 검색에 노출하지 않는다
  robots: { index: false },
};

export default function FitResultPage() {
  return <FitResult />;
}
