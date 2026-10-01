import Link from "next/link";
import { SCORE_MAX, type ChairScore } from "@/lib/fit/score";
import { DataCard } from "./data-card";

const ROWS: { key: keyof typeof SCORE_MAX; label: string }[] = [
  { key: "body", label: "체형 적합" },
  { key: "usage", label: "사용 패턴" },
  { key: "concern", label: "불편 부위" },
  { key: "budget", label: "예산" },
];

/** 적합도 점수가 어떻게 구성됐는지 공개한다. */
export function ScoreBreakdown({ score }: { score: ChairScore }) {
  return (
    <DataCard
      title="점수 구성"
      action={
        <Link href="/fit/method" className="text-xs text-muted underline underline-offset-4 hover:text-ink">
          계산 방식 보기
        </Link>
      }
    >
      <dl className="space-y-3">
        {ROWS.map(({ key, label }) => {
          const value = score.breakdown[key];
          const max = SCORE_MAX[key];
          return (
            <div key={key} className="grid grid-cols-[5.5rem_1fr_4.5rem] items-center gap-3 text-sm">
              <dt>{label}</dt>
              <dd aria-hidden="true" className="h-2 rounded-full bg-data-track">
                <span
                  className="block h-full rounded-full bg-data-range"
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </dd>
              <dd className="text-right font-medium tabular-nums">
                {value} <span className="text-data-label">/ {max}</span>
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="mt-4 flex items-baseline justify-between border-t border-data-line pt-3 text-sm">
        <span>합계</span>
        <span className="font-semibold tabular-nums">적합도 {score.total}</span>
      </p>
    </DataCard>
  );
}
