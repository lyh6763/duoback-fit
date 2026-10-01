import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { chairViews, recommendedHeightRange } from "@/lib/chairs/format";
import { CHAIRS } from "./chairs";

describe("chair data", () => {
  it("has unique slugs", () => {
    const slugs = CHAIRS.map((chair) => chair.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has every color × angle image in public/", () => {
    for (const chair of CHAIRS) {
      for (const color of chair.colors) {
        for (const view of chairViews(chair, color.slug)) {
          expect(existsSync(join("public", view.src)), view.src).toBe(true);
        }
      }
    }
  });

  it("derives the recommended height ranges documented in the PRD", () => {
    const ranges = Object.fromEntries(
      CHAIRS.map((chair) => [chair.slug, recommendedHeightRange(chair.spec)]),
    );
    expect(ranges.q1w).toEqual({ min: 158, max: 198 });
    expect(ranges.d3hs).toEqual({ min: 160, max: 200 });
    expect(ranges.d2500g).toEqual({ min: 166, max: 206 });
    // 고정형은 허용 오차 ±15mm(±6cm)만큼 넓힌다
    expect(ranges.dk073w).toEqual({ min: 160, max: 172 });
    expect(ranges.d043w).toEqual({ min: 152, max: 164 });
  });
});
