"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CautionNote } from "@/components/brand/caution-note";
import { ChairCard } from "@/components/chairs/chair-card";
import { DataCard } from "@/components/data/data-card";
import { FitGauge } from "@/components/data/fit-gauge";
import { ReasonList } from "@/components/data/reason-list";
import { ScoreBadge } from "@/components/data/score-badge";
import { ScoreBreakdown } from "@/components/data/score-breakdown";
import { buttonClass } from "@/components/ui/button";
import { CHAIRS } from "@/data/chairs";
import { CATEGORY_LABEL, chairImage, formatPrice } from "@/lib/chairs/format";
import { compareHref } from "@/lib/compare/list";
import { compareActions } from "@/lib/compare/store";
import {
  BUDGET_LABEL,
  CONCERN_LABEL,
  HOURS_LABEL,
  PURPOSE_LABEL,
  SITTER_LABEL,
  type Profile,
} from "@/lib/fit/profile";
import { rankChairs, recommendedSeatHeight, type ChairScore } from "@/lib/fit/score";
import { draftStore, profileStore } from "@/lib/fit/store";
import { showToast } from "@/lib/toast";

export function FitResult() {
  const profile = profileStore.useValue();

  if (profile === undefined) {
    return (
      <div className="page-container py-16" aria-busy="true">
        <div className="h-96 animate-pulse rounded-lg bg-surface" />
      </div>
    );
  }
  if (profile === null) return <NoProfile />;

  const ranked = rankChairs(profile, CHAIRS);
  const [top, ...rest] = ranked;
  const allBelow = ranked.length > 0 && ranked.every((score) => score.seat.status === "below");

  return (
    <>
      <ProfileSummary profile={profile} />

      <div className="page-container space-y-16 py-10 md:py-14">
        {allBelow && (
          <CautionNote>
            모든 모델의 좌판이 권장 높이보다 높아요. 발받침을 함께 쓰면 무릎과 발목 각도를 맞출 수 있어요.
          </CautionNote>
        )}

        {top ? <TopMatch score={top} topSlugs={ranked.slice(0, 3).map((s) => s.chair.slug)} /> : <NoMatch />}

        {top && (
          <section aria-labelledby="breakdown-title" className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
            <div className="space-y-2">
              <h2 id="breakdown-title" className="text-xl font-bold">
                왜 {top.total}점일까요?
              </h2>
              <p className="text-sm leading-relaxed text-muted">
                체형, 사용 패턴, 불편 부위, 예산을 나눠 점수를 매겼어요. 하중을 넘는 모델은 처음부터 제외했어요.
              </p>
            </div>
            <ScoreBreakdown score={top} />
          </section>
        )}

        {rest.length > 0 && (
          <section aria-labelledby="alternatives-title" className="space-y-8">
            <h2 id="alternatives-title" className="text-xl font-bold">
              이런 선택지도 있어요
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {rest.slice(0, 4).map((score) => (
                <ChairCard key={score.chair.slug} chair={score.chair} score={score.total} />
              ))}
            </div>
          </section>
        )}

        <p className="border-t border-line pt-6 text-sm text-muted">
          적합도는 단순화한 계산식으로 구한 참고값이에요. 실제 착좌감은 매장에서 직접 앉아보고 확인해 주세요.
        </p>
      </div>
    </>
  );
}

