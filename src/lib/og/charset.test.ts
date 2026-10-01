import { describe, expect, it } from "vitest";
import { unsupportedChars } from "../../../scripts/og-charset.mjs";
import { CHAIRS } from "@/data/chairs";
import { CATEGORY_LABEL, formatPrice, formatSeatRange } from "@/lib/chairs/format";

/**
 * OG 이미지는 서브셋 폰트(KS X 1001 한글 + ASCII)로 그린다.
 * 서브셋에 없는 글자는 빈 칸(두부)으로 나오므로 OG에 들어가는 모든 문자열을 검사한다.
 */
describe("OG font subset", () => {
  it("covers every chair string drawn on OG images", () => {
    for (const chair of CHAIRS) {
      const text = [
        chair.name,
        `${CATEGORY_LABEL[chair.category]} 의자`,
        formatPrice(chair.price),
        formatSeatRange(chair.spec),
      ].join(" ");
      expect(unsupportedChars(text), chair.slug).toEqual([]);
    }
  });

  it("covers the static OG copy", () => {
    const copy = [
      "DUOBACK Fit",
      "내 몸에 맞는 의자, 1분이면 찾아요",
      "키와 앉는 습관만 알려주면 적합도와 그 이유를 보여드려요",
      "키 172cm의 권장 좌판 높이 455 mm",
      "권장 키 좌판 높이 최대 하중 158–198cm 120kg",
    ].join(" ");
    expect(unsupportedChars(copy)).toEqual([]);
  });

  it("reports glyphs outside the subset", () => {
    expect(unsupportedChars("똠방각하 😀")).toEqual(["똠", "😀"]);
  });
});
