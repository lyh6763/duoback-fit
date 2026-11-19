import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// 컴포넌트와 페이지는 원시 색(paper·sand·stone·moss·clay 등) 대신 의미 토큰(canvas·line·primary·data-* 등)을 쓴다.
// 원시 색 이름은 globals.css의 "Primitive" 블록에서 읽으므로, 원시 색을 더하거나 빼도 이 검사는 따로 고칠 필요가 없다.
const SRC = join(process.cwd(), "src");
const css = readFileSync(join(SRC, "app/globals.css"), "utf8");
const primitiveBlock = css.slice(css.indexOf("/* Primitive */"), css.indexOf("/* Semantic"));
const primitives = [...primitiveBlock.matchAll(/--color-([a-z0-9-]+):/g)].map((match) => match[1]);

const UTILITY = "(?:bg|text|border(?:-[trblxy])?|ring|outline|fill|stroke|from|via|to|decoration|divide|placeholder|caret|accent|shadow)";
const names = primitives.join("|");
const pattern = new RegExp(`(?<![\\w-])${UTILITY}-(?:${names})(?![\\w-])|var\\(--color-(?:${names})\\)`, "g");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx|ts)$/.test(name) && !name.endsWith(".test.ts") ? [path] : [];
  });
}

describe("semantic color tokens", () => {
  it("reads the primitive palette from globals.css", () => {
    expect(primitives).toContain("moss-600");
    expect(primitives).toContain("stone-500");
    expect(primitives).not.toContain("primary");
  });

  it("keeps primitive colors out of components and pages", () => {
    const found = sourceFiles(SRC).flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, index) =>
          [...line.matchAll(pattern)].map((match) => `${relative(SRC, file)}:${index + 1} ${match[0]}`),
        ),
    );
    expect(found).toEqual([]);
  });
});
