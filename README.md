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
- **매장 안내:** 모델별 전시 매장 필터(`/stores?model=…`), Fit 결과 1순위 모델을 전시한 매장 표시,
  상세·결과 페이지에서 "전시 매장 N곳"으로 연결

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript |
| 렌더링 | 모든 페이지 정적 생성. 상품 상세는 `generateStaticParams` + `dynamicParams = false` |
| 스타일 | Tailwind CSS v4 — `@theme` 토큰이 디자인 스펙(`docs/04-ui-spec.md`)과 1:1 대응 |
| 데이터 | zod 스키마로 검증하는 정적 데이터 (`src/data/chairs.ts`) |
| 상태 | `useSyncExternalStore` 기반 Web Storage 스토어 (프로필: localStorage, 진행 중 답변: sessionStorage) |
| 테스트 | Vitest — 매칭 로직과 데이터 정합성 |
| SEO | 페이지별 메타데이터, canonical, JSON-LD `Product`, sitemap, robots |
| OG 이미지 | `next/og`로 사이트·상품별 1200×630 이미지를 빌드 시 정적 생성. 상품 이미지에 권장 키·좌판 높이 게이지 표시 |
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

### OG 이미지 폰트

OG 렌더러(Satori)는 woff2를 읽지 못해 otf가 필요한데, Pretendard 원본은 굵기당 약 1.5MB입니다.
`npm run fonts:og`가 KS X 1001 한글 2,350자 + ASCII만 남긴 서브셋(굵기당 약 350KB)을 `assets/fonts/`에 만듭니다.
서브셋에 없는 글자는 빈 칸으로 그려지므로, OG에 들어가는 문자열은 `src/lib/og/charset.test.ts`가 검사합니다.

사이트 주소는 `NEXT_PUBLIC_SITE_URL` → Vercel이 자동 제공하는 `VERCEL_PROJECT_PRODUCTION_URL` → `localhost` 순으로 정해집니다. 커스텀 도메인을 쓸 때만 `NEXT_PUBLIC_SITE_URL`을 설정하면 됩니다.