function ProfileSummary({ profile }: { profile: Profile }) {
  const router = useRouter();
  const seat = recommendedSeatHeight(profile.heightCm);
  const chips = [
    { step: 1, text: SITTER_LABEL[profile.sitter] },
    { step: 2, text: `${profile.heightCm}cm · ${profile.weightKg}kg` },
    { step: 3, text: HOURS_LABEL[profile.hours] },
    { step: 4, text: PURPOSE_LABEL[profile.purpose] },
    {
      step: 5,
      text: profile.concerns.length ? profile.concerns.map((c) => CONCERN_LABEL[c]).join(", ") : "불편한 곳 없음",
    },
    { step: 6, text: `예산 ${BUDGET_LABEL[profile.budget]}` },
  ];

  function restart() {
    draftStore.set({});
    router.push("/fit?step=1");
  }

  return (
    <section className="bg-surface">
      <div className="page-container grid gap-6 py-10 md:grid-cols-[1fr_auto] md:items-end md:py-14">
        <div className="space-y-4">
          <h1 className="text-xs font-semibold tracking-label text-muted-strong">당신의 권장 좌판 높이</h1>
          <p className="font-display text-5xl leading-none md:text-[64px]">
            {seat}
            <span className="ml-2 text-2xl">mm</span>
          </p>
          <ul aria-label="입력한 정보" className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li key={chip.step}>
                <Link
                  href={`/fit?step=${chip.step}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-elevated px-3 py-1.5 text-sm hover:border-stone-500"
                >
                  {chip.text}
                  <span className="sr-only">수정하기</span>
                  <span aria-hidden="true" className="text-xs text-muted">
                    ✎
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-4 text-sm font-semibold">
          <Link href="/fit/method" className="text-primary hover:underline">
            계산 방식 보기
          </Link>
          <button type="button" onClick={restart} className="text-primary hover:underline">
            다시 하기
          </button>
        </div>
      </div>
    </section>
  );
}

const LEAD_SENTENCE: Record<string, string> = {
  "요추 지지": "허리를 잘 받쳐주는 모델이에요.",
  헤드레스트: "목과 어깨를 편하게 받쳐줘요.",
  "메쉬 소재": "바람이 잘 통해 오래 앉아도 덥지 않아요.",
  "좌판 깊이 조절": "허벅지 길이에 맞춰 좌판을 조절할 수 있어요.",
  "성장 여유": "아이가 자라도 높이를 맞춰 오래 쓸 수 있어요.",
  "4D 팔걸이": "팔걸이를 자유롭게 맞춰 긴 시간 자세를 지켜줘요.",
  "싱크로 틸팅": "기대어 쉴 때도 등판과 좌판이 함께 움직여요.",
  "좌판 높이": "좌판 높이가 몸에 잘 맞는 모델이에요.",
};

/** 브랜드 레이어의 한 줄 요약. 좌판 높이보다 사용자 고민에 닿는 근거를 먼저 말한다. */
function leadSentence(score: ChairScore) {
  const reason = score.reasons.find((r) => r.label !== "좌판 높이") ?? score.reasons[0];
  return reason ? LEAD_SENTENCE[reason.label] : null;
}

function TopMatch({ score, topSlugs }: { score: ChairScore; topSlugs: string[] }) {
  const router = useRouter();
  const { chair } = score;

  // 기존 비교 목록을 상위 모델로 바꾼다. 실수였다면 토스트에서 되돌릴 수 있다.
  function compareTop() {
    const previous = compareActions.get();
    compareActions.replace(topSlugs);
    if (previous.length > 0 && previous.join() !== topSlugs.join()) {
      showToast("비교 목록을 추천 상위 모델로 바꿨어요", {
        label: "되돌리기",
        onClick: () => compareActions.replace(previous),
      });
    }
    router.push(compareHref(topSlugs));
  }
  const color = chair.colors[0];
  const lead = leadSentence(score);

  return (
    <section aria-labelledby="top-title" className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="overflow-hidden rounded-lg bg-photo">
        <Image
          src={chairImage(chair, color.slug)}
          alt={`${chair.name} ${color.name}`}
          width={1254}
          height={1254}
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
          className="aspect-square w-full object-contain"
        />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-label text-primary">가장 잘 맞는 의자</p>
          <h2 id="top-title" className="text-3xl font-bold tracking-tight">
            {chair.name}
          </h2>
          <p className="text-muted">
            {CATEGORY_LABEL[chair.category]} · <span className="tabular-nums">{formatPrice(chair.price)}</span>
          </p>
          {lead && <p className="text-lg leading-relaxed">{lead}</p>}
        </div>

        <DataCard title="체형 적합 분석" action={<ScoreBadge score={score.total} size="l" />}>
          <FitGauge range={chair.spec.seatHeightMm} target={score.seat.target} />
          <ReasonList reasons={score.reasons} notes={score.notes} />
        </DataCard>

        <div className="flex flex-wrap gap-3">
          <Link href={`/chairs/${chair.slug}`} className={buttonClass({ size: "l" })}>
            자세히 보기
          </Link>
          {topSlugs.length >= 2 && (
            <button type="button" onClick={compareTop} className={buttonClass({ size: "l", variant: "secondary" })}>
              상위 {topSlugs.length}개 비교하기
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function NoMatch() {
  return (
    <section className="space-y-4 rounded-lg bg-elevated p-8 text-center">
      <h2 className="text-xl font-bold">입력한 체중을 견디는 모델이 없어요</h2>
      <p className="text-muted">라인업의 최대 하중은 130kg이에요. 체중을 다시 확인하거나 매장에서 상담받아 보세요.</p>
      <Link href="/fit?step=2" className={buttonClass({ variant: "secondary" })}>
        키와 체중 수정하기
      </Link>
    </section>
  );
}

function NoProfile() {
  return (
    <div className="page-container">
      <div className="mx-auto max-w-xl space-y-6 py-24 text-center">
        <h1 className="text-2xl font-bold">아직 결과가 없어요</h1>
        <p className="text-muted">질문 6개에 답하면 내 몸에 맞는 의자를 찾아드려요.</p>
        <Link href="/fit" className={buttonClass({ size: "l" })}>
          내 의자 찾기
        </Link>
      </div>
    </div>
  );
}
