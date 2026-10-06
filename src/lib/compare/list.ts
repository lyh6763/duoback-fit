import { getChair } from "@/data/chairs";

/** 비교는 최대 3개까지 — docs/01-prd.md F5 */
export const COMPARE_MAX = 3;

export type AddResult = "added" | "exists" | "full";

/** 저장소에서 읽은 비교 목록 검증. 문자열 배열(최대 10개)만 통과시킨다. 모르는 slug는 sanitizeCompareList가 거른다. */
export function parseSlugList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > 10) return null;
  return value.every((item) => typeof item === "string") ? [...value] : null;
}

/** 알 수 없는 slug와 중복을 걸러내고 최대 개수로 자른다. 순서는 유지한다. */
export function sanitizeCompareList(slugs: readonly string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const slug of slugs) {
    if (seen.has(slug) || !getChair(slug)) continue;
    seen.add(slug);
    result.push(slug);
    if (result.length === COMPARE_MAX) break;
  }
  return result;
}

/** `?m=q1w,d3hs` 쿼리 값을 비교 목록으로 바꾼다. */
export function parseCompareParam(value: string | null) {
  if (!value) return [];
  return sanitizeCompareList(value.split(",").map((slug) => slug.trim()));
}

export function addToCompareList(list: readonly string[], slug: string): { list: string[]; result: AddResult } {
  if (list.includes(slug)) return { list: [...list], result: "exists" };
  if (list.length >= COMPARE_MAX) return { list: [...list], result: "full" };
  return { list: [...list, slug], result: "added" };
}

export function removeFromCompareList(list: readonly string[], slug: string) {
  return list.filter((item) => item !== slug);
}

export function compareHref(list: readonly string[]) {
  return list.length ? `/compare?m=${list.join(",")}` : "/compare";
}
