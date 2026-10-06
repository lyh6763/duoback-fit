import Image from "next/image";
import Link from "next/link";
import { BodySilhouette } from "@/components/brand/body-silhouette";
import { ChairCard } from "@/components/chairs/chair-card";
import { buttonClass } from "@/components/ui/button";
import { CHAIRS } from "@/data/chairs";
import { STORES } from "@/data/stores";
import { chairImage } from "@/lib/chairs/format";

const STEPS = [
  { title: "몸 정보", body: "키와 체중으로 내게 맞는 좌판 높이를 계산해요." },
  { title: "사용 패턴", body: "앉는 시간, 하는 일, 불편한 곳을 알려주세요." },
  { title: "추천과 근거", body: "적합도와 함께 왜 맞는지 하나하나 보여드려요." },
];

const SCENARIOS = [
  { preset: "remote", title: "재택 9시간", body: "하루 대부분을 의자에서 보내요." },
  { preset: "kid", title: "아이 첫 의자", body: "아이 키에 맞는 학습 의자를 찾아요." },
  { preset: "back", title: "허리가 불편해요", body: "허리를 잘 받쳐주는 의자가 필요해요." },
];

const LINEUP = [...CHAIRS].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate)).slice(0, 4);
const HERO_CHAIR = CHAIRS.find((chair) => chair.slug === "d2500g") ?? CHAIRS[0];

export default function HomePage() {
  return (
    <>
      <section className="page-container grid items-center gap-10 py-12 md:py-20 lg:grid-cols-2 lg:py-28">
        <div className="space-y-6">
          <p className="text-xs font-semibold tracking-label text-primary">FIT BY BODY</p>
          <h1 className="text-3xl leading-tight font-bold tracking-tight md:text-4xl">
            내 몸에 맞는 의자,
            <br />
            1분이면 찾아요
          </h1>
          <p className="max-w-md text-md leading-relaxed text-muted md:text-lg">
            좌판 높이 450mm가 나에게 맞는지 고민하지 마세요. 키와 앉는 습관만 알려주면 맞는 모델과 그 이유를
            보여드려요.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/fit" className={buttonClass({ size: "l" })}>
              내 의자 찾기
            </Link>
            <Link href="/chairs" className={buttonClass({ size: "l", variant: "secondary" })}>
              모든 의자 보기
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-xl bg-photo">
            <Image
              src={chairImage(HERO_CHAIR, HERO_CHAIR.colors[0].slug)}
              alt={`${HERO_CHAIR.name} 의자`}
              width={1254}
              height={1254}
              sizes="(min-width: 1024px) 50vw, 100vw"
              preload
              className="aspect-[4/3] w-full object-contain"
            />
          </div>
          <div className="absolute -bottom-6 left-4 w-36 rounded-lg border border-line bg-elevated p-2 shadow-md md:left-8 md:w-44">
            <BodySilhouette heightCm={172} />
            <p className="px-1 pb-1 text-xs text-muted">키 172cm의 권장 좌판 높이</p>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <div className="page-container space-y-10">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">이렇게 찾아드려요</h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-lg bg-elevated p-6">
                <p className="font-display text-2xl text-primary">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-container space-y-10 py-16 md:py-24">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">이런 분들이 많이 찾아요</h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {SCENARIOS.map((scenario) => (
            <li key={scenario.preset}>
              <Link
                href={`/fit?preset=${scenario.preset}`}
                className="flex h-full flex-col justify-between gap-8 rounded-lg border border-line p-6 transition-colors hover:border-primary hover:bg-primary-subtle"
              >
                <span>
                  <span className="block text-lg font-semibold">{scenario.title}</span>
                  <span className="mt-2 block text-sm text-muted">{scenario.body}</span>
                </span>
                <span className="text-sm font-semibold text-primary">이 상황으로 시작하기 →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="page-container space-y-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">라인업</h2>
          <Link href="/chairs" className="text-sm font-semibold text-primary hover:underline">
            전체 보기 →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {LINEUP.map((chair) => (
            <ChairCard key={chair.slug} chair={chair} />
          ))}
        </div>
      </section>

      <section className="page-container pt-16 md:pt-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl bg-surface p-8 md:flex-row md:items-center md:p-12">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">결국은 앉아봐야 알죠</h2>
            <p className="text-muted-strong">
              전국 <span className="font-semibold tabular-nums">{STORES.length}</span>개 쇼룸에서 라인업을 직접 앉아볼
              수 있어요.
            </p>
          </div>
          <Link href="/stores" className={buttonClass({ size: "l" })}>
            가까운 매장 찾기
          </Link>
        </div>
      </section>
    </>
  );
}
