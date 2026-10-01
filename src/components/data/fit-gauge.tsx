const SCALE = { min: 350, max: 560 } as const;
const TICKS = [350, 400, 450, 500, 550];

function toPercent(mm: number) {
  const clamped = Math.min(SCALE.max, Math.max(SCALE.min, mm));
  return ((clamped - SCALE.min) / (SCALE.max - SCALE.min)) * 100;
}

/**
 * 눈금 트랙 위에 의자의 좌판 조절 범위와 내 권장 높이를 함께 표시한다.
 * 마커 대비(clay-400 vs 흰 배경 3.1:1) 때문에 반드시 DataCard 안에서 쓴다.
 */
export function FitGauge({
  range,
  target,
  size = "l",
}: {
  range: { min: number; max: number };
  target: number;
  size?: "l" | "s";
}) {
  const fixed = range.min === range.max;
  const left = toPercent(range.min);
  const width = fixed ? 0 : toPercent(range.max) - left;
  const status = target < range.min ? "범위보다 낮음" : target > range.max ? "범위보다 높음" : "범위 안";
  const rangeText = fixed ? `${range.min}mm 고정` : `${range.min}~${range.max}mm`;
  const large = size === "l";

  return (
    <figure className={large ? "pt-8 pb-11" : "pt-6 pb-5"}>
      <figcaption className="sr-only">
        의자 좌판 높이 {rangeText}, 권장 높이 {target}mm, {status}
      </figcaption>
      <div aria-hidden="true" className="relative h-1.5 rounded-full bg-data-track">
        {TICKS.map((tick) => (
          <span
            key={tick}
            className="absolute top-3 h-1.5 w-px bg-data-tick"
            style={{ left: `${toPercent(tick)}%` }}
          />
        ))}
        {fixed ? (
          <span
            className="absolute -top-1 h-3.5 w-1.5 -translate-x-1/2 rounded-full bg-data-range"
            style={{ left: `${left}%` }}
          />
        ) : (
          <span
            className="absolute inset-y-0 rounded-full bg-data-range"
            style={{ left: `${left}%`, width: `${width}%` }}
          />
        )}
        <span
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-data-marker shadow-[0_0_0_1px_var(--color-ink-900)]"
          style={{ left: `${toPercent(target)}%` }}
        />
        <span
          className={`absolute bottom-4 -translate-x-1/2 font-semibold whitespace-nowrap tabular-nums text-highlight ${large ? "text-sm" : "text-xs"}`}
          style={{ left: `${toPercent(target)}%` }}
        >
          {target} mm
        </span>
        {large &&
          [400, 500].map((tick) => (
            <span
              key={tick}
              className="absolute top-6 -translate-x-1/2 text-xs tabular-nums text-data-label"
              style={{ left: `${toPercent(tick)}%` }}
            >
              {tick}
            </span>
          ))}
      </div>
    </figure>
  );
}
