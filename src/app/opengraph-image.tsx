import { ImageResponse } from "next/og";
import { getChair } from "@/data/chairs";
import { chairImage } from "@/lib/chairs/format";
import { recommendedSeatHeight } from "@/lib/fit/score";
import { DataCard, OG_COLORS, OG_FONTS, OG_SIZE, PhotoPanel, SeatGauge, Wordmark, publicImageSrc } from "@/lib/og/shared";

export const alt = "DUOBACK Fit — 키와 앉는 습관으로 내 몸에 맞는 의자를 찾는 서비스";
export const size = OG_SIZE;
export const contentType = "image/png";

const EXAMPLE_HEIGHT_CM = 172;

export default async function SiteOgImage() {
  const chair = getChair("d2500g");
  if (!chair) throw new Error("hero chair missing");
  const photo = await publicImageSrc(chairImage(chair, chair.colors[0].slug));
  const target = recommendedSeatHeight(EXAMPLE_HEIGHT_CM);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: OG_COLORS.canvas, fontFamily: "Pretendard" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 720,
            padding: "52px 56px",
          }}
        >
          <Wordmark />

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 64, fontWeight: 700, color: OG_COLORS.ink, lineHeight: 1.15 }}>
              <span>내 몸에 맞는 의자,</span>
              <span>1분이면 찾아요</span>
            </div>
            <span style={{ fontSize: 26, fontWeight: 500, color: OG_COLORS.muted }}>
              키와 앉는 습관만 알려주면 적합도와 그 이유를 보여드려요
            </span>
          </div>

          <DataCard>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 20, fontWeight: 500, color: OG_COLORS.muted }}>
                키 {EXAMPLE_HEIGHT_CM}cm의 권장 좌판 높이
              </span>
              <span style={{ fontSize: 34, fontWeight: 700, color: OG_COLORS.highlight }}>{target} mm</span>
            </div>
            <SeatGauge range={chair.spec.seatHeightMm} target={target} />
          </DataCard>
        </div>

        <PhotoPanel src={photo} width={OG_SIZE.width - 720} />
      </div>
    ),
    { ...OG_SIZE, fonts: OG_FONTS },
  );
}
