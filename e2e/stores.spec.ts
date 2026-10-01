import { expect, test } from "@playwright/test";
import { completeFitFinder } from "./helpers";

test.describe("Stores", () => {
  test("filters stores by displayed model", async ({ page }) => {
    await page.goto("/stores");
    const cards = page.getByRole("main").getByRole("article");
    await expect(cards).toHaveCount(5);

    const filter = page.getByRole("navigation", { name: "모델별 매장 필터" });
    await filter.getByRole("link", { name: "D-043W PLUS" }).click();
    await expect(page).toHaveURL(/\/stores\?model=d043w$/);
    await expect(filter.getByRole("link", { name: "D-043W PLUS" })).toHaveAttribute("aria-current", "page");
    await expect(cards).toHaveCount(2);
    await expect(page.getByText("D-043W PLUS 전시 매장 2곳")).toBeVisible();

    await filter.getByRole("link", { name: "전체" }).click();
    await expect(cards).toHaveCount(5);
  });

  test("links from a chair page to the stores that display it", async ({ page }) => {
    await page.goto("/chairs/dk073w");
    await page.getByRole("link", { name: /전시 매장 3곳 보기/ }).click();
    await expect(page).toHaveURL(/model=dk073w$/);
    await expect(page.getByRole("main").getByRole("article")).toHaveCount(3);
  });

  test("marks stores that display the visitor's top match", async ({ page }) => {
    await completeFitFinder(page);
    await page.goto("/stores");
    // 1순위 D3-HS는 강남·판교·서면에 전시돼 있다
    await expect(page.getByRole("article").filter({ hasText: "내 추천 1순위 모델 전시 중" })).toHaveCount(3);
  });

  test("uses unreachable phone numbers in tel: links", async ({ page }) => {
    await page.goto("/stores");
    const hrefs = await page.locator('a[href^="tel:"]').evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")),
    );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toMatch(/^tel:0\d{1,2}-0000-\d{4}$/);
  });
});
