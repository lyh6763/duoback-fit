/**
 * 화면용 Pretendard 서브셋(파일 1개)을 만들거나, 빌드 결과물의 글자가 모두 들어 있는지 검사한다.
 *
 * Pretendard 동적 서브셋(글자 범위별 woff2 92개)은 페이지마다 조각 10~15개(250~380KB)를 받았고,
 * 브라우저가 레이아웃 후에야 필요한 조각을 알아내서 첫 화면이 폰트를 기다렸다.
 * 사이트에 실제로 나오는 글자만 남긴 파일 하나를 preload하면 요청 하나로 끝난다.
 *
 * 글자는 `next build` 결과물(정적 HTML·RSC 페이로드·클라이언트 JS)에서 모은다. 소스 대신 결과물을 읽어
 * 주석의 한글은 빠지고, 클라이언트에서만 그리는 문구(입력 단계·토스트 등)는 들어간다.
 *
 *   npm run build && npm run fonts:web          서브셋과 글자 목록을 다시 만든다
 *   npm run build && npm run fonts:web -- --check   빠진 글자가 있으면 실패한다(CI)
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import subsetFont from "subset-font";

const require = createRequire(import.meta.url);
const root = process.cwd();
const fontDir = join(root, "src/app/fonts");
const fontPath = join(fontDir, "pretendard-site.woff2");
const charsetPath = join(fontDir, "pretendard-site.chars.txt");
const source = join(dirname(require.resolve("pretendard/package.json")), "dist/web/variable/woff2/PretendardVariable.woff2");

// 사이트가 쓰는 굵기: font-normal(400) ~ font-bold(700)
const WEIGHT = { min: 400, max: 700 };

// 본문에 나올 수 있는 글자 범위. 라이브러리 코드에 섞인 제어 문자·사용자 영역 문자는 버린다.
const RENDERABLE = /[ -ÿ‐-⁯₠-⃏℀-⋿①-⓿■-➿　-〿㄰-㆏가-힣！-｠]/u;

function printableAscii() {
  let result = "";
  for (let code = 0x20; code <= 0x7e; code += 1) result += String.fromCharCode(code);
  return result;
}

async function* files(dir, pattern) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path, pattern);
    else if (pattern.test(entry.name)) yield path;
  }
}

/** JS 문자열의 \uXXXX, \u{...} 이스케이프를 실제 글자로 바꾼다(빌드된 청크는 한글을 이스케이프한다). */
function unescape(text) {
  return text
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

async function collectChars() {
  const chars = new Set();
  const sources = [
    files(join(root, ".next/server/app"), /\.(html|rsc)$/),
    files(join(root, ".next/static/chunks"), /\.js$/),
  ];
  let count = 0;
  for (const source of sources) {
    for await (const path of source) {
      count += 1;
      for (const char of unescape(await readFile(path, "utf8"))) if (RENDERABLE.test(char)) chars.add(char);
    }
  }
  if (count === 0) throw new Error("빌드 결과물이 없습니다. 먼저 `npm run build`를 실행하세요.");
  return [...chars].sort();
}

const collected = await collectChars();

if (process.argv.includes("--check")) {
  const covered = new Set(await readFile(charsetPath, "utf8"));
  const missing = collected.filter((char) => !covered.has(char));
  if (missing.length) {
    console.error(`화면용 폰트 서브셋에 없는 글자 ${missing.length}개: ${missing.join("")}`);
    console.error("`npm run build && npm run fonts:web`으로 서브셋을 다시 만들어 커밋하세요.");
    process.exit(1);
  }
  console.log(`화면용 폰트 서브셋이 빌드 결과물의 글자 ${collected.length}개를 모두 포함합니다.`);
} else {
  const charset = printableAscii() + collected.join("");
  const original = await readFile(source);
  const subset = await subsetFont(original, charset, { targetFormat: "woff2", variationAxes: { wght: WEIGHT } });
  await writeFile(fontPath, subset);
  await writeFile(charsetPath, charset);
  const hangul = collected.filter((char) => /[가-힣]/.test(char)).length;
  console.log(`글자 ${charset.length}개(한글 ${hangul}자), ${(original.length / 1024).toFixed(0)}KB → ${(subset.length / 1024).toFixed(1)}KB`);
}
