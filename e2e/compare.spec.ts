import { expect, test, type Page } from "@playwright/test";
import { completeFitFinder } from "./helpers";

function addButton(page: Page, name: string) {
  return page.getByRole("button", { name: `${name} 비교에 담기` });
}

/** 모델 열 머리글만 센다. 그룹 머리글(기본·체형 등)도 columnheader이므로 thead로 한정한다. */
const modelHeaders = (page: Page) => page.getByRole("table").locator("thead").getByRole("columnheader");

const toast = (page: Page) => page.getByRole("status").filter({ hasText: /\S/ });

test.describe("Compare", () => {
  test("adds up to three chairs and blocks the fourth", async ({ page }) => {
    await page.goto("/chairs");

    await addButton(page, "Q1W 메쉬").click();
    await expect(addButton(page, "Q1W 메쉬")).toHaveAttribute("aria-pressed", "true");
    await expect(toast(page)).toContainText("비교에 담았어요 · 1/3");
    await expect(page.getByRole("complementary", { name: "비교 목록" })).toContainText("하나 더 담아주세요");

    await addButton(page, "D3-HS 메쉬").click();
    await addButton(page, "D2500G-DASW").click();
    await expect(toast(page)).toContainText("3/3");

    await addButton(page, "DK-073W").click();
    await expect(toast(page)).toContainText("최대 3개까지");
    await expect(addButton(page, "DK-073W")).toHaveAttribute("aria-pressed", "false");

    await page.getByRole("complementary", { name: "비교 목록" }).getByRole("link", { name: /비교하기/ }).click();
    await expect(page).toHaveURL(/\/compare\?m=q1w,d3hs,d2500g$/);
    await expect(page.getByRole("table")).toBeVisible();
    await expect(modelHeaders(page)).toHaveCount(3);
  });

  test("filters to differing rows and marks the best value", async ({ page }) => {
    await page.goto("/compare?m=q1w,d2500g");
    const table = page.getByRole("table");
    const rowsBefore = await table.locator("tbody tr:not([aria-hidden])").count();

    await page.getByRole("switch", { name: "차이 나는 항목만" }).click();
    await expect(page.getByRole("switch", { name: "차이 나는 항목만" })).toHaveAttribute("aria-checked", "true");
    await expect.poll(() => table.locator("tbody tr:not([aria-hidden])").count()).toBeLessThan(rowsBefore);

    // 최대 하중: Q1W 120kg vs D2500G 130kg → 130kg이 가장 유리
    await expect(table.getByText("(가장 유리)").first()).toBeAttached();
    await expect(table).toContainText("130 kg");
  });

  test("removes a chair, syncs the URL, and undoes", async ({ page }) => {
    await page.goto("/compare?m=q1w,d3hs,d2500g");
    await page.getByRole("button", { name: "D3-HS 메쉬 비교에서 빼기" }).click();
    await expect(page).toHaveURL(/m=q1w,d2500g$/);
    await expect(page.getByRole("link", { name: "+ 모델 추가" })).toBeVisible();

    await toast(page).getByRole("button", { name: "되돌리기" }).click();
    await expect(page).toHaveURL(/m=q1w,d2500g,d3hs$/);
  });

  test("keeps the visitor's list when a shared link has no valid models", async ({ page }) => {
    await page.goto("/compare?m=dk073w,d043w");
    await expect(modelHeaders(page)).toHaveCount(2);

    await page.goto("/compare?m=nope,also-bad");
    await expect(page).toHaveURL(/m=dk073w,d043w$/);
    await expect(modelHeaders(page)).toHaveCount(2);
  });

  test("compares the top three from the Fit result, with undo", async ({ page }) => {
    await page.goto("/compare?m=dk073w");
    await completeFitFinder(page);

    await page.getByRole("button", { name: "상위 3개 비교하기" }).click();
    await expect(page).toHaveURL(/\/compare\?m=d3hs,/);
    await expect(page.getByRole("row", { name: /나와의 적합도/ })).toBeVisible();

    await toast(page).getByRole("button", { name: "되돌리기" }).click();
    await expect(page).toHaveURL(/m=dk073w$/);
  });

  test("shows an empty state with nothing to compare", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.getByText("비교할 의자를 담아주세요")).toBeVisible();
  });
});
