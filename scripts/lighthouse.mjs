/**
 * 프로덕션 빌드를 띄워 주요 페이지를 Lighthouse로 측정하고, 기준에 못 미치면 실패한다.
 *
 * - README의 성능 기록과 같은 Lighthouse 버전·설정(모바일, 기본 시뮬레이션 스로틀링)을 쓴다.
 *   (@lhci/cli 0.15는 Lighthouse 12를 내장해 점수 기준이 달라서 CLI를 직접 호출한다)
 * - 페이지마다 여러 번 재고 성능 점수가 중앙값인 회차를 대표로 쓴다.
 * - 성능 점수는 측정 기기의 CPU에 따라 달라지므로 회차마다 benchmarkIndex를 함께 기록한다.
 *
 *   npm run build && npm run lighthouse
 *   LH_RUNS=1 LH_MIN_PERFORMANCE=85 npm run lighthouse
 */
import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const require = createRequire(import.meta.url);
const LIGHTHOUSE = "lighthouse@13.5.0";
const PORT = Number(process.env.LH_PORT ?? 3300);
const BASE = `http://localhost:${PORT}`;
const RUNS = Number(process.env.LH_RUNS ?? 3);
const OUT = join(process.cwd(), "lighthouse-reports");

const PAGES = ["/", "/chairs", "/chairs/q1w", "/fit", "/fit/method", "/compare", "/stores"];

// 카테고리별 최소 점수. 성능은 CPU 영향을 받으니 환경변수로 조정할 수 있게 둔다.
const MIN_SCORE = {
  performance: Number(process.env.LH_MIN_PERFORMANCE ?? 90),
  accessibility: 100,
  "best-practices": 100,
  seo: 100,
};
// /compare는 쿼리 조합마다 페이지가 생겨 의도적으로 noindex라 SEO 검사에서 뺀다.
const SKIP = { "/compare": ["seo"] };
const CATEGORIES = Object.keys(MIN_SCORE);

const chromePath = process.env.CHROME_PATH ?? chromium.executablePath();

async function waitForServer() {
  for (let i = 0; i < 120; i += 1) {
    try {
      if ((await fetch(BASE)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`${BASE}가 응답하지 않습니다.`);
}

/** 이미지 최적화 결과는 첫 요청 때 만들어진다. 측정 전에 페이지와 이미지를 한 번씩 받아 둔다. */
async function warmUp() {
  const images = new Set();
  for (const path of PAGES) {
    const html = await (await fetch(BASE + path)).text();
    for (const [url] of html.matchAll(/\/_next\/image\?[^"\s,]+/g)) images.add(url.replaceAll("&amp;", "&"));
  }
  await Promise.all([...images].map((url) => fetch(BASE + url).then((res) => res.arrayBuffer())));
  console.log(`예열: 페이지 ${PAGES.length}개, 이미지 ${images.size}개`);
}

function runLighthouse(path, run) {
  const name = (path === "/" ? "home" : path.slice(1).replaceAll("/", "_")) + `-${run}`;
  const chromeFlags = ["--headless=new", ...(process.env.CI ? ["--no-sandbox"] : [])].join(" ");
  const result = spawnSync(
    "npx",
    [
      "--yes",
      LIGHTHOUSE,
      BASE + path,
      "--quiet",
      `--chrome-flags="${chromeFlags}"`,
      `--only-categories=${CATEGORIES.join(",")}`,
      "--output=json",
      "--output=html",
      `--output-path=${join(OUT, name)}`,
    ],
    { shell: true, stdio: "inherit", env: { ...process.env, CHROME_PATH: chromePath } },
  );
  if (result.status !== 0) throw new Error(`Lighthouse 실행 실패: ${path} (${run}회차)`);
  return JSON.parse(readFileSync(join(OUT, `${name}.report.json`), "utf8"));
}

const score = (report, category) => Math.round(report.categories[category].score * 100);
const seconds = (report, id) => `${(report.audits[id].numericValue / 1000).toFixed(2)}s`;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "-p", String(PORT)], {
  stdio: "ignore",
});
const failures = [];
const rows = [];
try {
  await waitForServer();
  await warmUp();

  for (const path of PAGES) {
    const reports = Array.from({ length: RUNS }, (_, index) => runLighthouse(path, index + 1));
    // 성능 점수가 중앙값인 회차를 대표로 쓴다(lhci의 대표 회차 선택과 같은 방식)
    const sorted = [...reports].sort((a, b) => a.categories.performance.score - b.categories.performance.score);
    const median = sorted[Math.floor(sorted.length / 2)];

    for (const category of CATEGORIES) {
      if (SKIP[path]?.includes(category)) continue;
      const value = score(median, category);
      if (value < MIN_SCORE[category]) failures.push(`${path} ${category} ${value} < ${MIN_SCORE[category]}`);
    }
    rows.push(
      `| \`${path}\` | ${CATEGORIES.map((c) => score(median, c)).join(" / ")} | ${seconds(median, "first-contentful-paint")} | ${seconds(median, "largest-contentful-paint")} | ${Math.round(median.audits["total-blocking-time"].numericValue)}ms | ${median.audits["cumulative-layout-shift"].numericValue.toFixed(3)} | ${reports.map((r) => Math.round(r.environment.benchmarkIndex)).join(", ")} |`,
    );
  }
} finally {
  server.kill();
}

const summary = [
  `### Lighthouse (${LIGHTHOUSE}, 모바일, ${RUNS}회 중 성능 중앙값 회차)`,
  "",
  "| 페이지 | 성능 / 접근성 / 권장사항 / SEO | FCP | LCP | TBT | CLS | CPU benchmarkIndex |",
  "|---|---|---|---|---|---|---|",
  ...rows,
  "",
  `기준: ${CATEGORIES.map((c) => `${c} ≥ ${MIN_SCORE[c]}`).join(", ")} (\`/compare\`는 noindex라 SEO 제외)`,
  "",
  failures.length ? `**기준 미달 ${failures.length}건**\n\n${failures.map((f) => `- ${f}`).join("\n")}` : "모든 페이지가 기준을 통과했습니다.",
].join("\n");

console.log(`\n${summary}`);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
process.exit(failures.length ? 1 : 0);
