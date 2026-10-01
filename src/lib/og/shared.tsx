import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";

/**
 * OG 이미지 공통 요소. 렌더러(Satori)는 CSS 변수와 grid를 지원하지 않으므로
 * docs/04-ui-spec.md의 토큰 값을 여기에 hex로 옮겨 쓰고, 레이아웃은 flex만 쓴다.
 */

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  canvas: "#F6F1EA",
  surface: "#E8DFD2",
  line: "#D6CABA",
  muted: "#6B655D",
  ink: "#22201C",
  primary: "#2F5D50",
  primarySubtle: "#E6EFEB",
  primaryStrong: "#244A40",
  marker: "#D9774B",
  highlight: "#A9502A",
  photo: "#F7F3F0",
  white: "#FFFFFF",
} as const;

// 폰트는 요청과 무관하므로 모듈 범위에서 한 번만 읽는다. scripts/subset-og-fonts.mjs가 만든 서브셋이다.
const [medium, bold] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Pretendard-Medium.og.otf")),
  readFile(join(process.cwd(), "assets/fonts/Pretendard-Bold.og.otf")),
]);

export const OG_FONTS = [
  { name: "Pretendard", data: medium, weight: 500 as const, style: "normal" as const },
  { name: "Pretendard", data: bold, weight: 700 as const, style: "normal" as const },
];

/** public/ 아래 JPEG를 data URI로 읽는다(빌드 시점에 정적 생성되므로 파일 시스템을 직접 읽어도 된다). */
export async function publicImageSrc(path: string) {
  const data = await readFile(join(process.cwd(), "public", path), "base64");
  return `data:image/jpeg;base64,${data}`;
}

export function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, fontSize: 30, fontWeight: 700, color: OG_COLORS.ink }}>
      DUOBACK
      <span style={{ color: OG_COLORS.primary, fontWeight: 500 }}>Fit</span>
    </div>
  );
}

export function DataCard({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        padding: "22px 26px",
        borderRadius: 12,
        border: `1px solid ${OG_COLORS.line}`,
        background: OG_COLORS.white,
      }}
    >
      {children}
    </div>
  );
}

const SCALE = { min: 350, max: 560 };

function percent(mm: number) {
  const clamped = Math.min(SCALE.max, Math.max(SCALE.min, mm));
  return ((clamped - SCALE.min) / (SCALE.max - SCALE.min)) * 100;
}

/** 웹의 FitGauge와 같은 눈금 범위(350–560mm). target이 있으면 내 위치 마커를 그린다. */
export function SeatGauge({ range, target }: { range: { min: number; max: number }; target?: number }) {
  const fixed = range.min === range.max;
  const left = percent(range.min);
  const width = fixed ? 0 : percent(range.max) - left;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", position: "relative", height: 10, borderRadius: 5, background: OG_COLORS.surface }}>
        <div
          style={{
            position: "absolute",
            top: fixed ? -4 : 0,
            left: `${left}%`,
            width: fixed ? 8 : `${width}%`,
            height: fixed ? 18 : 10,
            marginLeft: fixed ? -4 : 0,
            borderRadius: 5,
            background: OG_COLORS.primary,
          }}
        />
        {target !== undefined && (
          <div
            style={{
              position: "absolute",
              top: -9,
              left: `${percent(target)}%`,
              marginLeft: -14,
              width: 28,
              height: 28,
              borderRadius: 14,
              border: `4px solid ${OG_COLORS.white}`,
              background: OG_COLORS.marker,
              boxShadow: `0 0 0 1px ${OG_COLORS.ink}`,
            }}
          />
        )}
      </div>
      <div style={{ display: "flex", position: "relative", height: 22, fontSize: 18, color: OG_COLORS.muted }}>
        {[400, 450, 500, 550].map((tick) => (
          <span key={tick} style={{ position: "absolute", left: `${percent(tick)}%`, marginLeft: -18 }}>
            {tick}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 18, fontWeight: 500, color: OG_COLORS.muted }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 700, color: OG_COLORS.ink }}>{value}</span>
    </div>
  );
}

/**
 * 정사각형 스튜디오 사진을 패널 높이에 꽉 채우고 좌우 여백만 잘라낸다.
 * 사진 배경색이 장마다 조금씩 달라서, 패널 안에 작게 넣으면 사진 경계가 네모로 드러난다.
 */
export function PhotoPanel({ src, width }: { src: string; width: number }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        width,
        height: OG_SIZE.height,
        overflow: "hidden",
        background: OG_COLORS.photo,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- OG 렌더러는 next/image를 쓸 수 없다 */}
      <img
        src={src}
        width={OG_SIZE.height}
        height={OG_SIZE.height}
        alt=""
        style={{ flexShrink: 0, objectFit: "cover" }}
      />
    </div>
  );
}
