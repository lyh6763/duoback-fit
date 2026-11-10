import { describe, expect, it } from "vitest";
import { DEFAULT_TITLE, pageMetadata } from "./metadata";

describe("pageMetadata", () => {
  it("keeps the shared Open Graph fields that a page-level openGraph would otherwise drop", () => {
    const meta = pageMetadata({ title: "의자", description: "설명", path: "/chairs" });
    expect(meta.openGraph).toMatchObject({
      siteName: "DUOBACK Fit",
      locale: "ko_KR",
      type: "website",
      title: "의자 | DUOBACK Fit",
      url: "/chairs",
    });
    expect(meta.alternates).toEqual({ canonical: "/chairs" });
    expect(meta.robots).toBeUndefined();
  });

  it("adds the site share image unless the segment has its own opengraph-image", () => {
    expect(pageMetadata({ title: "의자", path: "/chairs" }).openGraph).toHaveProperty("images");
    expect(pageMetadata({ title: "D2500G", path: "/chairs/d2500g", ownOgImage: true }).openGraph).not.toHaveProperty("images");
  });

  it("drops canonical and sets noindex for per-visitor pages", () => {
    const meta = pageMetadata({ title: "비교", path: "/compare", index: false });
    expect(meta.alternates).toBeUndefined();
    expect(meta.robots).toEqual({ index: false });
  });

  it("leaves title and description to the layout when omitted (home)", () => {
    const meta = pageMetadata({ path: "/", ownOgImage: true });
    expect(meta).not.toHaveProperty("title");
    expect(meta).not.toHaveProperty("description");
    expect(meta.openGraph).toMatchObject({ title: DEFAULT_TITLE, url: "/" });
  });
});
