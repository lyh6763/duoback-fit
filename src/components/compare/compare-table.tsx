"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CautionNote } from "@/components/brand/caution-note";
import { FitGauge } from "@/components/data/fit-gauge";
import { ScoreBadge } from "@/components/data/score-badge";
import { chairImage } from "@/lib/chairs/format";
import type { Chair } from "@/lib/chairs/types";
import { COMPARE_MAX } from "@/lib/compare/list";
import { buildCompareGroups, onlyDifferences, type CompareRow } from "@/lib/compare/rows";
import type { Profile } from "@/lib/fit/profile";
import { scoreChair } from "@/lib/fit/score";
import { focusCompareHeading } from "./compare-page-focus";
import { useCompareToggle } from "./use-compare-toggle";

/*
 * 표 하나를 표가 놓인 상자의 폭(@container)에 따라 두 배치로 보여준다. 전환점은 @2xl(42rem = 672px)로,
 * 라벨 열(160px)과 모델 3열이 나란히 들어가는 폭이다.
 * - 넓을 때(WIDE): 왼쪽 라벨 열(행 머리글 th) + 모델 열
 * - 좁을 때(NARROW): 라벨 열 없이 각 행 위에 라벨 줄을 그려 가로 스크롤 없이 3열을 유지.
 *   스크린 리더는 각 셀 앞의 숨김 라벨로 읽는다.
 * 한쪽 배치에만 쓰는 칸은 display:none으로 숨겨 표의 열과 접근성 트리에서 함께 빠지게 한다.
 * 그룹 제목은 넓을 때 라벨 열까지 덮어야 해서(colSpan은 CSS로 바꿀 수 없음) 두 배치용 행을 하나씩 두고 하나만 보여준다.
 */
const WIDE_CELL = "hidden @2xl:table-cell";
const WIDE_ROW = "hidden @2xl:table-row";
const NARROW_ROW = "@2xl:hidden";
const CELL_X = "px-2 @2xl:px-4";

export function CompareTable({
  chairs,
  profile,
  diffOnly,
}: {
  chairs: Chair[];
  profile: Profile | null;
  diffOnly: boolean;
}) {
  const allGroups = buildCompareGroups(chairs);
  const groups = diffOnly ? onlyDifferences(allGroups) : allGroups;
  const emptySlots = COMPARE_MAX - chairs.length;
  const modelColumns = chairs.length + emptySlots;

  return (
    <div className="@container rounded-data border border-data-line bg-data-surface">
      <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
        <caption className="sr-only">
          {chairs.map((chair) => chair.name).join(", ")} 사양 비교
          {diffOnly ? " (차이 나는 항목만)" : ""}
        </caption>
        <thead>
          <tr>
            <td
              className={`${WIDE_CELL} sticky top-(--header-h) z-10 w-40 rounded-tl-data border-b border-data-line bg-data-surface @4xl:w-48`}
            />
            {chairs.map((chair) => (
              <th
                key={chair.slug}
                scope="col"
                className={`sticky top-(--header-h) z-10 border-b border-data-line bg-data-surface py-3 text-left align-top font-normal ${CELL_X}`}
              >
                <ChairHeader chair={chair} />
              </th>
            ))}
            {Array.from({ length: emptySlots }, (_, index) => (
              <td
                key={`empty-${index}`}
                className={`sticky top-(--header-h) z-10 border-b border-data-line bg-data-surface py-3 align-top ${CELL_X}`}
              >
                <Link
                  href="/chairs"
                  className="grid aspect-square w-full place-items-center rounded-sm border border-dashed border-line text-center text-xs font-semibold text-primary hover:border-primary hover:bg-primary-subtle @2xl:text-sm"
                >
                  + 모델 추가
                </Link>
              </td>
            ))}
          </tr>
        </thead>

        {profile && (
          <tbody>
            <RowLabel modelColumns={modelColumns} label="나와의 적합도" />
            <tr>
              <RowHeader label="나와의 적합도" />
              {chairs.map((chair) => {
                const score = scoreChair(profile, chair);
                return (
                  <td key={chair.slug} className={`border-b border-data-line pt-1 pb-4 align-top @2xl:py-4 ${CELL_X}`}>
                    <NarrowLabel>나와의 적합도: </NarrowLabel>
                    {score ? (
                      <div className="space-y-1">
                        <ScoreBadge score={score.total} />
                        <FitGauge range={chair.spec.seatHeightMm} target={score.seat.target} size="s" />
                      </div>
                    ) : (
                      <CautionNote>하중 초과</CautionNote>
                    )}
                  </td>
                );
              })}
              {Array.from({ length: emptySlots }, (_, index) => (
                <td key={`empty-${index}`} className="border-b border-data-line" />
              ))}
            </tr>
          </tbody>
        )}

        {groups.map((group) => (
          <tbody key={group.title}>
            <GroupTitleRow className={WIDE_ROW} colSpan={modelColumns + 1} title={group.title} />
            <GroupTitleRow className={NARROW_ROW} colSpan={modelColumns} title={group.title} />
            {group.rows.map((row) => (
              <RowView key={row.key} row={row} modelColumns={modelColumns} emptySlots={emptySlots} />
            ))}
          </tbody>
        ))}
      </table>
      {groups.length === 0 && (
        <p className="px-5 py-8 text-center text-muted">모든 항목이 같아요. 다른 모델을 담아 비교해 보세요.</p>
      )}
    </div>
  );
}

