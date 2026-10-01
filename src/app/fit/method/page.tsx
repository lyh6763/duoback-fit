import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { SCORE_MAX, SEAT_TOLERANCE_MM } from "@/lib/fit/score";

export const metadata: Metadata = {
  title: "Fit 계산 방식",
  description: "DUOBACK Fit이 적합도를 계산하는 방식과 그 한계를 공개합니다.",
};

const SCORE_ROWS = [
  {
    label: "체형 적합",
    max: SCORE_MAX.body,
    rule: `권장 좌판 높이가 의자 조절 범위 ±${SEAT_TOLERANCE_MM}mm 안이면 만점. 벗어나면 좌판이 높을 때 1mm당 0.5점, 낮을 때 1mm당 1점을 뺍니다. 체중이 최대 하중의 85%를 넘으면 5점을 뺍니다.`,
  },
  {
    label: "사용 패턴",
    max: SCORE_MAX.usage,
    rule: "용도와 의자 종류가 맞는지(10점), 앉는 시간이 길수록 팔걸이·메쉬·헤드레스트·틸팅 기능을 더 중요하게 반영합니다(15점).",
  },
  {
    label: "불편 부위",
    max: SCORE_MAX.concern,
    rule: "허리는 요추 지지, 목·어깨는 헤드레스트와 팔걸이, 엉덩이·허벅지는 좌판 깊이 조절, 더위는 메쉬 소재로 평가합니다.",
  },
  {
    label: "예산",
    max: SCORE_MAX.budget,
    rule: "예산 안이면 만점. 넘으면 10만 원마다 5점을 빼고, 결과에서 제외하지는 않습니다.",
  },
];

export default function FitMethodPage() {
  return (
    <article className="page-container">
      <div className="mx-auto max-w-3xl space-y-12 py-12 md:py-16">
        <header className="space-y-4">
          <p className="text-xs font-semibold tracking-label text-primary">FIT METHOD</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">적합도는 이렇게 계산해요</h1>
          <p className="leading-relaxed text-muted">
            추천 이유를 숨기지 않기 위해 계산식과 배점을 모두 공개합니다. 같은 답변이면 언제나 같은 결과가 나와요.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">1. 권장 좌판 높이</h2>
          <div className="rounded-data border border-data-line bg-data-surface px-5 py-6 text-center">
            <p className="font-display text-2xl md:text-3xl">키(cm) × 2.5 + 25 = 좌판 높이(mm)</p>
            <p className="mt-2 text-sm text-data-label">예: 키 172cm → 455mm</p>
          </div>
          <p className="leading-relaxed text-muted">
            앉았을 때 오금(무릎 뒤)에서 바닥까지의 높이는 키의 약 25%예요. 여기에 신발 두께 25mm를 더했어요.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">2. 점수 구성 (100점)</h2>
          <dl className="divide-y divide-data-line overflow-hidden rounded-data border border-data-line bg-data-surface">
            {SCORE_ROWS.map((row) => (
              <div key={row.label} className="grid gap-2 px-5 py-4 md:grid-cols-[8rem_1fr]">
                <dt className="font-semibold">
                  {row.label} <span className="font-normal tabular-nums text-data-label">/ {row.max}</span>
                </dt>
                <dd className="text-sm leading-relaxed text-muted">{row.rule}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-muted">체중이 최대 하중을 넘는 모델은 점수를 매기지 않고 결과에서 제외해요.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">3. 한계</h2>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted">
            <li>키만으로 다리 길이를 추정하는 단순화한 근사식이에요. 실제 인체 치수는 사람마다 다릅니다.</li>
            <li>책상 높이, 모니터 위치처럼 의자 밖의 환경은 반영하지 않아요.</li>
            <li>적합도는 의학적 판단이 아니에요. 통증이 있다면 전문가와 상담해 주세요.</li>
            <li>제품 스펙은 포트폴리오용 가상 데이터예요.</li>
          </ul>
        </section>

        <Link href="/fit" className={buttonClass({ size: "l" })}>
          내 의자 찾기
        </Link>
      </div>
    </article>
  );
}
