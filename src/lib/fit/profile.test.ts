import { describe, expect, it } from "vitest";
import { parseSlugList } from "@/lib/compare/list";
import { BUDGETS, CONCERNS, HOURS, PURPOSES, SITTERS, parseDraft, parseProfile } from "./profile";
import { draftSchema, profileSchema } from "./profile.schema";

/**
 * 브라우저용 parseDraft/parseProfile이 기준 zod 스키마와 똑같이 판정하는지 대조한다.
 * 저장소 값은 손상되거나 조작될 수 있어서, 경계값과 잘못된 타입을 섞은 입력을 많이 만들어 비교한다.
 */

// 시드가 고정된 난수(mulberry32) — 실패하면 같은 입력으로 다시 재현할 수 있다
function rng(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const ODD_VALUES: unknown[] = [undefined, null, "", "1", 0, -1, 1.5, NaN, Infinity, true, {}, [], "self", 170, ["x"]];

const CANDIDATES: Record<string, unknown[]> = {
  sitter: [...SITTERS, "robot", ...ODD_VALUES],
  heightCm: [120, 121, 172, 199, 200, 119, 201, 170.5, "172", ...ODD_VALUES],
  weightKg: [25, 26, 68, 149, 150, 24, 151, 68.2, "68", ...ODD_VALUES],
  hours: [...HOURS, "always", ...ODD_VALUES],
  purpose: [...PURPOSES, "sleep", ...ODD_VALUES],
  concerns: [
    [],
    ["lowerBack"],
    [...CONCERNS],
    ["heat", "heat"],
    [...CONCERNS, "lowerBack"],
    ["knee"],
    "lowerBack",
    [1],
    ...ODD_VALUES,
  ],
  budget: [...BUDGETS, "free", ...ODD_VALUES],
  extra: [undefined, "ignored", 42],
};

function randomRecord(next: () => number) {
  const record: Record<string, unknown> = {};
  for (const [field, options] of Object.entries(CANDIDATES)) {
    // 약 30%는 키 자체를 빼서 "아직 답하지 않음"을 만든다
    if (next() < 0.3) continue;
    record[field] = options[Math.floor(next() * options.length)];
  }
  return record;
}

const VALID_PROFILE = {
  sitter: "self",
  heightCm: 172,
  weightKg: 68,
  hours: "6to9",
  purpose: "work",
  concerns: ["lowerBack"],
  budget: "any",
};

/** 올바른 프로필에서 출발해 필드 하나를 바꾸거나 지운다(경계 근처를 집중적으로 찌른다). */
function mutatedProfile(next: () => number) {
  const record: Record<string, unknown> = { ...VALID_PROFILE };
  if (next() < 0.25) return record;
  const fields = Object.keys(CANDIDATES);
  const field = fields[Math.floor(next() * fields.length)];
  const options = CANDIDATES[field];
  if (next() < 0.15) delete record[field];
  else record[field] = options[Math.floor(next() * options.length)];
  return record;
}

describe("parseDraft / parseProfile match the zod reference", () => {
  const next = rng(20261006);
  const inputs: unknown[] = [
    null,
    undefined,
    "string",
    42,
    [],
    ...Array.from({ length: 3000 }, () => randomRecord(next)),
    ...Array.from({ length: 2000 }, () => mutatedProfile(next)),
  ];

  it("agrees with draftSchema on every input", () => {
    for (const input of inputs) {
      const reference = draftSchema.safeParse(input);
      expect(parseDraft(input), JSON.stringify(input)).toEqual(reference.success ? reference.data : null);
    }
  });

  it("agrees with profileSchema on every input", () => {
    let accepted = 0;
    for (const input of inputs) {
      const reference = profileSchema.safeParse(input);
      const result = parseProfile(input);
      expect(result, JSON.stringify(input)).toEqual(reference.success ? reference.data : null);
      if (result) accepted += 1;
    }
    // 대조가 의미 있으려면 통과하는 입력도 충분히 섞여 있어야 한다
    expect(accepted).toBeGreaterThan(5);
  });

  it("does not share array references with the stored value", () => {
    const stored = { concerns: ["lowerBack"] };
    const draft = parseDraft(stored);
    expect(draft?.concerns).not.toBe(stored.concerns);
  });
});

describe("parseSlugList", () => {
  it("accepts up to ten strings and rejects anything else", () => {
    expect(parseSlugList(["q1w", "d3hs"])).toEqual(["q1w", "d3hs"]);
    expect(parseSlugList([])).toEqual([]);
    expect(parseSlugList(Array.from({ length: 11 }, () => "q1w"))).toBeNull();
    expect(parseSlugList(["q1w", 1])).toBeNull();
    expect(parseSlugList("q1w")).toBeNull();
    expect(parseSlugList({ 0: "q1w" })).toBeNull();
  });
});
