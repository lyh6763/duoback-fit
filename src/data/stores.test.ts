import { describe, expect, it } from "vitest";
import { CHAIRS, getChair } from "./chairs";
import { STORES, storesWithModel } from "./stores";

describe("store data", () => {
  it("has unique ids", () => {
    const ids = STORES.map((store) => store.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only displays chairs that exist", () => {
    for (const store of STORES) {
      for (const slug of store.displayModels) {
        expect(getChair(slug), `${store.id} → ${slug}`).toBeDefined();
      }
    }
  });

  it("displays every chair in at least one store", () => {
    for (const chair of CHAIRS) {
      expect(storesWithModel(chair.slug).length, chair.slug).toBeGreaterThan(0);
    }
  });

  it("uses unassigned 0000 exchange numbers so tel: links never reach a real line", () => {
    for (const store of STORES) {
      expect(store.phone).toMatch(/^0\d{1,2}-0000-\d{4}$/);
    }
  });
});
