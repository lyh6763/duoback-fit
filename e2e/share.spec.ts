import { expect, test, type Page } from "@playwright/test";
import { completeFitFinder } from "./helpers";

const PROFILE_KEY = "duoback-fit:profile";

/** 시스템 공유 창 대신 클립보드 복사 경로를 타게 하고, 복사한 값을 읽을 수 있게 한다. */
async function captureCopiedLink(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async (text: string) => void ((window as unknown as { copied: string }).copied = text) },
      configurable: true,
    });
  });
}

test.describe("Result sharing", () => {
  test("shares only height/weight buckets and recomputes the result for the recipient", async ({ page, browser, baseURL }) => {
    await captureCopiedLink(page);
    // 키 172cm, 체중 65kg(기본값), 9시간 이상 · 업무 · 허리 · 80만 원
    await completeFitFinder(page, { heightDelta: 2 });
    const senderTop = await page.locator("#top-title").textContent();

    await page.getByRole("button", { name: "결과 공유" }).click();
    await expect(page.getByRole("status")).toContainText("결과 링크를 복사했어요");
    const link = await page.evaluate(() => (window as unknown as { copied: string }).copied);
    const url = new URL(link);
    expect(url.pathname + url.search).toBe("/fit/result?share=1-s-170-60-9-w-lb-80");
    // 원래 키·체중은 링크에 남지 않는다
    expect(link).not.toMatch(/172|65/);

    // 프로필이 없는 다른 브라우저에서 연다
    const context = await browser.newContext({ baseURL });
    const recipient = await context.newPage();
    await recipient.goto(url.pathname + url.search);

    await expect(recipient.getByRole("heading", { level: 1, name: "공유받은 결과 · 권장 좌판 높이" })).toBeVisible();
    // 정확한 좌판 높이(455mm)를 보이면 키가 역산되므로 범위로만 보여준다
    await expect(recipient.locator("main")).toContainText("450~460mm");
    await expect(recipient.getByRole("list", { name: "공유된 정보" })).toContainText("170~174cm · 60~69kg");
    await expect(recipient.locator("main")).toContainText("구간 대표값(키 172cm, 체중 69kg)");
    await expect(recipient.locator("#top-title")).toHaveText(senderTop!);

    // 개인용 동작은 보이지 않고, 보는 사람의 저장소는 그대로다
    await expect(recipient.getByRole("button", { name: "내 정보 지우기" })).toHaveCount(0);
    await expect(recipient.getByRole("button", { name: "결과 공유" })).toHaveCount(0);
    expect(await recipient.evaluate((key) => localStorage.getItem(key), PROFILE_KEY)).toBeNull();

    // 다른 기기에서 이어 보는 경우: 대표값으로 내 결과에 저장한다
    await recipient.getByRole("button", { name: "내 결과로 저장" }).click();
    await expect(recipient).toHaveURL(/\/fit\/result$/);
    await expect(recipient.getByRole("heading", { level: 1, name: "당신의 권장 좌판 높이" })).toBeVisible();
    await expect(recipient.getByRole("list", { name: "입력한 정보" })).toContainText("172cm · 69kg");
    await expect(recipient.getByRole("status")).toContainText("내 결과로 저장했어요");
    await context.close();
  });

  test("keeps the viewer's own result unless they choose to replace it", async ({ page }) => {
    const own = {
      sitter: "self",
      heightCm: 181,
      weightKg: 84,
      hours: "lt3",
      purpose: "leisure",
      concerns: [],
      budget: "any",
    };
    await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [PROFILE_KEY, JSON.stringify(own)]);
    await page.goto("/fit/result?share=1-s-170-60-9-w-lb-80");

    await expect(page.getByRole("link", { name: "내 결과 보기 →" })).toBeVisible();
    await expect(page.locator("main")).toContainText("저장하면 지금 저장된 내 결과를 바꿔요");
    expect(JSON.parse((await page.evaluate((key) => localStorage.getItem(key), PROFILE_KEY))!)).toEqual(own);

    await page.getByRole("button", { name: "내 결과로 저장" }).click();
    await expect(page.getByRole("status")).toContainText("내 결과를 공유받은 결과로 바꿨어요");
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect(page.getByRole("list", { name: "입력한 정보" })).toContainText("181cm · 84kg");
  });

  test("rejects a malformed or tampered link instead of guessing", async ({ page }) => {
    // 원래 키(172)를 직접 넣은 링크
    await page.goto("/fit/result?share=1-s-172-60-9-w-lb-80");
    await expect(page.getByRole("heading", { level: 1, name: "공유 링크가 올바르지 않아요" })).toBeVisible();
  });
});
