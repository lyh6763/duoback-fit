import { ANGLES, type Angle, type Chair, type ChairCategory, type ChairSpec } from "./types";
import { SEAT_TOLERANCE_MM, heightForSeat } from "@/lib/fit/score";

export const CATEGORY_LABEL: Record<ChairCategory, string> = {
  office: "사무용",
  student: "학생용",
};

export const ANGLE_LABEL: Record<Angle, string> = {
  front: "정면",
  left: "왼쪽",
  right: "오른쪽",
  rear: "뒷면",
};

export const ARMREST_LABEL: Record<ChairSpec["armrest"], string> = {
  fixed: "고정형",
  "2d": "2D 조절",
  "3d": "3D 조절",
  "4d": "4D 조절",
};

export const LUMBAR_LABEL: Record<ChairSpec["lumbar"], string> = {
  none: "없음",
  fixed: "고정형",
  adjustable: "조절형",
  dualback: "듀얼백",
};

export const TILT_LABEL: Record<ChairSpec["tilt"], string> = {
  none: "없음",
  basic: "기본 틸팅",
  synchro: "싱크로 틸팅",
};

export const MATERIAL_LABEL: Record<ChairSpec["seatMaterial"], string> = {
  mesh: "메쉬",
  fabric: "패브릭",
  foam: "폼",
};

export const BASE_LABEL: Record<ChairSpec["base"], string> = {
  nylon: "나일론 5발 바퀴",
  aluminum: "알루미늄 5발 바퀴",
  cantilever: "캔틸레버 (바퀴 없음)",
  sled: "썰매형 (바퀴 없음)",
};

export function chairImage(chair: Chair, colorSlug: string, angle: Angle = "front") {
  return `/images/chairs/${chair.slug}-${colorSlug}-${angle}.jpg`;
}

export function chairViews(chair: Chair, colorSlug: string) {
  return ANGLES.map((angle) => ({ angle, src: chairImage(chair, colorSlug, angle) }));
}

export function isFixedHeight(spec: ChairSpec) {
  return spec.seatHeightMm.min === spec.seatHeightMm.max;
}

/** 좌판 높이로 역산한 권장 키 범위(cm). 고정형은 허용 오차만큼 넓혀 범위로 보여준다. */
export function recommendedHeightRange(spec: ChairSpec) {
  const tolerance = isFixedHeight(spec) ? SEAT_TOLERANCE_MM : 0;
  return {
    min: Math.round(heightForSeat(spec.seatHeightMm.min - tolerance)),
    max: Math.round(heightForSeat(spec.seatHeightMm.max + tolerance)),
  };
}

/** 최대 하중의 85% — 여유 있게 쓸 수 있는 체중 */
export function comfortableWeight(spec: ChairSpec) {
  return Math.floor(spec.maxWeightKg * 0.85);
}

export function formatSeatRange(spec: ChairSpec) {
  const { min, max } = spec.seatHeightMm;
  return min === max ? `${min} mm 고정` : `${min}–${max} mm`;
}

const priceFormatter = new Intl.NumberFormat("ko-KR");

export function formatPrice(price: number) {
  return `${priceFormatter.format(price)}원`;
}
