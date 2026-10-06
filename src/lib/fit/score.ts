import type { Chair, ChairSpec } from "@/lib/chairs/types";
import {
  BUDGET_LIMIT,
  CONCERN_LABEL,
  type Concern,
  type Hours,
  type Profile,
} from "./profile";

/**
 * 적합도 계산 — docs/01-prd.md F1 기준.
 * 모든 함수는 순수 함수이며 같은 입력에 항상 같은 결과를 낸다.
 */

/** 신발 보정(mm) */
const SHOE_ALLOWANCE_MM = 25;
/** 좌판 높이 허용 오차(mm). 이 안이면 체형 점수를 깎지 않는다. */
export const SEAT_TOLERANCE_MM = 15;
/** 최대 하중 대비 이 비율을 넘으면 여유가 적다고 본다. */
const LOAD_MARGIN_RATIO = 0.85;

export const SCORE_MAX = { body: 40, usage: 25, concern: 25, budget: 10 } as const;

/** 권장 좌판 높이(mm) = 키(cm) × 2.5 + 25 — 오금 높이 근사식 */
export function recommendedSeatHeight(heightCm: number) {
  return Math.round(heightCm * 2.5 + SHOE_ALLOWANCE_MM);
}

/** recommendedSeatHeight의 역함수 */
export function heightForSeat(seatMm: number) {
  return (seatMm - SHOE_ALLOWANCE_MM) / 2.5;
}

export type SeatFit = {
  target: number;
  status: "in" | "below" | "above";
  /** 의자 범위 끝에서 권장 높이까지의 거리(mm). 범위 안이면 0 */
  distanceMm: number;
};

export type Reason = { label: string; value: string };

export type ChairScore = {
  chair: Chair;
  total: number;
  breakdown: Record<keyof typeof SCORE_MAX, number>;
  seat: SeatFit;
  reasons: Reason[];
  notes: Reason[];
};

type Candidate = Reason & { priority: number };

