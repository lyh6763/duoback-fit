import {
  ARMREST_LABEL,
  BASE_LABEL,
  CATEGORY_LABEL,
  LUMBAR_LABEL,
  MATERIAL_LABEL,
  TILT_LABEL,
  formatPrice,
  formatSeatRange,
  recommendedHeightRange,
} from "@/lib/chairs/format";
import type { Chair, ChairSpec } from "@/lib/chairs/types";

export type CompareRow = {
  key: string;
  label: string;
  values: string[];
  /** 모델 사이에 값이 다르면 true (2개 이상일 때만) */
  diff: boolean;
  /** 가장 유리한 값을 가진 열 index. 비교 기준이 없거나 모두 같으면 빈 배열 */
  best: number[];
  /** 크기 비교용 막대 비율(0~1). 수치 행에만 있다 */
  bars?: number[];
};

export type CompareGroup = { title: string; rows: CompareRow[] };

type RowDef = {
  key: string;
  label: string;
  value: (chair: Chair) => string;
  /** 클수록 유리한 점수. 없으면 best를 계산하지 않는다 */
  rank?: (chair: Chair) => number;
  /** 막대로 크기를 보여줄 수치 */
  magnitude?: (chair: Chair) => number;
};

const ARMREST_RANK: Record<ChairSpec["armrest"], number> = { fixed: 0, "2d": 1, "3d": 2, "4d": 3 };
const LUMBAR_RANK: Record<ChairSpec["lumbar"], number> = { none: 0, fixed: 1, dualback: 2, adjustable: 3 };
const TILT_RANK: Record<ChairSpec["tilt"], number> = { none: 0, basic: 1, synchro: 2 };

const GROUPS: { title: string; rows: RowDef[] }[] = [
  {
    title: "기본",
    rows: [
      { key: "price", label: "가격", value: (c) => formatPrice(c.price), rank: (c) => -c.price },
      { key: "category", label: "용도", value: (c) => CATEGORY_LABEL[c.category] },
    ],
  },
  {
    title: "체형",
    rows: [
      { key: "seat", label: "좌판 높이", value: (c) => formatSeatRange(c.spec) },
      {
        key: "height",
        label: "권장 키",
        value: (c) => {
          const range = recommendedHeightRange(c.spec);
          return `${range.min}~${range.max} cm`;
        },
      },
      {
        key: "load",
        label: "최대 하중",
        value: (c) => `${c.spec.maxWeightKg} kg`,
        rank: (c) => c.spec.maxWeightKg,
        magnitude: (c) => c.spec.maxWeightKg,
      },
    ],
  },
  {
    title: "조절",
    rows: [
      {
        key: "armrest",
        label: "팔걸이",
        value: (c) => ARMREST_LABEL[c.spec.armrest],
        rank: (c) => ARMREST_RANK[c.spec.armrest],
      },
      {
        key: "lumbar",
        label: "요추 지지",
        value: (c) => LUMBAR_LABEL[c.spec.lumbar],
        rank: (c) => LUMBAR_RANK[c.spec.lumbar],
      },
      {
        key: "headrest",
        label: "헤드레스트",
        value: (c) => (c.spec.headrest ? "있음" : "없음"),
        rank: (c) => Number(c.spec.headrest),
      },
      {
        key: "depth",
        label: "좌판 깊이 조절",
        value: (c) => (c.spec.seatDepthAdjust ? "가능" : "불가"),
        rank: (c) => Number(c.spec.seatDepthAdjust),
      },
      { key: "tilt", label: "틸팅", value: (c) => TILT_LABEL[c.spec.tilt], rank: (c) => TILT_RANK[c.spec.tilt] },
    ],
  },
  {
    title: "소재",
    rows: [
      { key: "back", label: "등판", value: (c) => MATERIAL_LABEL[c.spec.backMaterial] },
      { key: "seatMaterial", label: "좌판", value: (c) => MATERIAL_LABEL[c.spec.seatMaterial] },
      { key: "base", label: "다리", value: (c) => BASE_LABEL[c.spec.base] },
    ],
  },
  {
    title: "크기",
    rows: [
      {
        key: "backHeight",
        label: "등판 높이",
        value: (c) => `${c.spec.backHeightMm} mm`,
        magnitude: (c) => c.spec.backHeightMm,
      },
      {
        key: "size",
        label: "W × D",
        value: (c) => `${c.spec.sizeMm.w} × ${c.spec.sizeMm.d} mm`,
      },
    ],
  },
];

function bestIndexes(chairs: readonly Chair[], rank: (chair: Chair) => number) {
  const scores = chairs.map(rank);
  const top = Math.max(...scores);
  if (scores.every((score) => score === top)) return [];
  return scores.flatMap((score, index) => (score === top ? [index] : []));
}

export function buildCompareGroups(chairs: readonly Chair[]): CompareGroup[] {
  const comparable = chairs.length >= 2;
  return GROUPS.map((group) => ({
    title: group.title,
    rows: group.rows.map((def) => {
      const values = chairs.map(def.value);
      const row: CompareRow = {
        key: def.key,
        label: def.label,
        values,
        diff: comparable && new Set(values).size > 1,
        best: comparable && def.rank ? bestIndexes(chairs, def.rank) : [],
      };
      if (def.magnitude) {
        const magnitudes = chairs.map(def.magnitude);
        const max = Math.max(...magnitudes);
        row.bars = magnitudes.map((value) => (max > 0 ? value / max : 0));
      }
      return row;
    }),
  }));
}

/** "차이 나는 항목만" 보기. 비어 버린 그룹은 뺀다. */
export function onlyDifferences(groups: CompareGroup[]): CompareGroup[] {
  return groups
    .map((group) => ({ ...group, rows: group.rows.filter((row) => row.diff) }))
    .filter((group) => group.rows.length > 0);
}
