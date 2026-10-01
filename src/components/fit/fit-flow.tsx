"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BodySilhouette } from "@/components/brand/body-silhouette";
import { buttonClass } from "@/components/ui/button";
import {
  BUDGETS,
  BUDGET_LABEL,
  CONCERNS,
  CONCERN_LABEL,
  DEFAULT_BODY,
  HEIGHT_RANGE,
  HOURS,
  HOURS_LABEL,
  PRESETS,
  PURPOSES,
  PURPOSE_LABEL,
  SITTERS,
  SITTER_LABEL,
  WEIGHT_RANGE,
  isPresetKey,
  profileSchema,
  type Concern,
  type Draft,
} from "@/lib/fit/profile";
import { draftStore, profileStore } from "@/lib/fit/store";
import { OptionCard } from "./option-card";
import { RangeSlider } from "./range-slider";

const TOTAL_STEPS = 6;
const STEP_NAMES = ["누가 앉나요", "키와 체중", "앉는 시간", "주 용도", "불편한 곳", "예산"];
const COMPLETE = TOTAL_STEPS + 1;

/** 아직 답하지 않은 첫 질문 번호. 모두 답했으면 COMPLETE. */
function firstUnanswered(draft: Draft) {
  if (draft.sitter === undefined) return 1;
  if (draft.heightCm === undefined || draft.weightKg === undefined) return 2;
  if (draft.hours === undefined) return 3;
  if (draft.purpose === undefined) return 4;
  if (draft.concerns === undefined) return 5;
  if (draft.budget === undefined) return 6;
  return COMPLETE;
}

function parseStep(value: string | null) {
  const step = Number(value);
  return Number.isInteger(step) && step >= 1 && step <= TOTAL_STEPS ? step : null;
}

export function FitFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const step = parseStep(params.get("step"));
  const preset = params.get("preset");
  const draft = draftStore.useValue();
  const profile = profileStore.useValue();
  const hydrated = draft !== undefined && profile !== undefined;

  // 홈 시나리오 카드: 답변을 미리 채우고 첫 미답변 질문으로 이동
  useEffect(() => {
    if (!isPresetKey(preset)) return;
    const next: Draft = { ...PRESETS[preset] };
    draftStore.set(next);
    router.replace(`/fit?step=${firstUnanswered(next)}`);
  }, [preset, router]);

  // 결과 화면의 "수정"으로 들어왔는데 진행 중 답변이 없으면 저장된 프로필로 채운다.
  // 앞 질문에 답하지 않고 뒤 질문으로 바로 들어오면 첫 미답변 질문으로 돌려보낸다.
  useEffect(() => {
    if (!hydrated || step === null || isPresetKey(preset)) return;
    if (draft === null && profile) {
      draftStore.set(profile);
      return;
    }
    const first = firstUnanswered(draft ?? {});
    if (step > first) router.replace(`/fit?step=${first}`);
  }, [hydrated, draft, profile, step, preset, router]);

  if (!hydrated || isPresetKey(preset)) return <FitSkeleton />;
  if (step === null) return <FitIntro draft={draft} hasResult={profile !== null} />;

  const current = draft ?? {};
  if (step > firstUnanswered(current)) return <FitSkeleton />;

  function save(patch: Draft) {
    const next = { ...current, ...patch };
    draftStore.set(next);
    if (step === TOTAL_STEPS) {
      const parsed = profileSchema.safeParse(next);
      if (!parsed.success) {
        router.replace(`/fit?step=${firstUnanswered(next)}`);
        return;
      }
      profileStore.set(parsed.data);
      router.push("/fit/result");
      return;
    }
    router.push(`/fit?step=${(step ?? 0) + 1}`);
  }

  return (
    <FitStepFrame step={step}>
      {step === 1 && (
        <SingleChoice
          options={SITTERS.map((value) => ({
            value,
            label: SITTER_LABEL[value],
            description: value === "self" ? "직접 앉을 의자를 찾아요" : "아이 키에 맞춰 찾아요",
          }))}
          value={current.sitter}
          onSelect={(sitter) => save({ sitter })}
        />
      )}
      {step === 2 && <BodyStep draft={current} onNext={save} />}
      {step === 3 && (
        <SingleChoice
          options={HOURS.map((value) => ({ value, label: HOURS_LABEL[value] }))}
          value={current.hours}
          onSelect={(hours) => save({ hours })}
        />
      )}
      {step === 4 && (
        <SingleChoice
          options={PURPOSES.map((value) => ({ value, label: PURPOSE_LABEL[value] }))}
          value={current.purpose}
          onSelect={(purpose) => save({ purpose })}
        />
      )}
      {step === 5 && <ConcernStep initial={current.concerns} onNext={(concerns) => save({ concerns })} />}
      {step === 6 && (
        <SingleChoice
          options={BUDGETS.map((value) => ({ value, label: BUDGET_LABEL[value] }))}
          value={current.budget}
          onSelect={(budget) => save({ budget })}
        />
      )}
    </FitStepFrame>
  );
}

