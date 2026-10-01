# DUOBACK Fit

키와 체중, 앉는 습관을 알려주면 내 몸에 맞는 의자와 **그 이유**를 보여주는 의자 쇼룸 사이트입니다.
기존 React SPA 쇼핑몰 프로젝트(duoback-react)를 기획부터 다시 설계한 포트폴리오 프로젝트입니다.

> 제품 정보와 스펙은 포트폴리오용 가상 데이터이며 실제 브랜드·제품과 관련이 없습니다.

## 풀려는 문제

"좌판 높이 450~550mm, 4D 팔걸이, 최대 하중 120kg" 같은 스펙은 의자 기준으로 쓰여 있어서,
사용자는 이 숫자가 **내 몸에 맞는지** 판단할 수 없습니다. DUOBACK Fit은 몸 정보를 받아 권장 좌판 높이를 계산하고,
모델마다 적합도와 근거를 공개합니다.

## 주요 기능

- **Fit Finder:** 질문 6개 → 권장 좌판 높이 계산 → 모델별 적합도(100점)와 근거 체크리스트
- **점수 구성 공개:** 체형 40 · 사용 패턴 25 · 불편 부위 25 · 예산 10. 계산식은 `/fit/method`에 공개
- **몸 기준 스펙:** "좌판 420–520mm" 옆에 "키 158~198cm에 적합"처럼 사람 기준 해석을 함께 표기
- **의자 목록·상세:** URL과 동기화되는 필터·정렬, 색상 × 각도 갤러리, 저장된 프로필 기반 "나와의 핏"
- **비교:** 최대 3개 모델을 나란히 비교. 차이 나는 항목과 가장 유리한 값 표시, "차이 나는 항목만" 보기,
  `/compare?m=…` 공유 링크, 하단 비교 트레이, 되돌리기가 있는 토스트

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript |
| 렌더링 | 모든 페이지 정적 생성. 상품 상세는 `generateStaticParams` + `dynamicParams = false` |
| 스타일 | Tailwind CSS v4 — `@theme` 토큰이 디자인 스펙(`docs/04-ui-spec.md`)과 1:1 대응 |
| 데이터 | zod 스키마로 검증하는 정적 데이터 (`src/data/chairs.ts`) |
| 상태 | `useSyncExternalStore` 기반 Web Storage 스토어 (프로필: localStorage, 진행 중 답변: sessionStorage) |
| 테스트 | Vitest — 매칭 로직과 데이터 정합성 |
| SEO | 페이지별 메타데이터, canonical, OG 이미지, JSON-LD `Product`, sitemap, robots |
| CI | GitHub Actions: lint → typecheck → test → build |

## 구조

```text
src/
  app/                 라우트 (/, /chairs, /chairs/[slug], /fit, /fit/result, /fit/method)
  components/
    brand/             브랜드 레이어 (BodySilhouette, CautionNote)
    data/              데이터 레이어 (DataCard, FitGauge, ScoreBadge, ReasonList, ScoreBreakdown)
    chairs/  fit/  site/  ui/
  data/chairs.ts       의자 데이터 (+ 정합성 테스트)
  lib/
    chairs/            스키마, 라벨, 파생 값
    fit/               프로필 스키마, 적합도 계산(score.ts + 테스트), 스토어
docs/                  기획 문서 (PRD, UX 플로우, 와이어프레임, UI 스펙)
```

## 실행

```bash
npm install
npm run dev
```

```bash
npm run lint        # ESLint
npm run typecheck   # 라우트 타입 생성 + tsc
npm test            # Vitest
npm run build       # 프로덕션 빌드
```

배포 시 `NEXT_PUBLIC_SITE_URL`을 설정하면 sitemap, robots, OG 이미지 URL이 해당 도메인으로 생성됩니다.
