import { expect, type Page } from "@playwright/test";

/** 질문 6개를 끝까지 답하고 결과 화면까지 간다. heightDelta만큼 키 + 버튼을 누른다(기본 170cm). */
export async function completeFitFinder(
  page: Page,
  { heightDelta = 2, hours = "9시간 이상", concern = "허리", budget = "80만 원까지" } = {},
) {
  await page.goto("/fit");
  await page.getByRole("button", { name: "시작하기" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "누가 앉나요?" })).toBeVisible();
  await page.getByRole("button", { name: /^나/ }).click();

  await expect(page.getByRole("heading", { level: 1, name: "키와 체중을 알려주세요" })).toBeVisible();
  for (let i = 0; i < heightDelta; i += 1) {
    await page.getByRole("button", { name: "키 1 늘리기" }).click();
  }
  await page.getByRole("button", { name: "다음" }).click();

  await page.getByRole("button", { name: hours }).click();
  await page.getByRole("button", { name: /^업무/ }).click();

  await expect(page.getByRole("heading", { level: 1, name: "불편한 곳이 있나요?" })).toBeVisible();
  await page.getByRole("button", { name: concern, exact: true }).click();
  await page.getByRole("button", { name: "다음" }).click();

  await page.getByRole("button", { name: budget }).click();
  await expect(page).toHaveURL(/\/fit\/result$/);
}

/** 가로 스크롤이 생기지 않는지 확인한다. */
export async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, "page should not scroll horizontally").toBeLessThanOrEqual(clientWidth);
}
