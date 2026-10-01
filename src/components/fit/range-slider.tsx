"use client";

import { useId } from "react";

/** 네이티브 range 입력 + 미세 조정용 −/+ 버튼. 방향키·PageUp/Down은 브라우저 기본 동작을 쓴다. */
export function RangeSlider({
  label,
  value,
  min,
  max,
  unit,
  spokenUnit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  spokenUnit: string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-muted">
          {label}
        </label>
        <p className="text-2xl font-semibold tabular-nums">
          {value}
          <span className="ml-1 text-sm font-normal text-muted">{unit}</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <StepButton label={`${label} 1 줄이기`} onClick={() => set(value - 1)}>
          −
        </StepButton>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          aria-valuetext={`${value}${spokenUnit}`}
          onChange={(event) => set(Number(event.target.value))}
          className="h-6 flex-1 cursor-pointer accent-primary"
        />
        <StepButton label={`${label} 1 늘리기`} onClick={() => set(value + 1)}>
          +
        </StepButton>
      </div>
    </div>
  );
}

function StepButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-elevated text-lg font-semibold hover:border-stone-500"
    >
      {children}
    </button>
  );
}
