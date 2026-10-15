import { describe, expect, it } from "vitest";
import { CHAIRS } from "@/data/chairs";
import { BUDGETS, CONCERNS, HOURS, PURPOSES, SITTERS, type Profile } from "./profile";
import { rankChairs } from "./score";
import { decodeShare, encodeShare, representativeProfile, sharedSeatRange } from "./share";

const PROFILE: Profile = {
  sitter: "self",
  heightCm: 172,
  weightKg: 68,
  hours: "6to9",
  purpose: "work",
  concerns: ["lowerBack"],
  budget: "upTo80",
};

describe("encodeShare", () => {
  it("keeps only 5cm / 10kg buckets of height and weight", () => {
    const code = encodeShare(PROFILE);
    expect(code).toBe("1-s-170-60-6-w-lb-80");
    expect(code).not.toContain("172");
    expect(code).not.toContain("68");
  });

  it("encodes multiple concerns in the order chosen, and none as 0", () => {
    expect(encodeShare({ ...PROFILE, concerns: ["heat", "neckShoulder"] })).toBe("1-s-170-60-6-w-he.ns-80");
    expect(encodeShare({ ...PROFILE, concerns: [] })).toBe("1-s-170-60-6-w-0-80");
  });
});

describe("decodeShare", () => {
  it("round-trips every height and weight into the bucket that contains it", () => {
    for (let heightCm = 120; heightCm <= 200; heightCm += 1) {
      for (let weightKg = 25; weightKg <= 150; weightKg += 1) {
        const shared = decodeShare(encodeShare({ ...PROFILE, heightCm, weightKg }));
        expect(shared).not.toBeNull();
        expect(heightCm).toBeGreaterThanOrEqual(shared!.height.min);
        expect(heightCm).toBeLessThanOrEqual(shared!.height.max);
        expect(weightKg).toBeGreaterThanOrEqual(shared!.weight.min);
        expect(weightKg).toBeLessThanOrEqual(shared!.weight.max);
      }
    }
  });

  it("clips buckets at the allowed range", () => {
    const at = (heightCm: number, weightKg: number) => decodeShare(encodeShare({ ...PROFILE, heightCm, weightKg }))!;
    expect(at(120, 25)).toMatchObject({ height: { min: 120, max: 124 }, weight: { min: 25, max: 29 } });
    expect(at(125, 30)).toMatchObject({ height: { min: 125, max: 129 }, weight: { min: 30, max: 39 } });
    expect(at(200, 150)).toMatchObject({ height: { min: 200, max: 200 }, weight: { min: 150, max: 150 } });
  });

  it("restores the other answers and keeps the concern order", () => {
    expect(decodeShare("1-c-140-30-3-s-ns.lb-any")).toEqual({
      sitter: "child",
      height: { min: 140, max: 144 },
      weight: { min: 30, max: 39 },
      hours: "3to6",
      purpose: "study",
      concerns: ["neckShoulder", "lowerBack"],
      budget: "any",
    });
  });

  it.each([
    null,
    "",
    "2-s-170-60-6-w-lb-80", // 모르는 버전
    "1-s-170-60-6-w-lb", // 항목 수
    "1-s-172-60-6-w-lb-80", // 원래 키를 그대로 넣은 링크
    "1-s-170-65-6-w-lb-80", // 원래 체중
    "1-s-170-060-6-w-lb-80", // 다른 표기
    "1-s-115-60-6-w-lb-80", // 키 범위 밖
    "1-s-205-60-6-w-lb-80",
    "1-s-170-10-6-w-lb-80", // 체중 범위 밖
    "1-s-170-160-6-w-lb-80",
    "1-x-170-60-6-w-lb-80", // 모르는 코드
    "1-s-170-60-5-w-lb-80",
    "1-s-170-60-6-w-lb.xx-80",
    "1-s-170-60-6-w-lb.lb-80", // 중복
    "1-s-170-60-6-w--80",
    "1-s-170-60-6-w-lb-90",
  ])("rejects %s", (code) => {
    expect(decodeShare(code)).toBeNull();
  });
});

describe("representativeProfile", () => {
  it("uses the middle of the height bucket and the top of the weight bucket", () => {
    const shared = decodeShare("1-s-170-60-6-w-lb-80")!;
    expect(representativeProfile(shared)).toEqual({ ...PROFILE, heightCm: 172, weightKg: 69 });
    expect(representativeProfile(decodeShare("1-s-200-150-6-w-lb-80")!)).toMatchObject({ heightCm: 200, weightKg: 150 });
  });

  it("never recommends a chair whose load limit the real weight could exceed", () => {
    for (let weightKg = 25; weightKg <= 150; weightKg += 1) {
      const shared = decodeShare(encodeShare({ ...PROFILE, weightKg }))!;
      for (const score of rankChairs(representativeProfile(shared), CHAIRS)) {
        expect(score.chair.spec.maxWeightKg).toBeGreaterThanOrEqual(shared.weight.max);
      }
    }
  });

  it("agrees with the original top pick for at least 95% of profiles", () => {
    // 시드 고정 난수(mulberry32)로 고른 표본. 대표값 선택을 바꿔 일치율이 떨어지면 실패한다.
    let t = 20261015;
    const next = () => {
      t = (t + 0x6d2b79f5) | 0;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
    const pick = <T>(options: readonly T[]) => options[Math.floor(next() * options.length)];

    let same = 0;
    const total = 3000;
    for (let i = 0; i < total; i += 1) {
      const profile: Profile = {
        sitter: pick(SITTERS),
        heightCm: 120 + Math.floor(next() * 81),
        weightKg: 25 + Math.floor(next() * 126),
        hours: pick(HOURS),
        purpose: pick(PURPOSES),
        concerns: CONCERNS.filter(() => next() < 0.3),
        budget: pick(BUDGETS),
      };
      const original = rankChairs(profile, CHAIRS)[0]?.chair.slug;
      const shared = rankChairs(representativeProfile(decodeShare(encodeShare(profile))!), CHAIRS)[0]?.chair.slug;
      if (original === shared) same += 1;
    }
    expect(same / total).toBeGreaterThanOrEqual(0.95);
  });
});

describe("sharedSeatRange", () => {
  it("shows a range so the exact height can't be worked back from the seat height", () => {
    expect(sharedSeatRange(decodeShare("1-s-170-60-6-w-lb-80")!)).toEqual({ min: 450, max: 460 });
    expect(sharedSeatRange(decodeShare("1-s-200-60-6-w-lb-80")!)).toEqual({ min: 525, max: 525 });
  });
});