const QUESTIONS: Record<number, { title: string; hint?: string }> = {
  1: { title: "누가 앉나요?" },
  2: { title: "키와 체중을 알려주세요", hint: "입력값은 이 브라우저에만 저장돼요." },
  3: { title: "하루에 얼마나 앉아 있나요?" },
  4: { title: "주로 무엇을 하나요?" },
  5: { title: "불편한 곳이 있나요?", hint: "여러 개 고를 수 있어요." },
  6: { title: "예산은 어느 정도인가요?", hint: "예산을 넘는 모델도 점수를 조금 낮춰 함께 보여드려요." },
};

function FitStepFrame({ step, children }: { step: number; children: ReactNode }) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const question = QUESTIONS[step];

  // 질문이 바뀌면 스크린 리더가 새 질문을 읽도록 제목으로 포커스를 옮긴다
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  return (
    <div className="page-container grid gap-10 py-8 md:py-12 lg:grid-cols-[240px_minmax(0,640px)] lg:justify-center lg:gap-16">
      <ol aria-label="진행 단계" className="hidden space-y-3 lg:block">
        {STEP_NAMES.map((name, index) => {
          const number = index + 1;
          const state = number < step ? "done" : number === step ? "current" : "todo";
          return (
            <li
              key={name}
              aria-current={state === "current" ? "step" : undefined}
              className={`flex items-center gap-3 text-sm ${state === "todo" ? "text-muted" : "font-semibold"}`}
            >
              <span
                className={`grid size-6 place-items-center rounded-full text-xs ${
                  state === "done"
                    ? "bg-primary text-inverse"
                    : state === "current"
                      ? "border-2 border-primary text-primary"
                      : "border border-line"
                }`}
              >
                {state === "done" ? "✓" : number}
              </span>
              {name}
            </li>
          );
        })}
      </ol>

      <div className="space-y-8">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => router.replace(`/fit?step=${step - 1}`)}
                className="font-medium text-muted hover:text-ink"
              >
                ← 이전
              </button>
            ) : (
              <Link href="/fit" className="font-medium text-muted hover:text-ink">
                ← 처음으로
              </Link>
            )}
            <span className="font-semibold tabular-nums">
              {step} / {TOTAL_STEPS}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="진행률"
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-valuenow={step}
            className="grid grid-cols-6 gap-1"
          >
            {STEP_NAMES.map((name, index) => (
              <span key={name} className={`h-1 rounded-full ${index < step ? "bg-primary" : "bg-line"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-label text-primary">{STEP_NAMES[step - 1]}</p>
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none md:text-3xl">
            {question.title}
          </h1>
          {question.hint && <p className="text-sm text-muted">{question.hint}</p>}
        </div>

        {children}
      </div>
    </div>
  );
}

function SingleChoice<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: { value: T; label: string; description?: string }[];
  value: T | undefined;
  onSelect: (value: T) => void;
}) {
  return (
    <div role="group" className="space-y-3">
      {options.map((option) => (
        <OptionCard
          key={option.value}
          label={option.label}
          description={option.description}
          selected={option.value === value}
          onSelect={() => onSelect(option.value)}
        />
      ))}
    </div>
  );
}

function BodyStep({ draft, onNext }: { draft: Draft; onNext: (patch: Draft) => void }) {
  const defaults = DEFAULT_BODY[draft.sitter ?? "self"];
  const [heightCm, setHeightCm] = useState(draft.heightCm ?? defaults.heightCm);
  const [weightKg, setWeightKg] = useState(draft.weightKg ?? defaults.weightKg);

  return (
    <div className="space-y-8">
      <div className="mx-auto w-full max-w-60 rounded-lg bg-elevated p-3">
        <BodySilhouette heightCm={heightCm} />
      </div>
      <RangeSlider
        label="키"
        value={heightCm}
        min={HEIGHT_RANGE.min}
        max={HEIGHT_RANGE.max}
        unit="cm"
        spokenUnit="센티미터"
        onChange={setHeightCm}
      />
      <RangeSlider
        label="체중"
        value={weightKg}
        min={WEIGHT_RANGE.min}
        max={WEIGHT_RANGE.max}
        unit="kg"
        spokenUnit="킬로그램"
        onChange={setWeightKg}
      />
      <button type="button" onClick={() => onNext({ heightCm, weightKg })} className={buttonClass({ size: "l", fullWidth: true })}>
        다음
      </button>
    </div>
  );
}

function ConcernStep({ initial, onNext }: { initial: Concern[] | undefined; onNext: (concerns: Concern[]) => void }) {
  // null = 아직 고르지 않음, [] = "없어요"
  const [selected, setSelected] = useState<Concern[] | null>(initial ?? null);
  const [error, setError] = useState(false);

  function toggle(concern: Concern) {
    setError(false);
    setSelected((prev) => {
      const list = prev ?? [];
      const next = list.includes(concern) ? list.filter((item) => item !== concern) : [...list, concern];
      // 마지막 하나를 해제하면 "없어요"가 아니라 "아직 고르지 않음"으로 돌아간다
      return next.length === 0 ? null : next;
    });
  }

  function next() {
    if (selected === null) {
      setError(true);
      return;
    }
    onNext(selected);
  }

  return (
    <div className="space-y-6">
      <div role="group" aria-describedby={error ? "concern-error" : undefined} className="grid gap-3 sm:grid-cols-2">
        {CONCERNS.map((concern) => (
          <OptionCard
            key={concern}
            label={CONCERN_LABEL[concern]}
            selected={selected?.includes(concern) ?? false}
            onSelect={() => toggle(concern)}
          />
        ))}
        <OptionCard
          label="없어요"
          selected={selected !== null && selected.length === 0}
          onSelect={() => {
            setError(false);
            setSelected([]);
          }}
        />
      </div>
      {error && (
        <p id="concern-error" role="alert" className="text-sm font-medium text-error">
          하나 이상 골라주세요. 불편한 곳이 없다면 &ldquo;없어요&rdquo;를 선택하세요.
        </p>
      )}
      <button type="button" onClick={next} className={buttonClass({ size: "l", fullWidth: true })}>
        다음
      </button>
    </div>
  );
}

function FitIntro({ draft, hasResult }: { draft: Draft | null; hasResult: boolean }) {
  const router = useRouter();
  const answered = draft ? firstUnanswered(draft) : 1;
  const inProgress = answered > 1 && answered < COMPLETE;

  function start() {
    draftStore.set({});
    router.push("/fit?step=1");
  }

  return (
    <div className="page-container">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 py-16 text-center md:py-24">
        <div className="w-44 rounded-lg bg-elevated p-3">
          <BodySilhouette heightCm={170} showGuide={false} />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">내 몸에 맞는 의자 찾기</h1>
          <p className="text-muted">
            약 1분 · 질문 6개
            <br />
            입력값은 이 브라우저에만 저장되고 서버로 보내지 않아요.
          </p>
        </div>
        {inProgress ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/fit?step=${answered}`} className={buttonClass({ size: "l" })}>
              이어서 하기 ({answered - 1}/6 완료)
            </Link>
            <button type="button" onClick={start} className={buttonClass({ size: "l", variant: "secondary" })}>
              처음부터
            </button>
          </div>
        ) : (
          <button type="button" onClick={start} className={buttonClass({ size: "l" })}>
            시작하기
          </button>
        )}
        {hasResult && !inProgress && (
          <Link href="/fit/result" className="text-sm font-semibold text-primary hover:underline">
            지난 결과 보기 →
          </Link>
        )}
      </div>
    </div>
  );
}

function FitSkeleton() {
  return (
    <div className="page-container py-16" aria-busy="true">
      <div className="mx-auto h-64 max-w-2xl animate-pulse rounded-lg bg-surface" />
    </div>
  );
}
