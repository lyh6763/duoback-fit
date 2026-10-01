import { recommendedSeatHeight } from "@/lib/fit/score";

const FLOOR_Y = 228;
const FOOT_X = 168;
/** px per mm */
const SCALE = 0.12;

/**
 * 키에 따라 크기가 변하는 앉은 자세 실루엣. 장식 요소이므로 같은 정보는 텍스트로 따로 제공한다.
 * 비율은 단순화한 인체 비율(대퇴 0.24H, 어깨까지 앉은키 0.35H, 머리 반지름 0.065H)이다.
 */
export function BodySilhouette({
  heightCm,
  showGuide = true,
  className = "",
}: {
  heightCm: number;
  showGuide?: boolean;
  className?: string;
}) {
  const h = heightCm * 10;
  const seat = recommendedSeatHeight(heightCm);
  const kneeY = FLOOR_Y - seat * SCALE;
  const hipX = FOOT_X - 0.24 * h * SCALE;
  const shoulderX = hipX + 6;
  const shoulderY = kneeY - 0.35 * h * SCALE;
  const headR = 0.065 * h * SCALE;
  const headY = shoulderY - headR - 0.02 * h * SCALE;

  return (
    <svg viewBox="0 0 240 240" aria-hidden="true" className={className}>
      <line x1="16" y1={FLOOR_Y} x2="224" y2={FLOOR_Y} className="stroke-line" strokeWidth="2" />

      {/* 의자 */}
      <g className="stroke-sand-300" strokeWidth="6" strokeLinecap="round" fill="none">
        <line x1={hipX - 12} y1={kneeY + 7} x2={FOOT_X - 30} y2={kneeY + 7} />
        <line x1={hipX - 14} y1={kneeY + 4} x2={hipX - 22} y2={shoulderY + 8} />
        <line x1={(hipX + FOOT_X) / 2 - 20} y1={kneeY + 10} x2={(hipX + FOOT_X) / 2 - 20} y2={FLOOR_Y} />
      </g>

      {showGuide && (
        <g>
          <line
            x1="16"
            y1={kneeY}
            x2="224"
            y2={kneeY}
            className="stroke-clay-400"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text x="222" y={kneeY - 6} textAnchor="end" className="fill-highlight text-[11px] font-semibold">
            {seat} mm
          </text>
        </g>
      )}

      {/* 사람 */}
      <g className="stroke-ink" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <polyline points={`${FOOT_X + 10},${FLOOR_Y - 2} ${FOOT_X},${FLOOR_Y - 2} ${FOOT_X},${kneeY} ${hipX},${kneeY}`} />
        <line x1={hipX} y1={kneeY} x2={shoulderX} y2={shoulderY} />
        <polyline points={`${shoulderX},${shoulderY + 4} ${shoulderX + 22},${shoulderY + 34} ${shoulderX + 46},${shoulderY + 30}`} />
      </g>
      <circle cx={shoulderX + 4} cy={headY} r={headR} className="fill-ink" />
    </svg>
  );
}
