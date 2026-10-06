import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // zod는 브라우저 번들에 넣지 않는다(라우트당 약 23KB gzip). 스키마 파일과 테스트에서만 쓴다.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/**/schema.ts", "src/**/*.schema.ts", "src/**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "zod", message: "Use a *.schema.ts file (tests only) — zod must stay out of the client bundle." },
            { name: "zod/mini", message: "Use a *.schema.ts file (tests only) — zod must stay out of the client bundle." },
          ],
          patterns: [
            {
              regex: "(^|/)([a-z-]+\\.)?schema$",
              message: "Schema modules pull zod into the bundle; import types from the zod-free module instead.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
