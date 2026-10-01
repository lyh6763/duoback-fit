import { describe, expect, it } from "vitest";
import { CHAIRS, getChair } from "@/data/chairs";
import type { Profile } from "./profile";
import {
  SCORE_MAX,
  heightForSeat,
  rankChairs,
  recommendedSeatHeight,
  scoreChair,
  scoreLevel,
} from "./score";

const base: Profile = {
  sitter: "self",
  heightCm: 172,
  weightKg: 68,
  hours: "6to9",
  purpose: "work",
  concerns: ["lowerBack"],
  budget: "any",
};

function chair(slug: string) {
  const found = getChair(slug);
  if (!found) throw new Error(`missing chair ${slug}`);
  return found;
}

describe("recommendedSeatHeight", () => {
  it("follows height × 2.5 + 25", () => {
    expect(recommendedSeatHeight(160)).toBe(425);
    expect(recommendedSeatHeight(172)).toBe(455);
    expect(recommendedSeatHeight(185)).toBe(488);
  });

  it("is inverted by heightForSeat", () => {
    expect(heightForSeat(recommendedSeatHeight(170))).toBe(170);
  });
});

describe("scoreChair", () => {
  it("gives full body score when the seat range fits", () => {
    const result = scoreChair(base, chair("q1w"));
    expect(result?.seat).toEqual({ target: 455, status: "in", distanceMm: 0 });
    expect(result?.breakdown.body).toBe(SCORE_MAX.body);
    expect(result?.reasons[0]).toEqual({ label: "좌판 높이", value: "420–520 mm" });
  });

  it("excludes chairs whose max load is exceeded", () => {
    expect(scoreChair({ ...base, weightKg: 110 }, chair("d043w"))).toBeNull();
    expect(scoreChair({ ...base, weightKg: 110 }, chair("q1w"))).not.toBeNull();
  });

  it("penalizes heavy users near the load limit", () => {
    const result = scoreChair({ ...base, weightKg: 105 }, chair("q1w"));
    expect(result?.breakdown.body).toBe(SCORE_MAX.body - 5);
    expect(result?.notes.map((note) => note.label)).toContain("하중 여유 적음");
  });

  it("does not penalize within the seat tolerance", () => {
    // 165cm → 438mm, 고정 440mm와 2mm 차이
    const result = scoreChair({ ...base, heightCm: 165 }, chair("dk073w"));
    expect(result?.breakdown.body).toBe(SCORE_MAX.body);
  });

  it("recommends a footrest when the seat is too high", () => {
    // 130cm → 350mm, q1w 최저 420mm → 70mm 높고 허용 오차를 55mm 넘는다
    const result = scoreChair({ ...base, sitter: "child", heightCm: 130, weightKg: 30 }, chair("q1w"));
    expect(result?.seat).toEqual({ target: 350, status: "below", distanceMm: 70 });
    expect(result?.breakdown.body).toBe(Math.round(SCORE_MAX.body - 55 * 0.5));
    expect(result?.notes[0]?.label).toBe("발받침 권장");
  });

  it("penalizes a too-low seat twice as hard as a too-high one", () => {
    // 195cm → 513mm, dk073w 440mm 고정 → 73mm 낮고 허용 오차를 58mm 넘는다
    const result = scoreChair({ ...base, heightCm: 195 }, chair("dk073w"));
    expect(result?.seat.status).toBe("above");
    expect(result?.breakdown.body).toBe(0);
  });

  it("reduces the budget score per 100,000 won over", () => {
    const result = scoreChair({ ...base, budget: "upTo80" }, chair("q1w"));
    expect(result?.breakdown.budget).toBe(5);
    expect(result?.notes).toContainEqual({ label: "예산 초과", value: "+9만 원" });
  });

  it("gives full concern score when nothing is uncomfortable", () => {
    const result = scoreChair({ ...base, concerns: [] }, chair("d043w"));
    expect(result?.breakdown.concern).toBe(SCORE_MAX.concern);
  });

  it("orders concern reasons by the user's selection", () => {
    const result = scoreChair({ ...base, concerns: ["heat", "lowerBack"] }, chair("q1w"));
    expect(result?.reasons.map((reason) => reason.label)).toEqual(["좌판 높이", "메쉬 소재", "요추 지지"]);
  });

  it("rewards growth headroom only on adjustable chairs", () => {
    const child: Profile = { ...base, sitter: "child", heightCm: 150, weightKg: 40, purpose: "study" };
    expect(scoreChair(child, chair("q1w"))?.reasons.map((r) => r.label)).toContain("성장 여유");
    expect(scoreChair(child, chair("d043w"))?.reasons.map((r) => r.label)).not.toContain("성장 여유");
  });

  it("keeps the total equal to the sum of the breakdown", () => {
    for (const item of CHAIRS) {
      const result = scoreChair(base, item);
      if (!result) continue;
      const sum = Object.values(result.breakdown).reduce((acc, value) => acc + value, 0);
      expect(result.total).toBe(sum);
      expect(result.total).toBeLessThanOrEqual(100);
      expect(result.reasons.length).toBeLessThanOrEqual(3);
    }
  });
});

describe("rankChairs", () => {
  it("is deterministic and sorted by total", () => {
    const first = rankChairs(base, CHAIRS);
    const second = rankChairs(base, [...CHAIRS].reverse());
    expect(first.map((r) => r.chair.slug)).toEqual(second.map((r) => r.chair.slug));
    for (let i = 1; i < first.length; i += 1) {
      expect(first[i - 1].total).toBeGreaterThanOrEqual(first[i].total);
    }
  });

  it("prefers office chairs for long work sessions", () => {
    const [top] = rankChairs({ ...base, hours: "gt9" }, CHAIRS);
    expect(top.chair.category).toBe("office");
  });

  it("returns nothing when every chair is over its load", () => {
    expect(rankChairs({ ...base, weightKg: 140 }, CHAIRS)).toEqual([]);
  });
});

describe("scoreLevel", () => {
  it("maps totals to badge levels", () => {
    expect(scoreLevel(92)).toBe("high");
    expect(scoreLevel(85)).toBe("high");
    expect(scoreLevel(84)).toBe("mid");
    expect(scoreLevel(70)).toBe("mid");
    expect(scoreLevel(69)).toBe("low");
  });
});
