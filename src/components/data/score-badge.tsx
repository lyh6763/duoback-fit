import { scoreLevel } from "@/lib/fit/score";

const LEVEL_CLASS = {
  high: "bg-primary text-inverse",
  mid: "bg-moss-50 text-moss-700",
  low: "border border-data-line bg-data-surface text-muted",
} as const;

/** "적합도 92" — 확률처럼 읽히지 않도록 %를 붙이지 않는다. */
export function ScoreBadge({ score, size = "s" }: { score: number; size?: "s" | "l" }) {
  const sizeClass = size === "l" ? "px-3 py-1.5 text-sm" : "px-2 py-1 text-xs";
  const valueClass = size === "l" ? "text-xl" : "text-sm";
  return (
    <span
      className={`inline-flex items-baseline gap-1.5 rounded-data font-medium ${sizeClass} ${LEVEL_CLASS[scoreLevel(score)]}`}
    >
      적합도
      <span className={`font-semibold tabular-nums ${valueClass}`}>{score}</span>
    </span>
  );
}
