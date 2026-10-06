import { describe, expect, it } from "vitest";
import { getChair } from "@/data/chairs";
import type { Chair } from "@/lib/chairs/types";
import {
  addToCompareList,
  compareHref,
  parseCompareParam,
  removeFromCompareList,
  sanitizeCompareList,
} from "./list";
import { buildCompareGroups, onlyDifferences, type CompareRow } from "./rows";

function chairs(...slugs: string[]) {
  return slugs.map((slug) => {
    const chair = getChair(slug);
    if (!chair) throw new Error(`missing chair ${slug}`);
    return chair;
  });
}

function row(groups: ReturnType<typeof buildCompareGroups>, key: string): CompareRow {
  const found = groups.flatMap((group) => group.rows).find((r) => r.key === key);
  if (!found) throw new Error(`missing row ${key}`);
  return found;
}

describe("compare list", () => {
  it("drops unknown and duplicate slugs and keeps at most 3", () => {
    expect(sanitizeCompareList(["q1w", "nope", "q1w", "d3hs", "d2500g", "dk073w"])).toEqual([
      "q1w",
      "d3hs",
      "d2500g",
    ]);
  });

  it("parses the ?m= query value", () => {
    expect(parseCompareParam("q1w, d3hs")).toEqual(["q1w", "d3hs"]);
    expect(parseCompareParam("")).toEqual([]);
    expect(parseCompareParam(null)).toEqual([]);
  });

  it("reports why an add did nothing", () => {
    expect(addToCompareList(["q1w"], "d3hs")).toEqual({ list: ["q1w", "d3hs"], result: "added" });
    expect(addToCompareList(["q1w"], "q1w").result).toBe("exists");
    expect(addToCompareList(["q1w", "d3hs", "d2500g"], "dk073w")).toEqual({
      list: ["q1w", "d3hs", "d2500g"],
      result: "full",
    });
  });

  it("removes and builds shareable links", () => {
    expect(removeFromCompareList(["q1w", "d3hs"], "q1w")).toEqual(["d3hs"]);
    expect(compareHref(["q1w", "d3hs"])).toBe("/compare?m=q1w,d3hs");
    expect(compareHref([])).toBe("/compare");
  });
});

describe("compare rows", () => {
  it("marks differing rows and the best value", () => {
    const groups = buildCompareGroups(chairs("q1w", "d2500g"));
    const load = row(groups, "load");
    expect(load.values).toEqual(["120 kg", "130 kg"]);
    expect(load.diff).toBe(true);
    expect(load.best).toEqual([1]);
    expect(load.bars).toEqual([120 / 130, 1]);
  });

  it("treats the cheaper price as best", () => {
    expect(row(buildCompareGroups(chairs("q1w", "d3hs")), "price").best).toEqual([1]);
  });

  it("marks every tied leader, and nobody when all are equal", () => {
    const groups = buildCompareGroups(chairs("q1w", "d2500g", "d3hs"));
    expect(row(groups, "armrest").best).toEqual([0, 1]);
    expect(row(groups, "headrest").best).toEqual([]);
    expect(row(groups, "headrest").diff).toBe(false);
  });

  it("does not mark diff or best with a single chair", () => {
    const single = buildCompareGroups(chairs("q1w"));
    const flagged = single.flatMap((g) => g.rows).filter((r) => r.diff || r.best.length > 0);
    expect(flagged).toEqual([]);
  });

  it("keeps only differing rows and drops empty groups", () => {
    const groups = onlyDifferences(buildCompareGroups(chairs("q1w", "d3hs")));
    const keys = groups.flatMap((g) => g.rows.map((r) => r.key));
    expect(keys).not.toContain("category");
    expect(keys).not.toContain("headrest");
    expect(keys).toContain("price");
    expect(groups.every((g) => g.rows.length > 0)).toBe(true);
  });

  it("returns one value per chair in order", () => {
    const list: Chair[] = chairs("dk073w", "q1w");
    for (const r of buildCompareGroups(list).flatMap((g) => g.rows)) {
      expect(r.values).toHaveLength(2);
    }
    expect(row(buildCompareGroups(list), "seat").values).toEqual(["440 mm 고정", "420–520 mm"]);
  });
});
