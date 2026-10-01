import type { Reason } from "@/lib/fit/score";

/** 추천 근거 체크리스트. note는 주의 항목이다. */
export function ReasonList({ reasons, notes = [] }: { reasons: Reason[]; notes?: Reason[] }) {
  if (reasons.length === 0 && notes.length === 0) return null;
  return (
    <ul className="divide-y divide-data-line">
      {reasons.map((reason) => (
        <Row key={`r-${reason.label}`} reason={reason} kind="pass" />
      ))}
      {notes.map((note) => (
        <Row key={`n-${note.label}`} reason={note} kind="note" />
      ))}
    </ul>
  );
}

function Row({ reason, kind }: { reason: Reason; kind: "pass" | "note" }) {
  return (
    <li className="flex items-baseline justify-between gap-4 py-2 text-sm">
      <span className="flex items-baseline gap-2">
        {kind === "pass" ? (
          <span aria-hidden="true" className="text-primary">
            ✓
          </span>
        ) : (
          <span aria-hidden="true" className="font-bold text-warning-icon">
            !
          </span>
        )}
        <span className="sr-only">{kind === "pass" ? "맞는 점:" : "주의:"}</span>
        <span className={kind === "note" ? "text-warning" : ""}>{reason.label}</span>
      </span>
      <span className="text-right font-medium tabular-nums text-data-value">{reason.value}</span>
    </li>
  );
}
