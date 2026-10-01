import { describe, expect, it } from "vitest";
import { getChair } from "@/data/chairs";
import { chairSchema } from "@/lib/chairs/schema";
import { draftSchema, profileSchema, type Profile } from "@/lib/fit/profile";

/**
 * zod/mini로 옮긴 스키마가 잘못된 값을 여전히 거부하는지 확인한다.
 * 특히 profile/draft는 localStorage·sessionStorage 값을 검증하므로, 손상되거나 조작된 값을 막아야 한다.
 */
const valid: Profile = {
  sitter: "self",
  heightCm: 172,
  weightKg: 68,
  hours: "6to9",
  purpose: "work",
  concerns: ["lowerBack"],
  budget: "any",
};

describe("profileSchema", () => {
  it("accepts a complete profile", () => {
    expect(profileSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["height below range", { heightCm: 119 }],
    ["height above range", { heightCm: 201 }],
    ["fractional height", { heightCm: 170.5 }],
    ["weight as string", { weightKg: "68" }],
    ["unknown enum value", { hours: "always" }],
    ["unknown concern", { concerns: ["knee"] }],
    ["too many concerns", { concerns: ["lowerBack", "neckShoulder", "hipThigh", "heat", "lowerBack"] }],
  ])("rejects %s", (_, patch) => {
    expect(profileSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });

  it("rejects a profile with a missing field", () => {
    const missing: Partial<Profile> = { ...valid };
    delete missing.budget;
    expect(profileSchema.safeParse(missing).success).toBe(false);
  });
});

describe("draftSchema", () => {
  it("accepts partial answers but still validates the ones present", () => {
    expect(draftSchema.safeParse({}).success).toBe(true);
    expect(draftSchema.safeParse({ sitter: "child" }).success).toBe(true);
    expect(draftSchema.safeParse({ sitter: "robot" }).success).toBe(false);
  });
});

describe("chairSchema", () => {
  it("rejects a seat range whose min exceeds max", () => {
    const chair = getChair("q1w")!;
    const broken = { ...chair, spec: { ...chair.spec, seatHeightMm: { min: 520, max: 420 } } };
    expect(chairSchema.safeParse(chair).success).toBe(true);
    expect(chairSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects malformed slugs, colors, and dates", () => {
    const chair = getChair("q1w")!;
    expect(chairSchema.safeParse({ ...chair, slug: "Q1W" }).success).toBe(false);
    expect(chairSchema.safeParse({ ...chair, colors: [{ ...chair.colors[0], hex: "black" }] }).success).toBe(false);
    expect(chairSchema.safeParse({ ...chair, releaseDate: "2024-13-40" }).success).toBe(false);
    expect(chairSchema.safeParse({ ...chair, highlights: chair.highlights.slice(0, 2) }).success).toBe(false);
  });
});
