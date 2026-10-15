import {
  HEIGHT_RANGE,
  WEIGHT_RANGE,
  type Budget,
  type Concern,
  type Hours,
  type Profile,
  type Purpose,
  type Sitter,
} from "./profile";
import { recommendedSeatHeight } from "./score";

/**
 * Fit 결과 공유 코드. URL에 원래 키·체중 대신 구간만 담는다(PRD F2).
 *
 *   /fit/result?share=1-s-170-60-6-w-lb-80
 *   버전-누가-키구간(5cm)-체중구간(10kg)-앉는시간-용도-불편부위(.로 연결, 없으면 0)-예산
 *
 * 공유받은 화면은 구간 대표값으로 다시 계산한다. 원래 결과와 1순위가 약 97% 같다(17만 개 조합 표본).
 * - 키: 구간 중앙값(170~174 → 172). 하한값을 쓰면 1순위 일치율이 83%로 떨어졌다.
 * - 체중: 구간 상한값(60~69 → 69). 실제 체중이 구간 어디에 있든 하중을 넘는 의자를 추천하지 않는다.
 * 권장 좌판 높이는 키 × 2.5 + 25라서 정확한 값을 보여주면 키가 역산된다. 공유 화면에서는 범위로만 보여준다.
 */

export const SHARE_VERSION = "1";
export const HEIGHT_STEP = 5;
export const WEIGHT_STEP = 10;

const SITTER_CODE: Record<Sitter, string> = { self: "s", child: "c" };
const HOURS_CODE: Record<Hours, string> = { lt3: "0", "3to6": "3", "6to9": "6", gt9: "9" };
const PURPOSE_CODE: Record<Purpose, string> = { work: "w", study: "s", leisure: "l" };
const CONCERN_CODE: Record<Concern, string> = { lowerBack: "lb", neckShoulder: "ns", hipThigh: "ht", heat: "he" };
const BUDGET_CODE: Record<Budget, string> = { upTo60: "60", upTo80: "80", upTo100: "100", any: "any" };
const NO_CONCERN = "0";

/** 공유 코드에서 읽은 값. 키·체중은 구간(양 끝 포함)으로만 안다. */
export type SharedProfile = {
  sitter: Sitter;
  height: { min: number; max: number };
  weight: { min: number; max: number };
  hours: Hours;
  purpose: Purpose;
  concerns: Concern[];
  budget: Budget;
};

const bucketStart = (value: number, step: number) => Math.floor(value / step) * step;

/** 구간을 허용 범위 안으로 자른다(예: 체중 150 → 150~159가 아니라 150~150). */
function bucket(start: number, step: number, range: { min: number; max: number }) {
  return { min: Math.max(start, range.min), max: Math.min(start + step - 1, range.max) };
}

export function encodeShare(profile: Profile) {
  return [
    SHARE_VERSION,
    SITTER_CODE[profile.sitter],
    bucketStart(profile.heightCm, HEIGHT_STEP),
    bucketStart(profile.weightKg, WEIGHT_STEP),
    HOURS_CODE[profile.hours],
    PURPOSE_CODE[profile.purpose],
    profile.concerns.length ? profile.concerns.map((c) => CONCERN_CODE[c]).join(".") : NO_CONCERN,
    BUDGET_CODE[profile.budget],
  ].join("-");
}

function fromCode<T extends string>(table: Record<T, string>, code: string | undefined): T | null {
  const entry = Object.entries(table).find(([, value]) => value === code);
  return entry ? (entry[0] as T) : null;
}

/** 코드 → 구간 값. 형식이 하나라도 틀리면 추측하지 않고 null을 돌려준다. */
export function decodeShare(code: string | null): SharedProfile | null {
  if (!code) return null;
  const parts = code.split("-");
  if (parts.length !== 8 || parts[0] !== SHARE_VERSION) return null;
  const [, sitterCode, heightCode, weightCode, hoursCode, purposeCode, concernCode, budgetCode] = parts;

  const sitter = fromCode(SITTER_CODE, sitterCode);
  const hours = fromCode(HOURS_CODE, hoursCode);
  const purpose = fromCode(PURPOSE_CODE, purposeCode);
  const budget = fromCode(BUDGET_CODE, budgetCode);
  if (!sitter || !hours || !purpose || !budget) return null;

  // 구간 시작값만 허용한다(172처럼 원래 값을 직접 넣은 링크, 060 같은 다른 표기는 거부)
  const heightStart = /^[1-9]\d{2}$/.test(heightCode) ? Number(heightCode) : NaN;
  const weightStart = /^[1-9]\d{1,2}$/.test(weightCode) ? Number(weightCode) : NaN;
  if (heightStart % HEIGHT_STEP !== 0 || weightStart % WEIGHT_STEP !== 0) return null;
  const height = bucket(heightStart, HEIGHT_STEP, HEIGHT_RANGE);
  const weight = bucket(weightStart, WEIGHT_STEP, WEIGHT_RANGE);
  if (height.min > height.max || weight.min > weight.max) return null;

  let concerns: Concern[] = [];
  if (concernCode !== NO_CONCERN) {
    const decoded = concernCode.split(".").map((c) => fromCode(CONCERN_CODE, c));
    if (decoded.some((c) => c === null) || new Set(decoded).size !== decoded.length) return null;
    // 고른 순서가 근거 정렬에 쓰이므로 순서를 유지한다
    concerns = decoded as Concern[];
  }

  return { sitter, height, weight, hours, purpose, concerns, budget };
}

/** 점수 계산에 쓸 대표값. 키는 구간 중앙, 체중은 구간 상한. */
export function representativeProfile(shared: SharedProfile): Profile {
  return {
    sitter: shared.sitter,
    heightCm: Math.min(shared.height.min + Math.floor(HEIGHT_STEP / 2), shared.height.max),
    weightKg: shared.weight.max,
    hours: shared.hours,
    purpose: shared.purpose,
    concerns: shared.concerns,
    budget: shared.budget,
  };
}

/** 공유 화면에 보여줄 권장 좌판 높이 범위 */
export function sharedSeatRange(shared: SharedProfile) {
  return { min: recommendedSeatHeight(shared.height.min), max: recommendedSeatHeight(shared.height.max) };
}
