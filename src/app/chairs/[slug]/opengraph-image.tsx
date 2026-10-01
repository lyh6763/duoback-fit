import { ImageResponse } from "next/og";
import { CHAIRS, getChair } from "@/data/chairs";
import {
  CATEGORY_LABEL,
  chairImage,
  formatPrice,
  formatSeatRange,
  recommendedHeightRange,
} from "@/lib/chairs/format";
import {
  DataCard,
  OG_COLORS,
  OG_FONTS,
  OG_SIZE,
  PhotoPanel,
  SeatGauge,
  Stat,
  Wordmark,
  publicImageSrc,
} from "@/lib/og/shared";

export const alt = "의자 사진과 몸 기준 스펙 요약";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return CHAIRS.map((chair) => ({ slug: chair.slug }));
}

export default async function ChairOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chair = getChair(slug);
  if (!chair) return new Response("Not found", { status: 404 });

  const heights = recommendedHeightRange(chair.spec);
  const photo = await publicImageSrc(chairImage(chair, chair.colors[0].slug));

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: OG_COLORS.canvas, fontFamily: "Pretendard" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 680,
            padding: "52px 56px",
          }}
        >
          <Wordmark />

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: OG_COLORS.primary, letterSpacing: 1 }}>
              {CATEGORY_LABEL[chair.category]} 의자
            </span>
            <span style={{ fontSize: 68, fontWeight: 700, color: OG_COLORS.ink, lineHeight: 1.05 }}>{chair.name}</span>
            <span style={{ fontSize: 30, fontWeight: 700, color: OG_COLORS.ink }}>{formatPrice(chair.price)}</span>
          </div>

          <DataCard>
            <div style={{ display: "flex", gap: 40 }}>
              <Stat label="권장 키" value={`${heights.min}–${heights.max}cm`} />
              <Stat label="좌판 높이" value={formatSeatRange(chair.spec)} />
              <Stat label="최대 하중" value={`${chair.spec.maxWeightKg}kg`} />
            </div>
            <SeatGauge range={chair.spec.seatHeightMm} />
          </DataCard>
        </div>

        <PhotoPanel src={photo} width={OG_SIZE.width - 680} />
      </div>
    ),
    { ...OG_SIZE, fonts: OG_FONTS },
  );
}
