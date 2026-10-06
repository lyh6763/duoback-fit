import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow } from "./helpers";

const PAGES = ["/", "/chairs", "/chairs/q1w", "/chairs/dk073w", "/fit", "/fit/method", "/compare", "/stores"];

test.describe("Site", () => {
  for (const path of PAGES) {
    test(`${path} has no serious accessibility violations or horizontal overflow`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoHorizontalOverflow(page);

      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(results.passes.length, "axe should have checked something").toBeGreaterThan(0);
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(
        serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
      ).toEqual([]);

      // 제목 단계(h1 → h3 건너뜀)는 WCAG 태그가 없는 moderate 규칙이라 위 필터에 걸리지 않아 따로 확인한다
      const headings = await new AxeBuilder({ page }).withRules(["heading-order"]).analyze();
      expect(headings.violations.flatMap((v) => v.nodes.map((n) => n.target.join(" ")))).toEqual([]);
    });
  }

  test("resets scroll to the top on navigation", async ({ page }) => {
    // 기존 SPA 프로젝트에서 발견한 문제(페이지 이동 후 스크롤 유지)의 회귀 테스트
    await page.goto("/chairs/q1w");
    const related = page.getByRole("region", { name: "함께 보면 좋은 의자" });
    await related.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(300);

    await related.getByRole("heading", { level: 3 }).first().getByRole("link").click();
    await expect(page).not.toHaveURL(/\/chairs\/q1w$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("serves Pretendard from the same origin", async ({ page, baseURL }) => {
    // CDN @import는 다른 도메인 연결 + CSS 연쇄 요청으로 첫 화면을 막았다(Lighthouse 추정 761ms)
    const fontRequests: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "font" || request.url().includes("pretendard")) fontRequests.push(request.url());
    });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    expect(fontRequests.length).toBeGreaterThan(0);
    for (const url of fontRequests) expect(new URL(url).origin).toBe(new URL(baseURL!).origin);
    expect(await page.evaluate(() => document.fonts.check('16px "Pretendard Variable"', "가"))).toBe(true);
  });

  test("returns 404 for unknown pages and chairs", async ({ page }) => {
    for (const path of ["/nope", "/chairs/nope"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1, name: "찾는 페이지가 없어요" })).toBeVisible();
    }
  });

  test("exposes SEO metadata and an OG image for chair pages", async ({ page, request }) => {
    await page.goto("/chairs/q1w");
    await expect(page).toHaveTitle("Q1W 메쉬 | DUOBACK Fit");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/chairs\/q1w$/);

    const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
    expect(jsonLd).toMatchObject({ "@type": "Product", name: "Q1W 메쉬" });

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(ogImage).toContain("/chairs/q1w/opengraph-image");
    const image = await request.get(new URL(ogImage!).pathname + new URL(ogImage!).search);
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toBe("image/png");
  });

  test("lists every chair in the sitemap and hides results from robots", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const slug of ["q1w", "d3hs", "d2500g", "dk073w", "d043w"]) expect(sitemap).toContain(`/chairs/${slug}`);
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /fit/result");
  });
});
