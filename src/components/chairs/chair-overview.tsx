"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CautionNote } from "@/components/brand/caution-note";
import { CompareButton } from "@/components/compare/compare-toggle";
import { DataCard } from "@/components/data/data-card";
import { FitGauge } from "@/components/data/fit-gauge";
import { ReasonList } from "@/components/data/reason-list";
import { ScoreBadge } from "@/components/data/score-badge";
import { buttonClass } from "@/components/ui/button";
import {
  ANGLE_LABEL,
  ARMREST_LABEL,
  BASE_LABEL,
  CATEGORY_LABEL,
  chairViews,
  comfortableWeight,
  formatPrice,
  formatSeatRange,
  recommendedHeightRange,
} from "@/lib/chairs/format";
import type { Chair } from "@/lib/chairs/schema";
import { scoreChair } from "@/lib/fit/score";
import { profileStore } from "@/lib/fit/store";
import { ColorSwatches } from "./color-swatches";

export function ChairOverview({ chair }: { chair: Chair }) {
  const [color, setColor] = useState(chair.colors[0].slug);
  const [activeIndex, setActiveIndex] = useState(0);
  const views = chairViews(chair, color);
  const active = views[activeIndex];
  const colorName = chair.colors.find((c) => c.slug === color)?.name ?? "";

  return (
    <div className="grid gap-10 lg:grid-cols-[7fr_5fr] lg:gap-14">
      <div className="space-y-3">
        <div className="overflow-hidden rounded-lg bg-photo">
          <Image
            src={active.src}
            alt={`${chair.name} ${colorName} ${ANGLE_LABEL[active.angle]}`}
            width={1254}
            height={1254}
            sizes="(min-width: 1024px) 58vw, 100vw"
            priority
            className="aspect-square w-full object-contain"
          />
        </div>
        <div role="group" aria-label="각도 선택" className="grid grid-cols-4 gap-3">
          {views.map((view, index) => (
            <button
              key={view.angle}
              type="button"
              aria-pressed={index === activeIndex}
              aria-label={`${ANGLE_LABEL[view.angle]} 보기`}
              onClick={() => setActiveIndex(index)}
              className={`overflow-hidden rounded-sm bg-photo ring-offset-2 ring-offset-canvas ${
                index === activeIndex ? "ring-2 ring-ink" : "ring-1 ring-line hover:ring-stone-500"
              }`}
            >
              <Image src={view.src} alt="" width={200} height={200} sizes="120px" className="aspect-square w-full object-contain" />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8 lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-label text-primary">{CATEGORY_LABEL[chair.category]} 의자</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{chair.name}</h1>
          <p className="text-xl font-semibold tabular-nums">{formatPrice(chair.price)}</p>
          <p className="leading-relaxed text-muted">{chair.summary}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">
            색상 <span className="text-muted">{colorName}</span>
          </p>
          <ColorSwatches colors={chair.colors} value={color} onChange={setColor} />
        </div>

        <BodyFitSpecs chair={chair} />
        <FitPanel chair={chair} />
        <CompareButton slug={chair.slug} />
      </div>
    </div>
  );
}

function BodyFitSpecs({ chair }: { chair: Chair }) {
  const { spec } = chair;
  const heights = recommendedHeightRange(spec);
  const longSession = (spec.armrest === "3d" || spec.armrest === "4d") && spec.tilt === "synchro";
  const items = [
    { title: `키 ${heights.min}~${heights.max}cm에 적합`, detail: `좌판 높이 ${formatSeatRange(spec)}` },
    { title: `체중 약 ${comfortableWeight(spec)}kg까지 여유`, detail: `최대 하중 ${spec.maxWeightKg} kg` },
    longSession
      ? { title: "하루 6시간 이상 앉아도 좋아요", detail: `${ARMREST_LABEL[spec.armrest]} 팔걸이 · 싱크로 틸팅` }
      : { title: "짧은 학습·작업 시간에 알맞아요", detail: BASE_LABEL[spec.base] },
  ];

  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <li key={item.title} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
          <span className="font-semibold">{item.title}</span>
          <span className="text-sm tabular-nums text-muted">{item.detail}</span>
        </li>
      ))}
    </ul>
  );
}

function FitPanel({ chair }: { chair: Chair }) {
  const profile = profileStore.useValue();

  if (profile === undefined) return <div className="h-40 animate-pulse rounded-data bg-surface" aria-busy="true" />;

  if (profile === null) {
    return (
      <div className="space-y-4 rounded-lg bg-primary-subtle p-5">
        <p className="font-semibold text-moss-700">이 의자가 내 몸에 맞을까요?</p>
        <p className="text-sm text-moss-700">질문 6개에 답하면 적합도와 그 이유를 이 자리에 보여드려요.</p>
        <Link href="/fit" className={buttonClass()}>
          내 몸에 맞는지 확인하기
        </Link>
      </div>
    );
  }

  const score = scoreChair(profile, chair);
  if (!score) {
    return (
      <CautionNote>
        입력한 체중({profile.weightKg}kg)이 이 의자의 최대 하중({chair.spec.maxWeightKg}kg)을 넘어요.
      </CautionNote>
    );
  }

  return (
    <DataCard
      title="나와의 핏"
      action={<ScoreBadge score={score.total} />}
    >
      <FitGauge range={chair.spec.seatHeightMm} target={score.seat.target} />
      <ReasonList reasons={score.reasons} notes={score.notes} />
      <p className="mt-3 text-xs text-data-label">
        키 {profile.heightCm}cm 기준 ·{" "}
        <Link href="/fit/result" className="underline underline-offset-2 hover:text-ink">
          전체 결과 보기
        </Link>
      </p>
    </DataCard>
  );
}
