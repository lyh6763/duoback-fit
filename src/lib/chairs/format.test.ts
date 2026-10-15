import { describe, expect, it } from "vitest";
import { CHAIRS, getChair } from "@/data/chairs";
import { scoreChair } from "@/lib/fit/score";
import type { Profile } from "@/lib/fit/profile";
import { fitsBody, recommendedHeightRange } from "./format";

const spec = (slug: string) => getChair(slug)!.spec;

describe("fitsBody", () => {
  it("matches the height range shown on cards, edges included", () => {
    // Q1W: 좌판 420–520mm → 카드 "키 158~198cm"
    expect(recommendedHeightRange(spec("q1w"))).toEqual({ min: 158, max: 198 });
    expect(fitsBody(spec("q1w"), { heightCm: 157, weightKg: 60 })).toBe(false);
    expect(fitsBody(spec("q1w"), { heightCm: 158, weightKg: 60 })).toBe(true);
    expect(fitsBody(spec("q1w"), { heightCm: 198, weightKg: 60 })).toBe(true);
    expect(fitsBody(spec("q1w"), { heightCm: 199, weightKg: 60 })).toBe(false);
  });

  it("includes the tolerance for fixed-height chairs, like the card does", () => {
    // DK-073W: 고정 440mm ± 15mm → 카드 "키 160~172cm"
    expect(recommendedHeightRange(spec("dk073w"))).toEqual({ min: 160, max: 172 });
    expect(fitsBody(spec("dk073w"), { heightCm: 172, weightKg: 60 })).toBe(true);
    expect(fitsBody(spec("dk073w"), { heightCm: 173, weightKg: 60 })).toBe(false);
  });

  it("excludes chairs whose load limit the weight exceeds", () => {
    expect(fitsBody(spec("dk073w"), { heightCm: 165, weightKg: 100 })).toBe(true);
    expect(fitsBody(spec("dk073w"), { heightCm: 165, weightKg: 101 })).toBe(false);
  });

  it("only keeps chairs that are scored without a seat-height penalty", () => {
    // 필터가 남긴 의자는 적합도 계산에서도 제외되지 않고 체형 점수를 깎이지 않는다
    const base: Omit<Profile, "heightCm" | "weightKg"> = {
      sitter: "self",
      hours: "6to9",
      purpose: "work",
      concerns: [],
      budget: "any",
    };
    for (let heightCm = 120; heightCm <= 200; heightCm += 1) {
      for (const weightKg of [40, 80, 100, 101, 125, 131]) {
        for (const chair of CHAIRS) {
          if (!fitsBody(chair.spec, { heightCm, weightKg })) continue;
          const score = scoreChair({ ...base, heightCm, weightKg }, chair);
          expect(score, `${chair.slug} ${heightCm}cm ${weightKg}kg`).not.toBeNull();
          expect(score!.seat.distanceMm).toBeLessThanOrEqual(15);
        }
      }
    }
  });
});