const ARMREST_POINTS: Record<ChairSpec["armrest"], number> = {
  fixed: 0,
  "2d": 0.4,
  "3d": 0.7,
  "4d": 1,
};
const TILT_POINTS: Record<ChairSpec["tilt"], number> = { none: 0, basic: 0.5, synchro: 1 };
const HOURS_WEIGHT: Record<Hours, number> = { lt3: 0, "3to6": 0.5, "6to9": 0.85, gt9: 1 };
const LUMBAR_POINTS: Record<ChairSpec["lumbar"], number> = {
  none: 0,
  fixed: 0.5,
  dualback: 0.9,
  adjustable: 1,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function seatFit(heightCm: number, spec: ChairSpec): SeatFit {
  const target = recommendedSeatHeight(heightCm);
  const { min, max } = spec.seatHeightMm;
  if (target < min) return { target, status: "below", distanceMm: min - target };
  if (target > max) return { target, status: "above", distanceMm: target - max };
  return { target, status: "in", distanceMm: 0 };
}

function scoreBody(profile: Profile, spec: ChairSpec, seat: SeatFit) {
  const reasons: Candidate[] = [];
  const notes: Reason[] = [];
  let score: number = SCORE_MAX.body;

  const beyond = Math.max(0, seat.distanceMm - SEAT_TOLERANCE_MM);
  if (seat.status === "below") score -= beyond * 0.5;
  if (seat.status === "above") score -= beyond;

  const range =
    spec.seatHeightMm.min === spec.seatHeightMm.max
      ? `${spec.seatHeightMm.min} mm 고정`
      : `${spec.seatHeightMm.min}–${spec.seatHeightMm.max} mm`;

  if (beyond === 0) {
    reasons.push({ label: "좌판 높이", value: range, priority: 100 });
  } else if (seat.status === "below") {
    notes.push({ label: "발받침 권장", value: `좌판이 ${seat.distanceMm} mm 높아요` });
  } else {
    notes.push({ label: "좌판이 낮아요", value: `${seat.distanceMm} mm 부족해요` });
  }

  if (profile.weightKg > spec.maxWeightKg * LOAD_MARGIN_RATIO) {
    score -= 5;
    notes.push({ label: "하중 여유 적음", value: `최대 ${spec.maxWeightKg} kg` });
  }

  return { score: clamp(score, 0, SCORE_MAX.body), reasons, notes };
}

function scoreUsage(profile: Profile, chair: Chair, seat: SeatFit) {
  const { spec } = chair;
  const reasons: Candidate[] = [];

  let category: number;
  if (profile.sitter === "child") {
    category = chair.category === "student" ? 7 : 2;
    const headroom = spec.seatHeightMm.max - seat.target;
    if (spec.seatHeightMm.min < spec.seatHeightMm.max && headroom >= 40) {
      category += 3;
      reasons.push({ label: "성장 여유", value: `+${headroom} mm`, priority: 60 });
    }
  } else if (profile.purpose === "study") {
    category = chair.category === "student" ? 10 : 6;
  } else {
    category = chair.category === "office" ? 10 : 3;
  }

  const featureRatio =
    ARMREST_POINTS[spec.armrest] * 0.4 +
    (spec.backMaterial === "mesh" ? 1 : 0) * 0.25 +
    (spec.headrest ? 1 : 0) * 0.2 +
    TILT_POINTS[spec.tilt] * 0.15;
  const weight = HOURS_WEIGHT[profile.hours];
  const features = 15 * (1 - weight + weight * featureRatio);

  if (weight >= 0.85) {
    if (spec.armrest === "4d") reasons.push({ label: "4D 팔걸이", value: "장시간 자세 조절", priority: 40 });
    if (spec.tilt === "synchro") reasons.push({ label: "싱크로 틸팅", value: "등판·좌판 연동", priority: 30 });
  }

  return { score: category + features, reasons };
}

const CONCERN_RULES: Record<
  Concern,
  (spec: ChairSpec) => { factor: number; reason: Reason | null }
> = {
  lowerBack: (spec) => ({
    factor: LUMBAR_POINTS[spec.lumbar],
    reason:
      spec.lumbar === "adjustable" || spec.lumbar === "dualback"
        ? { label: "요추 지지", value: spec.lumbar === "adjustable" ? "조절형" : "듀얼백" }
        : null,
  }),
  neckShoulder: (spec) => ({
    factor: (spec.headrest ? 0.6 : 0) + ARMREST_POINTS[spec.armrest] * 0.4,
    reason: spec.headrest ? { label: "헤드레스트", value: "목 지지" } : null,
  }),
  hipThigh: (spec) => ({
    factor: spec.seatDepthAdjust ? 1 : 0.4,
    reason: spec.seatDepthAdjust ? { label: "좌판 깊이 조절", value: "허벅지 지지" } : null,
  }),
  heat: (spec) => ({
    factor: (spec.backMaterial === "mesh" ? 0.5 : 0) + (spec.seatMaterial === "mesh" ? 0.5 : 0),
    reason:
      spec.backMaterial === "mesh"
        ? { label: "메쉬 소재", value: spec.seatMaterial === "mesh" ? "등판·좌판" : "등판" }
        : null,
  }),
};

function scoreConcerns(profile: Profile, spec: ChairSpec) {
  const reasons: Candidate[] = [];
  const notes: Reason[] = [];
  if (profile.concerns.length === 0) return { score: SCORE_MAX.concern, reasons, notes };

  let factorSum = 0;
  profile.concerns.forEach((concern, index) => {
    const { factor, reason } = CONCERN_RULES[concern](spec);
    factorSum += factor;
    // 사용자가 먼저 고른 불편 부위의 근거를 앞에 둔다
    if (reason) reasons.push({ ...reason, priority: 90 - index });
    if (factor === 0) notes.push({ label: `${CONCERN_LABEL[concern]} 대응 약함`, value: "관련 기능 없음" });
  });

  return { score: (SCORE_MAX.concern * factorSum) / profile.concerns.length, reasons, notes };
}

function scoreBudget(profile: Profile, price: number) {
  const limit = BUDGET_LIMIT[profile.budget];
  if (limit === null || price <= limit) return { score: SCORE_MAX.budget, notes: [] };

  const over = price - limit;
  const score = clamp(SCORE_MAX.budget - 5 * Math.ceil(over / 100000), 0, SCORE_MAX.budget);
  return { score, notes: [{ label: "예산 초과", value: `+${Math.ceil(over / 10000)}만 원` }] };
}

/** 하중을 넘는 의자는 추천에서 제외하므로 null을 돌려준다. */
export function scoreChair(profile: Profile, chair: Chair): ChairScore | null {
  if (profile.weightKg > chair.spec.maxWeightKg) return null;

  const seat = seatFit(profile.heightCm, chair.spec);
  const body = scoreBody(profile, chair.spec, seat);
  const usage = scoreUsage(profile, chair, seat);
  const concern = scoreConcerns(profile, chair.spec);
  const budget = scoreBudget(profile, chair.price);

  // 화면에 보이는 점수 구성의 합이 총점과 정확히 같도록 항목별로 먼저 반올림한다
  const breakdown = {
    body: Math.round(body.score),
    usage: Math.round(usage.score),
    concern: Math.round(concern.score),
    budget: Math.round(budget.score),
  };

  const reasons = [...body.reasons, ...concern.reasons, ...usage.reasons]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)
    .map(({ label, value }) => ({ label, value }));

  return {
    chair,
    total: breakdown.body + breakdown.usage + breakdown.concern + breakdown.budget,
    breakdown,
    seat,
    reasons,
    notes: [...body.notes, ...concern.notes, ...budget.notes],
  };
}

/** 적합도 내림차순. 동점이면 가격이 낮은 순, 그다음 slug 순. */
export function rankChairs(profile: Profile, chairs: readonly Chair[]) {
  return chairs
    .map((chair) => scoreChair(profile, chair))
    .filter((score): score is ChairScore => score !== null)
    .sort(
      (a, b) =>
        b.total - a.total || a.chair.price - b.chair.price || a.chair.slug.localeCompare(b.chair.slug),
    );
}

export type ScoreLevel = "high" | "mid" | "low";

export function scoreLevel(total: number): ScoreLevel {
  if (total >= 85) return "high";
  if (total >= 70) return "mid";
  return "low";
}
