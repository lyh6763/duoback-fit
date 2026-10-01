import type { Metadata } from "next";
import { Suspense } from "react";
import { StoreBrowser } from "@/components/stores/store-browser";
import { StoreCard } from "@/components/stores/store-card";
import { STORES } from "@/data/stores";

export const metadata: Metadata = {
  title: "매장에서 앉아보기",
  description: "모델별 전시 매장을 찾아 직접 앉아보세요.",
};

export default function StoresPage() {
  return (
    <div className="page-container space-y-10 py-10 md:py-14">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">매장에서 앉아보기</h1>
        <p className="text-muted">결국은 앉아봐야 알아요. 보고 싶은 모델을 고르면 전시 매장만 보여드려요.</p>
      </header>

      {/* 필터는 URL 쿼리를 읽는 클라이언트 영역이다. 초기 HTML에는 전체 매장을 담는다. */}
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {STORES.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        }
      >
        <StoreBrowser />
      </Suspense>

      <p className="text-xs text-muted">
        포트폴리오용 가상 매장입니다. 주소와 전화번호는 실제 장소·번호가 아닙니다.
      </p>
    </div>
  );
}
