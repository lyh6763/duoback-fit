import * as z from "zod/mini";

export const SITTERS = ["self", "child"] as const;
export const HOURS = ["lt3", "3to6", "6to9", "gt9"] as const;
export const PURPOSES = ["work", "study", "leisure"] as const;
export const CONCERNS = ["lowerBack", "neckShoulder", "hipThigh", "heat"] as const;
export const BUDGETS = ["upTo60", "upTo80", "upTo100", "any"] as const;

export const HEIGHT_RANGE = { min: 120, max: 200 } as const;
export const WEIGHT_RANGE = { min: 25, max: 150 } as const;

export const profileSchema = z.object({
  sitter: z.enum(SITTERS),
  heightCm: z.int().check(z.minimum(HEIGHT_RANGE.min), z.maximum(HEIGHT_RANGE.max)),
  weightKg: z.int().check(z.minimum(WEIGHT_RANGE.min), z.maximum(WEIGHT_RANGE.max)),
  hours: z.enum(HOURS),
  purpose: z.enum(PURPOSES),
  // 빈 배열 = "불편한 곳 없음"
  concerns: z.array(z.enum(CONCERNS)).check(z.maxLength(CONCERNS.length)),
  budget: z.enum(BUDGETS),
});

/** 질문 진행 중 상태. 키가 없으면 아직 답하지 않은 질문이다. */
export const draftSchema = z.partial(profileSchema);

export type Profile = z.infer<typeof profileSchema>;
export type Draft = z.infer<typeof draftSchema>;
export type Sitter = Profile["sitter"];
export type Hours = Profile["hours"];
export type Purpose = Profile["purpose"];
export type Concern = Profile["concerns"][number];
export type Budget = Profile["budget"];

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
