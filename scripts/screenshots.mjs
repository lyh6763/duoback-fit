/**
 * README용 스크린샷을 만든다. 프로덕션 빌드를 띄우고, 프로필을 저장해 둔 상태로 주요 화면을 찍어
 * docs/screenshots/*.webp로 저장한다.
 *
 *   npm run build && npm run screenshots
 *   SHOT=fit-result-shared npm run screenshots   (한 장만 다시 찍기)
 */
import { spawn } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const require = createRequire(import.meta.url);
// sharp는 Next.js 이미지 최적화가 쓰는 의존성이다. 따로 설치하지 않고 next 쪽에서 찾는다.
const sharp = createRequire(require.resolve("next/package.json"))("sharp");

const PORT = 3400;
const BASE = `http://localhost:${PORT}`;
const OUT = join(process.cwd(), "docs/screenshots");

// 키 172cm, 하루 6~9시간 업무, 허리가 불편한 사용자
const PROFILE = {
  sitter: "self",
  heightCm: 172,
  weightKg: 68,
  hours: "6to9",
  purpose: "work",
  concerns: ["lowerBack"],
  budget: "any",
};

const DESKTOP = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 };
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

const SHOTS = [
  { name: "home", device: DESKTOP, path: "/" },
  { name: "fit-step", device: MOBILE, path: "/fit?step=2", draft: { sitter: "self" } },
  { name: "fit-result", device: DESKTOP, path: "/fit/result", profile: true },
  // 모바일은 사진 아래의 1순위 모델과 분석 카드(데이터 레이어)가 보이도록 스크롤한다
  { name: "fit-result-mobile", device: MOBILE, path: "/fit/result", profile: true, scrollTo: "#top-title" },
  { name: "chair-detail", device: DESKTOP, path: "/chairs/q1w", profile: true },
  { name: "compare", device: DESKTOP, path: "/compare?m=q1w,d3hs,d2500g", profile: true },
  // 공유받은 결과: 같은 프로필의 구간 코드(키 170~174, 체중 60~69)를 프로필 없는 브라우저로 연다
  { name: "fit-result-shared", device: DESKTOP, path: "/fit/result?share=1-s-170-60-6-w-lb-any" },
];

async function waitForServer() {
  for (let i = 0; i < 120; i += 1) {
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`${BASE}가 응답하지 않습니다.`);
}

mkdirSync(OUT, { recursive: true });
const server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "-p", String(PORT)], {
  stdio: "ignore",
});
const browser = await chromium.launch();
try {
  await waitForServer();
  for (const shot of SHOTS.filter((s) => !process.env.SHOT || s.name === process.env.SHOT)) {
    const context = await browser.newContext({ ...shot.device, reducedMotion: "reduce" });
    await context.addInitScript(
      ({ profile, draft }) => {
        if (profile) localStorage.setItem("duoback-fit:profile", JSON.stringify(profile));
        if (draft) sessionStorage.setItem("duoback-fit:draft", JSON.stringify(draft));
      },
      { profile: shot.profile ? PROFILE : null, draft: shot.draft ?? null },
    );
    const page = await context.newPage();
    await page.goto(BASE + shot.path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    // 화면 안의 이미지가 모두 그려질 때까지 기다린다
    await page.waitForFunction(() =>
      [...document.images]
        .filter((img) => {
          const rect = img.getBoundingClientRect();
          return rect.width > 0 && rect.bottom > 0 && rect.top < innerHeight;
        })
        .every((img) => img.complete),
    );
    if (shot.scrollTo) {
      await page.locator(shot.scrollTo).evaluate((el) => {
        const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
        window.scrollTo(0, el.getBoundingClientRect().top + scrollY - header - 48);
      });
    }
    const png = await page.screenshot();
    const target = join(OUT, `${shot.name}.webp`);
    await sharp(png).webp({ quality: 82 }).toFile(target);
    console.log(`${shot.name}.webp ${(statSync(target).size / 1024).toFixed(0)}KB`);
    await context.close();
  }
} finally {
  await browser.close();
  server.kill();
}
