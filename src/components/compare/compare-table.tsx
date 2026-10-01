"use client";

import Image from "next/image";
import Link from "next/link";
import { CautionNote } from "@/components/brand/caution-note";
import { FitGauge } from "@/components/data/fit-gauge";
import { ScoreBadge } from "@/components/data/score-badge";
import { chairImage } from "@/lib/chairs/format";
import type { Chair } from "@/lib/chairs/schema";
import { COMPARE_MAX } from "@/lib/compare/list";
import { buildCompareGroups, onlyDifferences, type CompareGroup, type CompareRow } from "@/lib/compare/rows";
import type { Profile } from "@/lib/fit/profile";
import { scoreChair } from "@/lib/fit/score";
import { useCompareToggle } from "./use-compare-toggle";

type Layout = "desktop" | "mobile";

/**
 * 비교표(CompareTable).
 * - 데스크톱: 왼쪽 라벨 열 + 모델 열
 * - 모바일: 라벨 열 없이 각 행 위에 라벨 줄을 그려 가로 스크롤 없이 3열을 유지
 * 숨긴 라벨 셀이나 큰 colSpan도 표의 열을 하나 차지해 버리므로, 두 레이아웃을 따로 그리고 CSS로 하나만 보여준다.
 * (display:none인 쪽은 접근성 트리에서도 빠진다)
 */
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
  const props = { chairs, profile, groups, diffOnly };

  return (
    <div className="rounded-data border border-data-line bg-data-surface">
      <div className="hidden md:block">
        <Table layout="desktop" {...props} />
      </div>
      <div className="md:hidden">
        <Table layout="mobile" {...props} />
      </div>
      {groups.length === 0 && (
        <p className="px-5 py-8 text-center text-muted">모든 항목이 같아요. 다른 모델을 담아 비교해 보세요.</p>
      )}
    </div>
  );
}

function Table({
  layout,
  chairs,
  profile,
  groups,
  diffOnly,
}: {
  layout: Layout;
  chairs: Chair[];
  profile: Profile | null;
  groups: CompareGroup[];
  diffOnly: boolean;
}) {
  const desktop = layout === "desktop";
  const emptySlots = COMPARE_MAX - chairs.length;
  const modelColumns = chairs.length + emptySlots;
  const columnCount = modelColumns + (desktop ? 1 : 0);
  const cellX = desktop ? "px-4" : "px-2";

  return (
    <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
      <caption className="sr-only">
        {chairs.map((chair) => chair.name).join(", ")} 사양 비교
        {diffOnly ? " (차이 나는 항목만)" : ""}
      </caption>
      <thead>
        <tr>
          {desktop && (
            <td className="sticky top-(--header-h) z-10 w-40 rounded-tl-data border-b border-data-line bg-data-surface lg:w-48" />
          )}
          {chairs.map((chair) => (
            <th
              key={chair.slug}
              scope="col"
              className={`sticky top-(--header-h) z-10 border-b border-data-line bg-data-surface py-3 text-left align-top font-normal ${cellX}`}
            >
              <ChairHeader chair={chair} />
            </th>
          ))}
          {Array.from({ length: emptySlots }, (_, index) => (
            <td
              key={`empty-${index}`}
              className={`sticky top-(--header-h) z-10 border-b border-data-line bg-data-surface py-3 align-top ${cellX}`}
            >
              <Link
                href="/chairs"
                className="grid aspect-square w-full place-items-center rounded-sm border border-dashed border-line text-center text-xs font-semibold text-primary hover:border-primary hover:bg-primary-subtle md:text-sm"
              >
                + 모델 추가
              </Link>
            </td>
          ))}
        </tr>
      </thead>

      {profile && (
        <tbody>
          <RowLabel layout={layout} modelColumns={modelColumns} label="나와의 적합도" />
          <tr>
            {desktop && <RowHeader label="나와의 적합도" />}
            {chairs.map((chair) => {
              const score = scoreChair(profile, chair);
              return (
                <td key={chair.slug} className={`border-b border-data-line pt-1 pb-4 align-top md:py-4 ${cellX}`}>
                  {!desktop && <span className="sr-only">나와의 적합도: </span>}
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
          <tr>
            <th
              scope="colgroup"
              colSpan={columnCount}
              className="border-b border-data-line bg-surface px-4 py-2 text-left text-xs font-semibold tracking-label text-muted-strong"
            >
              {group.title}
            </th>
          </tr>
          {group.rows.map((row) => (
            <RowView key={row.key} row={row} layout={layout} modelColumns={modelColumns} emptySlots={emptySlots} />
          ))}
        </tbody>
      ))}
    </table>
  );
}

function ChairHeader({ chair }: { chair: Chair }) {
  const { toggle } = useCompareToggle(chair.slug);
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
          onClick={toggle}
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
  return <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-clay-400" />;
}

/** 데스크톱 행 머리글 */
function RowHeader({ label, diff = false }: { label: string; diff?: boolean }) {
  return (
    <th scope="row" className="border-b border-data-line px-4 py-3 text-left align-top font-normal text-data-label">
      <span className="flex items-center gap-2">
        {diff && <DiffDot />}
        {label}
        {diff && <span className="sr-only"> (차이 있음)</span>}
      </span>
    </th>
  );
}

/** 모바일 라벨 줄. 스크린 리더는 각 셀 앞의 숨김 라벨로 읽으므로 이 줄은 숨긴다. */
function RowLabel({
  layout,
  modelColumns,
  label,
  diff = false,
}: {
  layout: Layout;
  modelColumns: number;
  label: string;
  diff?: boolean;
}) {
  if (layout === "desktop") return null;
  return (
    <tr aria-hidden="true">
      <td colSpan={modelColumns} className="px-2 pt-3 text-xs text-data-label">
        <span className="flex items-center gap-1.5">
          {diff && <DiffDot />}
          {label}
        </span>
      </td>
    </tr>
  );
}

function RowView({
  row,
  layout,
  modelColumns,
  emptySlots,
}: {
  row: CompareRow;
  layout: Layout;
  modelColumns: number;
  emptySlots: number;
}) {
  const desktop = layout === "desktop";
  const tone = row.diff ? "bg-paper-50" : "";
  return (
    <>
      <RowLabel layout={layout} modelColumns={modelColumns} label={row.label} diff={row.diff} />
      <tr className={tone}>
        {desktop && <RowHeader label={row.label} diff={row.diff} />}
        {row.values.map((value, index) => {
          const best = row.best.includes(index);
          return (
            <td
              key={index}
              className={`border-b border-data-line align-top ${desktop ? "px-4 py-3" : "px-2 pt-1 pb-3"}`}
            >
              {!desktop && (
                <span className="sr-only">
                  {row.label}
                  {row.diff ? " (차이 있음)" : ""}:{" "}
                </span>
              )}
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
