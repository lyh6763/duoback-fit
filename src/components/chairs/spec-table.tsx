import {
  ARMREST_LABEL,
  BASE_LABEL,
  LUMBAR_LABEL,
  MATERIAL_LABEL,
  TILT_LABEL,
  comfortableWeight,
  formatSeatRange,
  recommendedHeightRange,
} from "@/lib/chairs/format";
import type { Chair } from "@/lib/chairs/schema";

type Row = { label: string; value: string; note?: string };

function specGroups(chair: Chair): { title: string; rows: Row[] }[] {
  const { spec } = chair;
  const heights = recommendedHeightRange(spec);
  const { w, d, h } = spec.sizeMm;
  const height = h.min === h.max ? `${h.min}` : `${h.min}–${h.max}`;

  return [
    {
      title: "체형",
      rows: [
        { label: "좌판 높이", value: formatSeatRange(spec), note: `키 ${heights.min}~${heights.max}cm에 적합` },
        { label: "최대 하중", value: `${spec.maxWeightKg} kg`, note: `체중 약 ${comfortableWeight(spec)}kg까지 여유` },
        { label: "등판 높이", value: `${spec.backHeightMm} mm` },
      ],
    },
    {
      title: "조절",
      rows: [
        { label: "팔걸이", value: ARMREST_LABEL[spec.armrest] },
        { label: "요추 지지", value: LUMBAR_LABEL[spec.lumbar] },
        { label: "헤드레스트", value: spec.headrest ? "있음" : "없음" },
        { label: "좌판 깊이 조절", value: spec.seatDepthAdjust ? "가능" : "불가" },
        { label: "틸팅", value: TILT_LABEL[spec.tilt] },
      ],
    },
    {
      title: "소재",
      rows: [
        { label: "등판", value: MATERIAL_LABEL[spec.backMaterial] },
        { label: "좌판", value: MATERIAL_LABEL[spec.seatMaterial] },
        { label: "다리", value: BASE_LABEL[spec.base] },
      ],
    },
    {
      title: "크기 · 보증",
      rows: [
        { label: "W × D × H", value: `${w} × ${d} × ${height} mm` },
        { label: "품질 보증", value: `${spec.warrantyYears}년` },
      ],
    },
  ];
}

export function SpecTable({ chair }: { chair: Chair }) {
  return (
    <div className="overflow-hidden rounded-data border border-data-line bg-data-surface">
      <table className="w-full text-sm">
        <caption className="sr-only">{chair.name} 사양</caption>
        {specGroups(chair).map((group) => (
          <tbody key={group.title} className="border-b border-data-line last:border-b-0">
            <tr>
              <th
                colSpan={2}
                scope="colgroup"
                className="bg-surface px-5 py-2 text-left text-xs font-semibold tracking-label text-muted-strong"
              >
                {group.title}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.label} className="border-t border-data-line first:border-t-0">
                <th scope="row" className="w-2/5 px-5 py-3 text-left font-normal text-data-label">
                  {row.label}
                </th>
                <td className="px-5 py-3 text-right">
                  <span className="font-medium tabular-nums text-data-value">{row.value}</span>
                  {row.note && <span className="mt-0.5 block text-moss-700">{row.note}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
