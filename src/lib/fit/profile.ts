/**
 * Fit 프로필의 타입·상수·라벨과 저장소 값 검증.
 * 브라우저 번들에 들어가므로 zod를 쓰지 않는다. 같은 규칙의 zod 스키마(./profile.schema.ts)를
 * 기준으로 삼아, 아래 parse 함수가 똑같이 판정하는지 profile.test.ts가 대조한다.
 */

export const SITTERS = ["self", "child"] as const;
export const HOURS = ["lt3", "3to6", "6to9", "gt9"] as const;
export const PURPOSES = ["work", "study", "leisure"] as const;
export const CONCERNS = ["lowerBack", "neckShoulder", "hipThigh", "heat"] as const;
export const BUDGETS = ["upTo60", "upTo80", "upTo100", "any"] as const;

export const HEIGHT_RANGE = { min: 120, max: 200 } as const;
export const WEIGHT_RANGE = { min: 25, max: 150 } as const;

export type Sitter = (typeof SITTERS)[number];
export type Hours = (typeof HOURS)[number];
export type Purpose = (typeof PURPOSES)[number];
export type Concern = (typeof CONCERNS)[number];
export type Budget = (typeof BUDGETS)[number];

export type Profile = {
  sitter: Sitter;
  heightCm: number;
  weightKg: number;
  hours: Hours;
  purpose: Purpose;
  /** 빈 배열 = "불편한 곳 없음" */
  concerns: Concern[];
  budget: Budget;
};

/** 질문 진행 중 상태. 키가 없으면 아직 답하지 않은 질문이다. */
export type Draft = Partial<Profile>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isOneOf = <T extends string>(options: readonly T[], value: unknown): value is T =>
  typeof value === "string" && (options as readonly string[]).includes(value);

const isIntIn = (value: unknown, range: { min: number; max: number }): value is number =>
  Number.isInteger(value) && (value as number) >= range.min && (value as number) <= range.max;

const FIELD_CHECKS: { [K in keyof Profile]: (value: unknown) => boolean } = {
  sitter: (v) => isOneOf(SITTERS, v),
  heightCm: (v) => isIntIn(v, HEIGHT_RANGE),
  weightKg: (v) => isIntIn(v, WEIGHT_RANGE),
  hours: (v) => isOneOf(HOURS, v),
  purpose: (v) => isOneOf(PURPOSES, v),
  concerns: (v) => Array.isArray(v) && v.length <= CONCERNS.length && v.every((c) => isOneOf(CONCERNS, c)),
  budget: (v) => isOneOf(BUDGETS, v),
};

const FIELDS = Object.keys(FIELD_CHECKS) as (keyof Profile)[];

/**
 * 저장소에서 읽은 값을 진행 중 답변으로 검증한다. 있는 값은 모두 올바라야 하고,
 * 알 수 없는 키는 버린다(zod object의 기본 동작과 같다). 올바르지 않으면 null.
 */
export function parseDraft(value: unknown): Draft | null {
  if (!isRecord(value)) return null;
  const draft: Record<string, unknown> = {};
  for (const field of FIELDS) {
    const fieldValue = value[field];
    if (fieldValue === undefined) continue;
    if (!FIELD_CHECKS[field](fieldValue)) return null;
    draft[field] = Array.isArray(fieldValue) ? [...fieldValue] : fieldValue;
  }
  return draft as Draft;
}

/** 모든 질문에 답한 완전한 프로필만 통과시킨다. */
export function parseProfile(value: unknown): Profile | null {
  const draft = parseDraft(value);
  if (!draft || FIELDS.some((field) => draft[field] === undefined)) return null;
  return draft as Profile;
}

export const BUDGET_LIMIT: Record<Budget, number | null> = {
  upTo60: 600000,
  upTo80: 800000,
  upTo100: 1000000,
  any: null,
};

export const SITTER_LABEL: Record<Sitter, string> = { self: "나", child: "자녀(학생)" };
export const HOURS_LABEL: Record<Hours, string> = {
  lt3: "3시간 미만",
  "3to6": "3~6시간",
  "6to9": "6~9시간",
  gt9: "9시간 이상",
};
export const PURPOSE_LABEL: Record<Purpose, string> = {
  work: "업무 · PC 작업",
  study: "공부 · 학습",
  leisure: "게임 · 여가",
};
export const CONCERN_LABEL: Record<Concern, string> = {
  lowerBack: "허리",
  neckShoulder: "목 · 어깨",
  hipThigh: "엉덩이 · 허벅지",
  heat: "더위 · 땀",
};
export const BUDGET_LABEL: Record<Budget, string> = {
  upTo60: "60만 원까지",
  upTo80: "80만 원까지",
  upTo100: "100만 원까지",
  any: "상관없어요",
};

export const DEFAULT_BODY: Record<Sitter, { heightCm: number; weightKg: number }> = {
  self: { heightCm: 170, weightKg: 65 },
  child: { heightCm: 145, weightKg: 40 },
};

/** 홈 시나리오 카드에서 미리 채워 넣는 답변 */
export const PRESETS = {
  remote: { sitter: "self", hours: "gt9", purpose: "work" },
  kid: { sitter: "child", purpose: "study" },
  back: { sitter: "self", concerns: ["lowerBack"] },
} satisfies Record<string, Draft>;

export type PresetKey = keyof typeof PRESETS;

export function isPresetKey(value: string | null): value is PresetKey {
  return value !== null && Object.hasOwn(PRESETS, value);
}