function ChairHeader({ chair }: { chair: Chair }) {
  const { toggle } = useCompareToggle(chair.slug, focusCompareHeading);

  function remove(button: HTMLButtonElement) {
    if (document.activeElement === button) {
      const buttons = Array.from(button.closest("thead")?.querySelectorAll<HTMLButtonElement>("[data-compare-remove]") ?? []);
      const index = buttons.indexOf(button);
      const neighbor = buttons[index + 1] ?? buttons[index - 1];
      if (neighbor) neighbor.focus({ preventScroll: true });
      else focusCompareHeading();
    }
    toggle();
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Link href={`/chairs/${chair.slug}`} tabIndex={-1} aria-hidden="true" className="block">
          <Image
            src={chairImage(chair, chair.colors[0].slug)}
            alt=""
            width={300}
            height={300}
            sizes="(min-width: 768px) 200px, 30vw"
            className="aspect-square w-full rounded-sm bg-photo object-cover"
          />
        </Link>
        <button
          type="button"
          data-compare-remove=""
          onClick={(event) => remove(event.currentTarget)}
          aria-label={`${chair.name} 비교에서 빼기`}
          className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-ink/80 text-xs text-inverse hover:bg-ink"
        >
          ✕
        </button>
      </div>
      <Link href={`/chairs/${chair.slug}`} className="block font-semibold leading-snug hover:underline">
        {chair.name}
      </Link>
    </div>
  );
}

function DiffDot() {
  return <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-data-diff" />;
}

function GroupTitleRow({ className, colSpan, title }: { className: string; colSpan: number; title: string }) {
  return (
    <tr className={className}>
      <th
        scope="colgroup"
        colSpan={colSpan}
        className="border-b border-data-line bg-surface px-4 py-2 text-left text-xs font-semibold tracking-label text-muted-strong"
      >
        {title}
      </th>
    </tr>
  );
}

/** 넓을 때의 행 머리글 */
function RowHeader({ label, diff = false }: { label: string; diff?: boolean }) {
  return (
    <th
      scope="row"
      className={`${WIDE_CELL} border-b border-data-line px-4 py-3 text-left align-top font-normal text-data-label`}
    >
      <span className="flex items-center gap-2">
        {diff && <DiffDot />}
        {label}
        {diff && <span className="sr-only"> (차이 있음)</span>}
      </span>
    </th>
  );
}

/** 좁을 때 각 셀 앞에 붙는 숨김 라벨(넓을 때는 행 머리글이 대신한다) */
function NarrowLabel({ children }: { children: ReactNode }) {
  return <span className="sr-only @2xl:hidden">{children}</span>;
}

/** 좁을 때의 라벨 줄. 스크린 리더는 각 셀 앞의 숨김 라벨로 읽으므로 이 줄은 숨긴다. */
function RowLabel({ modelColumns, label, diff = false }: { modelColumns: number; label: string; diff?: boolean }) {
  return (
    <tr aria-hidden="true" className={NARROW_ROW}>
      <td colSpan={modelColumns} className="px-2 pt-3 text-xs text-data-label">
        <span className="flex items-center gap-1.5">
          {diff && <DiffDot />}
          {label}
        </span>
      </td>
    </tr>
  );
}

function RowView({ row, modelColumns, emptySlots }: { row: CompareRow; modelColumns: number; emptySlots: number }) {
  const tone = row.diff ? "bg-data-diff-bg" : "";
  return (
    <>
      <RowLabel modelColumns={modelColumns} label={row.label} diff={row.diff} />
      <tr className={tone}>
        <RowHeader label={row.label} diff={row.diff} />
        {row.values.map((value, index) => {
          const best = row.best.includes(index);
          return (
            <td key={index} className="border-b border-data-line px-2 pt-1 pb-3 align-top @2xl:px-4 @2xl:py-3">
              <NarrowLabel>
                {row.label}
                {row.diff ? " (차이 있음)" : ""}:{" "}
              </NarrowLabel>
              <span
                className={`inline-flex max-w-full flex-wrap items-baseline gap-x-1 tabular-nums ${
                  best ? "font-semibold text-data-best" : "text-data-value"
                }`}
              >
                {best && (
                  <span aria-hidden="true" className="text-xs">
                    ▲
                  </span>
                )}
                {value}
                {best && <span className="sr-only"> (가장 유리)</span>}
              </span>
              {row.bars && (
                <span aria-hidden="true" className="mt-1.5 block h-1 rounded-full bg-data-range-soft">
                  <span
                    className="block h-full rounded-full bg-data-range"
                    style={{ width: `${(row.bars[index] ?? 0) * 100}%` }}
                  />
                </span>
              )}
            </td>
          );
        })}
        {Array.from({ length: emptySlots }, (_, index) => (
          <td key={`empty-${index}`} className="border-b border-data-line" />
        ))}
      </tr>
    </>
  );
}
