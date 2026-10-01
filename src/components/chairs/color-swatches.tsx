"use client";

import type { Chair } from "@/lib/chairs/schema";

/** 토글 버튼 그룹. 각 버튼이 Tab으로 닿으므로 방향키 처리가 필요 없다. */
export function ColorSwatches({
  colors,
  value,
  onChange,
  size = "m",
}: {
  colors: Chair["colors"];
  value: string;
  onChange: (slug: string) => void;
  size?: "s" | "m";
}) {
  const dot = size === "s" ? "size-5" : "size-7";
  return (
    <div role="group" aria-label="색상 선택" className="flex items-center gap-2">
      {colors.map((color) => {
        const selected = color.slug === value;
        return (
          <button
            key={color.slug}
            type="button"
            aria-pressed={selected}
            aria-label={color.name}
            title={color.name}
            onClick={() => onChange(color.slug)}
            className={`grid place-items-center rounded-full p-0.5 transition-shadow ${
              selected ? "ring-2 ring-ink" : "ring-1 ring-transparent hover:ring-line"
            }`}
          >
            <span className={`${dot} rounded-full border border-line`} style={{ backgroundColor: color.hex }} />
          </button>
        );
      })}
    </div>
  );
}
