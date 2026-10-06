/**
 * 의자 데이터의 타입과 상수. 브라우저 번들에 들어가므로 zod를 import하지 않는다.
 * 런타임 제약(정규식, min ≤ max 등)은 ./schema.ts의 zod 스키마가 테스트에서 검증하고,
 * 두 정의가 어긋나면 schema.ts의 타입 단언이 컴파일 에러를 낸다.
 */

export const CATEGORIES = ["office", "student"] as const;
export const ANGLES = ["front", "left", "right", "rear"] as const;

export type ChairCategory = (typeof CATEGORIES)[number];
export type Angle = (typeof ANGLES)[number];

type RangeMm = { min: number; max: number };

export type ChairSpec = {
  /** min === max 이면 높이 고정형 */
  seatHeightMm: RangeMm;
  seatDepthAdjust: boolean;
  backHeightMm: number;
  sizeMm: { w: number; d: number; h: RangeMm };
  maxWeightKg: number;
  armrest: "fixed" | "2d" | "3d" | "4d";
  headrest: boolean;
  lumbar: "none" | "fixed" | "adjustable" | "dualback";
  tilt: "none" | "basic" | "synchro";
  backMaterial: "mesh" | "fabric";
  seatMaterial: "mesh" | "fabric" | "foam";
  base: "nylon" | "aluminum" | "cantilever" | "sled";
  warrantyYears: number;
};

export type Chair = {
  slug: string;
  name: string;
  category: ChairCategory;
  price: number;
  releaseDate: string;
  summary: string;
  highlights: { title: string; body: string }[];
  colors: { name: string; hex: string; slug: string }[];
  spec: ChairSpec;
};
