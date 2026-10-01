# DUOBACK Fit — 리뉴얼 기획

기존 `duoback-react`(React SPA 쇼핑몰)를 다시 설계하는 포트폴리오 프로젝트의 기획 문서다.
구현 저장소 `duoback-fit`의 기획 문서다. 구현 중 바뀐 결정은 각 문서에 v0.2로 표시했다.

## 결정 사항 (2026-10-01)

| 항목 | 결정 |
|---|---|
| 방향 | 기술 스택 전환(Next.js + TypeScript, SSG, SEO) + 의자 도메인 특화 기능 |
| 핵심 기능 | Fit Finder(몸 정보 기반 추천), 비교, 매장 연결 |
| 커머스 범위 | 쇼룸형. 장바구니·결제 제외 |
| 디자인 | "Soft Ergonomics, Clear Data": 브랜드는 Soft Ergonomics, 데이터 표현은 Posture Clinic (확정) |
| 재사용 자산 | 상품 5종 데이터(수치 스펙으로 재설계), 스튜디오 이미지 40장 |

## 문서

1. [PRD](01-prd.md): 문제 정의, 타깃, 기능 정의, 매칭 로직, 데이터 모델, 기술 요구사항, 우선순위
2. [UX 플로우](02-ux-flow.md): 화면 목록(S01~S11, O01~O05), 플로우, 예외 흐름
3. [와이어프레임 구조](03-wireframes.md): 화면별 섹션·컴포넌트 배치 (Desktop 1920 / Mobile 390)
4. [UI 스펙](04-ui-spec.md): 디자인 토큰, Figma 네이밍, 컴포넌트·상태 정의

## 다음 단계

1. ~~기획 검토: 매칭 로직의 배점과 스펙 재보정 값 확정~~ (구현에 반영)
2. Figma: 토큰(Variables) → 핵심 컴포넌트(OptionCard, ChairCard, FitGauge) → S03, S04 화면부터
3. 저장소 생성: Next.js 프로젝트 초기화, 데이터 모델과 `scoreChair` 함수 + 테스트부터 구현
