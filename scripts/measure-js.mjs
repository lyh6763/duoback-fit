/**
 * 빌드 결과(.next)에서 라우트별로 브라우저가 내려받는 JS 크기를 잰다.
 * 정적 HTML의 <script src>를 모아 원본·gzip 크기를 합산한다. `npm run build` 뒤에 실행한다.
 *
 * 실행: node scripts/measure-js.mjs [--json]
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const ROUTES = {
  "/": "index.html",
  "/chairs": "chairs.html",
  "/chairs/q1w": "chairs/q1w.html",
  "/fit": "fit.html",
  "/compare": "compare.html",
  "/stores": "stores.html",
};

const appDir = join(".next", "server", "app");
if (!existsSync(appDir)) {
  console.error("Run `npm run build` first.");
  process.exit(1);
}

const kb = (bytes) => (bytes / 1024).toFixed(1);
const results = {};
const zodChunks = new Set();

for (const [route, file] of Object.entries(ROUTES)) {
  const html = readFileSync(join(appDir, file), "utf8");
  const sources = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((m) => m[1]))];
  let raw = 0;
  let gzip = 0;
  for (const src of sources) {
    const path = join(".next", src.replace(/^\/_next\//, ""));
    const code = readFileSync(path);
    raw += code.length;
    gzip += gzipSync(code).length;
    if (/ZodError|\$ZodType|_zod/.test(code.toString())) zodChunks.add(src);
  }
  results[route] = { scripts: sources.length, raw, gzip };
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(results));
} else {
  console.log("route              scripts   raw KB   gzip KB");
  for (const [route, r] of Object.entries(results)) {
    console.log(`${route.padEnd(18)} ${String(r.scripts).padStart(7)} ${kb(r.raw).padStart(8)} ${kb(r.gzip).padStart(9)}`);
  }
  let zodRaw = 0;
  let zodGzip = 0;
  for (const src of zodChunks) {
    const code = readFileSync(join(".next", src.replace(/^\/_next\//, "")));
    zodRaw += code.length;
    zodGzip += gzipSync(code).length;
  }
  console.log(`\nchunks containing zod: ${zodChunks.size} (${kb(zodRaw)} KB raw, ${kb(zodGzip)} KB gzip)`);
}
