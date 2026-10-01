/**
 * OG 이미지용 Pretendard 서브셋을 만든다.
 *
 * OG 이미지 렌더러(Satori)는 woff2를 읽지 못해 otf/ttf가 필요한데, 원본은 굵기당 약 1.6MB다.
 * KS X 1001 한글 + ASCII만 남겨 저장소에 커밋할 수 있는 크기로 줄인다.
 *
 * 실행: npm run fonts:og  (원본은 devDependency인 pretendard 패키지에서 읽는다)
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import subsetFont from "subset-font";
import { OG_CHARSET } from "./og-charset.mjs";

const require = createRequire(import.meta.url);
const pretendardDir = join(dirname(require.resolve("pretendard/package.json")), "dist/public/static");
const outDir = join(process.cwd(), "assets/fonts");

const WEIGHTS = ["Medium", "Bold"];

await mkdir(outDir, { recursive: true });

for (const weight of WEIGHTS) {
  const source = await readFile(join(pretendardDir, `Pretendard-${weight}.otf`));
  const subset = await subsetFont(source, OG_CHARSET, { targetFormat: "sfnt" });
  const target = join(outDir, `Pretendard-${weight}.og.otf`);
  await writeFile(target, subset);
  console.log(`${weight}: ${(source.length / 1024).toFixed(0)}KB → ${(subset.length / 1024).toFixed(0)}KB`);
}
