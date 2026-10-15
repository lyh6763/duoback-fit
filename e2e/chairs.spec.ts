import { expect, test } from "@playwright/test";

const PROFILE = {
  sitter: "self",
  heightCm: 180,
  weightKg: 68,
  hours: "6to9",
  purpose: "work",
  concerns: [],
  budget: "any",
};

test.describe("Chair list", () => {
  test("filters to chairs that fit the saved body and keeps it in the URL", async ({ page }) => {
    await page.addInitScript(
      (value) => localStorage.setItem("duoback-fit:profile", value),
      JSON.stringify(PROFILE),
    );
    await page.goto("/chairs");

    const chip = page.getByRole("button", { name: "내 몸에 맞는 의자만" });
    await chip.click();
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/[?&]fits=1/);
    await expect(page.locator("main")).toContainText("키 180cm, 체중 68kg 기준");

    // 180cm: Q1W(158~198), D3-HS(160~200), D2500G(166~206)만 남고 학생용 고정형(~172, ~164)은 빠진다
    await expect(page.locator("article")).toHaveCount(3);
    const names = (await page.locator("article h3").allTextContents()).map((name) => name.split(" ")[0]).sort();
    expect(names).toEqual(["D2500G-DASW", "D3-HS", "Q1W"]);
    // 남은 카드의 "키 a~bcm" 범위가 모두 180을 포함한다
    for (const range of await page.locator("article").getByText(/키 \d+~\d+cm/).allTextContents()) {
      const [min, max] = range.match(/(\d+)~(\d+)/)!.slice(1).map(Number);
      expect(min).toBeLessThanOrEqual(180);
      expect(max).toBeGreaterThanOrEqual(180);
    }

    // 새로고침해도 필터가 유지되고, 다시 누르면 전체로 돌아간다
    await page.reload();
    await expect(page.getByRole("button", { name: "내 몸에 맞는 의자만" })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "내 몸에 맞는 의자만" }).click();
    await expect(page).not.toHaveURL(/fits=1/);
    await expect(page.locator("article")).toHaveCount(5);
  });

  test("hides the filter and ignores ?fits=1 without a saved profile", async ({ page }) => {
    await page.goto("/chairs?fits=1");
    await expect(page.getByRole("link", { name: /내 몸에 맞는 의자만 보고 싶다면/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "내 몸에 맞는 의자만" })).toHaveCount(0);
    await expect(page.locator("article")).toHaveCount(5);
  });
});
