import { ImageResponse } from "next/og";
import { OG_COLORS } from "@/lib/og/shared";

// icon.svg와 같은 그림(두 개의 등판·좌판·기둥)을 32→180 비율로 키웠다. iOS가 모서리를 직접 둥글리므로 배경은 꽉 채운다.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const BACK = { width: 34, height: 73, borderRadius: 17, background: OG_COLORS.canvas };

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: OG_COLORS.primary,
        }}
      >
        <div style={{ display: "flex", gap: 17 }}>
          <div style={BACK} />
          <div style={BACK} />
        </div>
        <div style={{ width: 107, height: 22, marginTop: 6, borderRadius: 11, background: OG_COLORS.marker }} />
        <div style={{ width: 17, height: 35, borderRadius: "0 0 6px 6px", background: OG_COLORS.canvas }} />
      </div>
    ),
    size,
  );
}
