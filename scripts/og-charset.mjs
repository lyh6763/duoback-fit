/**
 * OG 이미지 폰트 서브셋에 넣을 문자 집합.
 * KS X 1001 완성형 한글 2,350자 + 출력 가능한 ASCII + 자주 쓰는 기호.
 * scripts/subset-og-fonts.mjs와 src/lib/og/charset.test.ts가 함께 쓴다.
 */

function ksx1001Hangul() {
  const decoder = new TextDecoder("euc-kr");
  let result = "";
  // 한글 완성형 영역: 상위 바이트 0xB0–0xC8, 하위 바이트 0xA1–0xFE
  for (let high = 0xb0; high <= 0xc8; high += 1) {
    for (let low = 0xa1; low <= 0xfe; low += 1) {
      const char = decoder.decode(new Uint8Array([high, low]));
      if (/^[가-힣]$/.test(char)) result += char;
    }
  }
  return result;
}

function printableAscii() {
  let result = "";
  for (let code = 0x20; code <= 0x7e; code += 1) result += String.fromCharCode(code);
  return result;
}

const SYMBOLS = "·•–—~…‘’“”←→↑↓▲✓✕×%₩";

export const OG_CHARSET = ksx1001Hangul() + printableAscii() + SYMBOLS;

/** 서브셋 폰트로 그릴 수 없는 문자를 돌려준다. */
export function unsupportedChars(text) {
  const supported = new Set(OG_CHARSET);
  return [...new Set(text)].filter((char) => !supported.has(char) && char !== "\n");
}
