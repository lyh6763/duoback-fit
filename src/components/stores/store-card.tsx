import Image from "next/image";
import Link from "next/link";
import { getChair } from "@/data/chairs";
import type { Store } from "@/data/stores";
import { chairImage } from "@/lib/chairs/format";

/**
 * 매장 카드(StoreCard). highlight는 모델 필터로 들어왔을 때 그 모델을,
 * recommended는 내 Fit 결과 1순위 모델을 가리킨다.
 */
export function StoreCard({
  store,
  highlight,
  recommended,
}: {
  store: Store;
  highlight?: string | null;
  recommended?: string | null;
}) {
  const chairs = store.displayModels.flatMap((slug) => getChair(slug) ?? []);
  const hasRecommended = recommended ? store.displayModels.includes(recommended) : false;
  const headingId = `store-${store.id}`;

  return (
    <article
      aria-labelledby={headingId}
      className={`flex flex-col gap-5 rounded-lg border bg-elevated p-6 ${
        highlight ? "border-primary" : "border-line"
      }`}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-label text-primary">{store.region}</p>
        <h3 id={headingId} className="text-xl font-bold">
          {store.name}
        </h3>
        {hasRecommended && (
          <p className="inline-flex rounded-data bg-moss-50 px-2 py-1 text-xs font-medium text-moss-700">
            내 추천 1순위 모델 전시 중
          </p>
        )}
      </div>

      <dl className="grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="text-muted">주소</dt>
        <dd>{store.address}</dd>
        <dt className="text-muted">영업시간</dt>
        <dd className="tabular-nums">
          평일 {store.hours.weekday}
          <br />
          주말 {store.hours.weekend}
        </dd>
        <dt className="text-muted">전화</dt>
        <dd>
          <a href={`tel:${store.phone}`} className="font-medium tabular-nums underline-offset-4 hover:underline">
            {store.phone}
          </a>
        </dd>
      </dl>

      <div className="mt-auto space-y-2 border-t border-line pt-4">
        <p className="text-xs font-semibold text-muted-strong">
          전시 모델 <span className="tabular-nums">{chairs.length}</span>
        </p>
        <ul className="flex flex-wrap gap-2">
          {chairs.map((chair) => {
            const active = chair.slug === highlight;
            return (
              <li key={chair.slug}>
                <Link
                  href={`/chairs/${chair.slug}`}
                  title={chair.name}
                  className={`block overflow-hidden rounded-sm bg-photo ring-offset-2 ring-offset-elevated ${
                    active ? "ring-2 ring-primary" : "ring-1 ring-line hover:ring-stone-500"
                  }`}
                >
                  <Image
                    src={chairImage(chair, chair.colors[0].slug)}
                    alt={chair.name}
                    width={112}
                    height={112}
                    sizes="56px"
                    className="size-14 object-cover"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
