import { expect, test } from "@playwright/test";
import { completeFitFinder } from "./helpers";

test.describe("Fit Finder", () => {
  test("recommends a chair with its reasons and score breakdown", async ({ page }) => {
    await completeFitFinder(page, { heightDelta: 2 });

    // 172cm × 2.5 + 25 = 455mm
    await expect(page.getByRole("heading", { level: 1, name: "당신의 권장 좌판 높이" })).toBeVisible();
    await expect(page.locator("main")).toContainText("455mm");

    // 예산 80만 원 안에서 9시간·업무·허리 → D3-HS(78만 원)
    const top = page.getByRole("heading", { level: 2, name: "D3-HS 메쉬" });
    await expect(top).toBeVisible();

    const breakdown = page.getByText("점수 구성").locator("..").locator("..");
    await expect(breakdown).toContainText("체형 적합");
    await expect(breakdown).toContainText("합계");

    // 결과는 새로고침해도 유지된다(localStorage)
    await page.reload();
    await expect(top).toBeVisible();
  });

  test("deletes the saved profile and lets the visitor undo it", async ({ page }) => {
    await completeFitFinder(page);
    const stored = () =>
      page.evaluate(() => ({
        profile: localStorage.getItem("duoback-fit:profile"),
        draft: sessionStorage.getItem("duoback-fit:draft"),
      }));
    const before = await stored();
    expect(before.profile).not.toBeNull();

    await page.getByRole("button", { name: "내 정보 지우기" }).click();

    // 저장소에서 지워지고, 빈 화면의 제목으로 포커스가 옮겨진다
    await expect(page.getByRole("heading", { level: 1, name: "아직 결과가 없어요" })).toBeFocused();
    await expect(page.locator("main")).toContainText("저장된 키·체중과 답변을 모두 지웠어요");
    expect(await stored()).toEqual({ profile: null, draft: null });

    // 실수로 눌렀다면 토스트에서 되돌린다
    await expect(page.getByRole("status")).toContainText("저장된 내 정보를 지웠어요");
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "당신의 권장 좌판 높이" })).toBeVisible();
    expect(await stored()).toEqual(before);

    // 지운 뒤 새로고침해도 결과가 돌아오지 않는다
    await page.getByRole("button", { name: "내 정보 지우기" }).click();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "아직 결과가 없어요" })).toBeVisible();
  });

  test("moves focus to each question for screen readers", async ({ page }) => {
    await page.goto("/fit");
    await page.getByRole("button", { name: "시작하기" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "누가 앉나요?" })).toBeFocused();
    await page.getByRole("button", { name: /^나/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "키와 체중을 알려주세요" })).toBeFocused();
  });

  test("keeps answers when going back a step", async ({ page }) => {
    await page.goto("/fit");
    await page.getByRole("button", { name: "시작하기" }).click();
    await page.getByRole("button", { name: /^자녀/ }).click();
    await page.getByRole("button", { name: "← 이전" }).click();
    await expect(page).toHaveURL(/step=1/);
    await expect(page.getByRole("button", { name: /^자녀/ })).toHaveAttribute("aria-pressed", "true");
  });

  test("asks for a choice before leaving the concerns step", async ({ page }) => {
    await page.goto("/fit?preset=back");
    // 프리셋은 누가 앉는지 + 불편 부위를 채운다. 2~4단계를 지나 5단계까지 간다
    await page.getByRole("button", { name: "다음" }).click();
    await page.getByRole("button", { name: "3~6시간" }).click();
    await page.getByRole("button", { name: /^공부/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "불편한 곳이 있나요?" })).toBeVisible();
    await expect(page.getByRole("button", { name: "허리", exact: true })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "허리", exact: true }).click();
    await page.getByRole("button", { name: "다음" }).click();
    // Next.js의 라우트 안내 영역도 role="alert"라서 문구로 좁힌다
    await expect(page.getByRole("alert").filter({ hasText: "하나 이상 골라주세요" })).toBeVisible();
    await expect(page).toHaveURL(/step=5/);
  });

  test("starts a child preset with child-sized defaults", async ({ page }) => {
    await page.goto("/fit?preset=kid");
    await expect(page).toHaveURL(/step=2/);
    await expect(page.getByRole("slider", { name: "키" })).toHaveValue("145");
  });

  test("sends a deep link to the first unanswered question", async ({ page }) => {
    await page.goto("/fit?step=5");
    await expect(page).toHaveURL(/step=1/);
  });

  test("offers to resume an unfinished session", async ({ page }) => {
    await page.goto("/fit");
    await page.getByRole("button", { name: "시작하기" }).click();
    await page.getByRole("button", { name: /^나/ }).click();
    await page.getByRole("button", { name: "다음" }).click();
    await expect(page).toHaveURL(/step=3/);

    await page.goto("/fit");
    await page.getByRole("link", { name: /이어서 하기 \(2\/6 완료\)/ }).click();
    await expect(page).toHaveURL(/step=3/);
  });

  test("shows the saved fit on chair pages", async ({ page }) => {
    await completeFitFinder(page);
    await page.goto("/chairs/q1w");
    await expect(page.getByText("나와의 핏")).toBeVisible();
    await expect(page.getByRole("figure").first()).toContainText("권장 높이 455mm");
  });
});
