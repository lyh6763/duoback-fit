# UI 스펙 — DUOBACK Fit (가칭)

> v0.2 · 2026-10-01 · 콘셉트 확정: **Soft Ergonomics(기본) + Posture Clinic(데이터 표현)**
> Figma Variables와 Tailwind v4 `@theme` 토큰이 1:1로 대응하도록 이름을 맞춘다.

---

## 0. 디자인 콘셉트: "Soft Ergonomics, Clear Data"

브랜드는 따뜻하게 말하고, 데이터는 정확하게 보여준다. 화면을 **두 개의 레이어**로 나눠 각 콘셉트가 맡을 역할을 정한다.

| | 브랜드 레이어 (Soft Ergonomics) | 데이터 레이어 (Posture Clinic) |
|---|---|---|
| 역할 | 감정, 신뢰, 브랜드 인상 | 근거, 비교, 판단 |
| 적용 위치 | 페이지 배경, 히어로, 질문 화면, 카피, 버튼, 일러스트 | Fit 결과, FitGauge, 점수 내역, 스펙 표, 비교표 |
| 배경 | 따뜻한 종이 톤 `paper-100`, 섹션 구분 `sand-200` | 흰색 데이터 카드 `white` + 헤어라인 보더 |
| 형태 | 큰 라운드(24~32), 알약형 버튼과 칩 | 작은 라운드(12), 직선, 눈금 |
| 숫자 | 대표 숫자 하나만 Fraunces 디스플레이 | 그 외 모든 숫자는 Pretendard 고정폭 숫자(`tabular-nums`) |
| 근거 표현 | 대화형 문장 ("허리를 잘 받쳐줘요") | 체크리스트 (✓ 요추 지지 조절) |
| 색 | moss(브랜드), clay(나를 표시하는 강조) | moss 단계 색(데이터), clay(내 위치 마커), 중립 눈금 |

### 레이어 규칙

1. 데이터는 항상 흰색 `DataCard` 안에 담는다. 따뜻한 배경 위에서 흰 카드가 "측정 결과"라는 맥락을 만든다. 흰 배경에서는 clay 마커가 비텍스트 대비 기준(3:1)을 통과한다는 기능상 이유도 있다.
2. 한 화면에 Fraunces 디스플레이 숫자는 **하나만** 쓴다(예: 결과 화면의 "455mm").
3. 데이터 레이어에는 일러스트와 장식 요소를 넣지 않는다.
4. 데이터 레이어의 색은 **moss 계열 하나**로 단계를 표현한다. 파란색 같은 새 색상을 들이지 않는다. 클리닉 콘셉트는 색이 아니라 구조(흰 카드, 눈금, 고정폭 숫자, 체크리스트)로 가져온다.

### 상징 요소
- **BodySilhouette** (브랜드 레이어): 사람 옆모습 라인 일러스트. 홈, Fit 시작, 키 입력 화면에 쓴다.
- **FitGauge** (데이터 레이어): 눈금이 있는 범위 바 위에 내 위치를 표시한다. 결과, 상세, 비교 화면에 쓴다.

---

## 1. 디자인 토큰

### Color — Primitive

```
--color-white:     #FFFFFF   /* 데이터 카드 */
--color-paper-50:  #FBF8F4
--color-paper-100: #F6F1EA   /* 기본 배경 */
--color-sand-200:  #E8DFD2   /* 섹션 배경, 게이지 트랙 */
--color-sand-300:  #D6CABA   /* 보더 */
--color-stone-400: #A39B90   /* 비활성, 장식 눈금 (텍스트 금지) */
--color-stone-500: #6B655D   /* 보조 텍스트 (밝은 배경) */
--color-stone-600: #5A554E   /* 보조 텍스트 (sand 배경) */
--color-ink-900:   #22201C   /* 본문 */

--color-moss-50:   #E6EFEB
--color-moss-100:  #C9DDD5
--color-moss-500:  #3E7465
--color-moss-600:  #2F5D50   /* 브랜드 메인 */
--color-moss-700:  #244A40

--color-clay-50:   #F8E9E1
--color-clay-400:  #D9774B   /* 내 위치 마커 (흰 배경 전용) */
--color-clay-700:  #A9502A   /* 강조 텍스트 */

--color-amber-50:  #FBF1DE
--color-amber-600: #B7791F   /* 주의 아이콘·보더 */
--color-amber-700: #8A5A12   /* 주의 텍스트 */
--color-red-600:   #B42318   /* 오류 */
```

### Color — Semantic (브랜드 레이어)

```
--color-bg-default:          {paper-100}
--color-bg-surface:          {sand-200}
--color-bg-elevated:         {paper-50}
--color-border-default:      {sand-300}
--color-text-default:        {ink-900}
--color-text-muted:          {stone-500}
--color-text-muted-on-surface: {stone-600}
--color-text-inverse:        {paper-50}
--color-interactive-default: {moss-600}
--color-interactive-hover:   {moss-700}
--color-interactive-subtle:  {moss-50}
--color-highlight-bg:        {clay-50}
--color-highlight-text:      {clay-700}
--color-focus-ring:          {moss-500}
```

### Color — Semantic (데이터 레이어)

```
--color-data-surface:        {white}
--color-data-border:         {sand-300}
--color-data-track:          {sand-200}    /* 게이지·막대 배경 */
--color-data-range:          {moss-600}    /* 의자 조절 범위, 채워진 막대 */
--color-data-range-soft:     {moss-100}    /* 비교표 보조 막대 (단독 사용 금지) */
--color-data-marker:         {clay-400}    /* 내 위치 */
--color-data-tick:           {stone-400}
--color-data-label:          {stone-500}
--color-data-value:          {ink-900}
--color-data-best:           {moss-700}    /* 비교표 최고값 */

--color-score-high:          {moss-600}    /* 적합도 85 이상 */
--color-score-mid:           {moss-700} on {moss-50}   /* 70~84 */
--color-score-low:           {stone-500}   /* 70 미만 */

--color-feedback-success:    {moss-600}
--color-feedback-warning:    {amber-700}   /* 텍스트 */
--color-feedback-warning-icon: {amber-600}
--color-feedback-warning-bg: {amber-50}
--color-feedback-error:      {red-600}
```

### 대비 확인 (WCAG 2.1 AA, 계산값)

| 조합 | 대비 | 판정 |
|---|---|---|
| ink-900 on paper-100 / white | 14.5 / 16.3 | ✅ |
| stone-500 on paper-100 / white | 5.1 / 5.8 | ✅ 본문 가능 |
| stone-600 on sand-200 | 5.6 | ✅ sand 배경의 보조 텍스트 (v0.1의 ⚠️ 해결) |
| moss-600 on white / paper-100 | 7.5 / 6.7 | ✅ |
| paper-50 on moss-600 (버튼, High 배지) | 7.1 | ✅ |
| moss-700 on moss-50 (Mid 배지, 선택 상태) | 8.4 | ✅ |
| clay-700 on white | 5.4 | ✅ |
| amber-700 on amber-50 (주의 노트) | 5.3 | ✅ |
| amber-600 on white | 3.6 | ⚠️ 아이콘·보더만 (텍스트 불가) |
| clay-400 on white (마커) | 3.1 | ✅ 비텍스트 3:1 통과 → **마커는 흰 데이터 카드 위에만** |
| moss-600 vs sand-200 (채운 막대 vs 트랙) | 5.7 | ✅ |
| moss-100, stone-400 on white | 1.6~2.8 | ❌ 장식·보조 전용. 정보를 이 색만으로 전달하지 않음 |

### Typography

```
--font-family-base:    Pretendard(사이트 글자 서브셋, optional), system-ui, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif
--font-family-display: "Fraunces", var(--font-family-base)
--font-feature-data:   "tnum" 1   /* font-variant-numeric: tabular-nums */

--font-size-xs:  12px    --font-size-xl:  22px
--font-size-sm:  14px    --font-size-2xl: 28px
--font-size-md:  16px    --font-size-3xl: 36px
--font-size-lg:  18px    --font-size-4xl: 48px
                         --font-size-5xl: 64px

--line-height-tight: 1.2
--line-height-snug:  1.35
--line-height-base:  1.6

--font-weight-regular:  400
--font-weight-medium:   500
--font-weight-semibold: 600
--font-weight-bold:     700

--letter-spacing-tight: -0.02em   /* 24px 이상 제목 */
--letter-spacing-label: 0.04em    /* Caption, 데이터 라벨 */
```

| 스타일 | 레이어 | Desktop | Mobile | 굵기 | 비고 |
|---|---|---|---|---|---|
| Display/Hero | 브랜드 | 5xl | 4xl | 500 | Fraunces. 화면당 1회 |
| Heading/H1 | 브랜드 | 4xl | 3xl | 700 | tight |
| Heading/H2 | 브랜드 | 3xl | 2xl | 700 | snug |
| Heading/H3 | 공통 | xl | lg | 600 | snug |
| Body/L · M · S | 공통 | lg · md · sm | md · md · sm | 400 | base |
| Caption | 공통 | xs | xs | 600 | label 자간 |
| Data/Value-L | 데이터 | 2xl | xl | 600 | tabular-nums (적합도 점수 등) |
| Data/Value | 데이터 | md | md | 500 | tabular-nums (스펙 값) |
| Data/Label | 데이터 | xs | xs | 500 | label 자간, `data-label` 색 |
| Data/Unit | 데이터 | xs | xs | 400 | 값 뒤 한 칸 띄움 ("455 mm") |

### Spacing

```
--space-1: 4px     --space-6: 24px
--space-2: 8px     --space-8: 32px
--space-3: 12px    --space-12: 48px
--space-4: 16px    --space-16: 64px
--space-5: 20px    --space-24: 96px
                   --space-32: 128px
```

### Radius

```
--radius-data: 12px    /* 데이터 레이어: DataCard, 표, 데이터 배지 */
--radius-sm:   8px     /* 입력 필드, 툴팁 */
--radius-md:   14px    /* OptionCard */
--radius-lg:   24px    /* 브랜드 카드, ChairCard 이미지 */
--radius-xl:   32px    /* 히어로 이미지, 바텀시트 상단 */
--radius-full: 9999px  /* 버튼, 칩 */
```

### Border · Shadow · Motion

```
--border-hairline: 1px solid {data-border}   /* 데이터 레이어는 그림자 대신 보더 */

--shadow-sm: 0 1px 2px rgba(34,32,28,0.06)
--shadow-md: 0 6px 20px rgba(34,32,28,0.08)   /* 브랜드 카드 hover */
--shadow-lg: 0 16px 40px rgba(34,32,28,0.12)  /* 트레이, 모달 */

--duration-fast: 120ms
--duration-base: 200ms
--duration-slow: 320ms
--duration-data: 600ms   /* 게이지·막대 채움 (결과 첫 진입 1회) */
--ease-standard: cubic-bezier(0.2, 0, 0, 1)
```

- `prefers-reduced-motion: reduce`이면 이동과 채움 애니메이션을 끄고 opacity 전환만 남긴다.
- 포커스 링: `2px solid --color-focus-ring`, offset 2px. 모든 인터랙티브 요소에 적용한다.

### Breakpoints

```
--breakpoint-md: 768px
--breakpoint-lg: 1024px   /* v0.2: Tailwind 기본값 사용. 2열 레이아웃 전환 지점 */
--breakpoint-xl: 1280px   /* 콘텐츠 최대 폭·좌우 마진 80px 적용 지점 */
```

---

## 2. Figma 네이밍 규칙

| 대상 | 규칙 | 예시 |
|---|---|---|
| 화면 | `[Device]/[ID]_[화면명]` | `Desktop/S04_FitResult`, `Mobile/S03_FitStep` |
| 화면 상태 | `[Device]/[ID]_[화면명]--[State]` | `Desktop/S04_FitResult--Empty` |
| 섹션 | `Section/[섹션명]` | `Section/TopMatch` |
| 컴포넌트 | `Component/[이름]/[Variant]--[State]` | `Component/Button/Primary--Hover` |
| 데이터 컴포넌트 | `Data/[이름]/[Variant]--[State]` | `Data/FitGauge/Default--BelowRange` |
| 오버레이 | `Overlay/[ID]_[이름]` | `Overlay/O01_CompareTray` |
| 아이콘 | `Icon/[카테고리]/[이름]` | `Icon/Action/Compare_Add` |
| 일러스트 | `Illust/[이름]` | `Illust/BodySilhouette` |
| 이미지 | `Asset/Chair/[slug]-[color]-[angle]` | `Asset/Chair/q1w-black-front` |
| Variables 컬렉션 | `Primitive` / `Brand` / `Data` / `Spacing` / `Radius` | 모드: `Light` (다크 모드는 범위 외) |

- 데이터 레이어 컴포넌트는 `Data/` 접두어로 묶어 레이어 규칙이 Figma 구조에서도 드러나게 한다.
- 상태 표기는 `Default / Hover / Pressed / Focused / Selected / Disabled / Loading / Empty / Error`로 통일한다.
- 코드 컴포넌트 이름과 Figma 컴포넌트 이름을 같게 한다(`FitGauge` ↔ `Data/FitGauge`).

---

## 3. 컴포넌트 정의

### 3-1. 브랜드 레이어

#### Button
- **Variants:** Primary / Secondary(보더) / Ghost(텍스트) · 크기 S(36) / M(44) / L(52)
- **States:** Default / Hover / Pressed / Focused / Disabled / Loading
- **Props:** `label`, `size`, `variant`, `iconLeft?`, `iconRight?`, `fullWidth?`
- **토큰:** bg `interactive-default`, text `text-inverse`, padding `space-3 space-6`, radius `full`
- 한 화면에 Primary는 1개만 쓴다.

#### OptionCard (Fit 답변)
- **Variants:** Single(라디오) / Multi(체크박스) · 아이콘 있음/없음
- **States:** Default / Hover / Focused / Selected / Disabled
- **Props:** `label`, `description?`, `icon?`, `selected`, `mode`
- **크기:** 전체 폭 × 최소 64, 터치 영역 48 이상
- **토큰:** Selected 시 border 2px `interactive-default`, bg `interactive-subtle`, text `moss-700`, radius `md`
- **접근성:** `role="radiogroup"` 또는 체크박스 그룹, 방향키 이동

#### RangeSlider
- **States:** Default / Dragging / Focused / Disabled
- **Props:** `label`, `min`, `max`, `step`, `value`, `unit`, `valueText`
- **구성:** 라벨 + 큰 값(Data/Value-L) + 트랙 + 썸(24) + −/+ 스테퍼 버튼
- **접근성:** `aria-valuetext="172센티미터"`, 방향키 ±1, PageUp/Down ±5

#### BodySilhouette
- **Props:** `heightCm`, `seatHeightMm?`, `variant: 'adult' | 'child'`
- **동작:** 키에 따라 실루엣 크기가 변하고, 권장 좌판 높이에 가이드선을 긋는다. `aria-hidden`이며, 같은 정보를 텍스트로 별도 제공한다.

#### ProgressBar (Fit)
- **Props:** `total=6`, `current`
- **구성:** 6칸 분할 바 + "2 / 6". 완료 칸 `interactive-default`, 미완료 `border-default`

#### ChairCard
- **Variants:** Grid / Result / Compact
- **States:** Default / Hover(이미지 1.03, shadow-md) / Focused / InCompare
- **Props:** `chair`, `match?: { score, reasons }`, `inCompare`, `onToggleCompare`
- **구성:** 이미지 1:1(radius lg) → ColorSwatch → 모델명(H3) → 권장 키 범위(Data/Label + Data/Value) → 가격 → ScoreBadge(이미지 좌상단) → 비교 토글(이미지 우상단)
- **주의:** 카드 전체를 링크로 감싸지 않는다. 링크는 이미지와 모델명에만 두고, 스와치와 비교 토글은 독립 버튼으로 둔다.
- 브랜드 레이어 카드이지만 **숫자 정보(권장 키, 가격)는 데이터 타이포**를 쓴다.

#### CautionNote
- **구성:** 주의 아이콘(`amber-600`) + 문장 ("키에 비해 좌판이 높아 발받침을 권장해요")
- **토큰:** bg `feedback-warning-bg`, text `feedback-warning`, 왼쪽 보더 3px `amber-600`(radius 0)

### 3-2. 데이터 레이어

#### DataCard
- **용도:** 모든 데이터 컴포넌트의 컨테이너
- **Variants:** Default / Inset(비교표 안쪽 셀처럼 보더만)
- **토큰:** bg `data-surface`, border `border-hairline`, radius `data`, padding `space-4 space-5`, 그림자 없음
- **헤더(선택):** Data/Label("체형 적합 분석") + 우측 보조 링크("계산 방식")

#### ScoreBadge (v0.1 MatchBadge 대체)
- **표기:** "적합도 92" (숫자는 Data/Value, 라벨은 Data/Label). `%`는 쓰지 않는다. 확률처럼 읽히지 않게 하기 위해서다.
- **Variants:** High(85 이상) / Mid(70~84) / Low(70 미만) · 크기 S(카드 위) / L(결과 화면)
- **토큰:** High는 bg `score-high` + text `text-inverse` / Mid는 bg `moss-50` + text `moss-700` / Low는 border `data-border` + text `stone-500`. radius `data`(알약형 아님)
- 색만으로 단계를 구분하지 않고 숫자를 함께 표기한다.

#### ReasonList (v0.1 ReasonChip 대체)
- **구성:** 체크리스트 행 최대 3개. 행마다 ✓ 아이콘(`moss-600`) + 항목명(Body/S) + 근거 값(Data/Value, 오른쪽 정렬)
  - 예: ✓ 좌판 높이 ··· 455 mm / 420–520
  - 예: ✓ 요추 지지 ··· 조절형
- **Variants:** Pass(✓) / Note(! 아이콘, `amber-600`, 주의 항목)
- 브랜드 레이어에서 한 줄 요약 문장("허리를 잘 받쳐주는 모델이에요")을 위에 붙일 수 있다.

#### FitGauge
- **용도:** S04 결과, S06 상세, S07 비교(축소형)
- **Props:** `rangeMin`, `rangeMax`, `target`, `scaleMin=350`, `scaleMax=560`, `size: 'l' | 's'`
- **구성**
  - 트랙: 높이 6, `data-track`, radius 3
  - 의자 조절 범위: 높이 6, `data-range`
  - 눈금: 50mm 간격 세로선(`data-tick`) + 100mm마다 라벨(Data/Label: 400, 500)
  - 내 위치 마커: 원 16, `data-marker`, 흰 테두리 3px. 위에 값 라벨("455 mm", Data/Value)
  - 범위 양 끝에 최소·최대 값 라벨
- **States:** InRange / BelowRange(마커가 범위 왼쪽 + 발받침 안내 연결) / AboveRange / Animating(결과 첫 진입 시 범위가 `duration-data`로 채워짐)
- **배치 규칙:** 반드시 DataCard 안(흰 배경)에 둔다. 마커 대비 확보를 위해서다.
- **접근성:** 텍스트 대체 "의자 조절 범위 420~520mm, 권장 높이 455mm, 범위 안"

#### ScoreBreakdown (신규)
- **용도:** S04 결과에서 적합도 점수의 구성을 공개한다. 추천 근거의 투명성을 보여주는 핵심 요소다.
- **구성:** 4행 막대 — 체형 적합 /40, 사용 패턴 /25, 불편 부위 /25, 예산 /10
  - 행: 항목명(Body/S) + 가로 막대(채움 `data-range`, 트랙 `data-track`, 높이 8, radius 4) + 점수 "36 / 40"(Data/Value)
  - 하단: 합계 "적합도 92" + 링크 "계산 방식 보기"
- **States:** Default / Collapsed(모바일에서 "점수 구성 보기"로 접힘)
- **접근성:** 시각적 막대 + 숫자 텍스트를 항상 함께 둔다(`<dl>` 구조)

#### SpecTable
- **용도:** S06 상세 사양
- **구조:** 그룹 헤더(Caption, `stone-600`, 배경 `bg-surface`) + 행(라벨 Body/S `stone-500` / 값 Data/Value 오른쪽 정렬)
- **몸 기준 해석:** 값 아래에 한 줄 보조 설명("키 158~198cm에 적합", Body/S `moss-700`)
- **토큰:** 행 구분선 `border-hairline`, 줄무늬 없음

#### CompareTable
- **행 Variants:** GroupHeader / Default / Diff(값이 서로 다름: 라벨 앞 점 표시 + 행 배경 `paper-50`) / Best(최고값: 값 굵기 600 + `data-best` + ▲ 아이콘)
- **Props:** `chairs: Chair[] (1~3)`, `profile?`, `diffOnly`
- **수치 행:** 값 아래 미니 막대(높이 4, `data-range-soft` 트랙 위 `data-range`)로 크기 비교를 돕는다(최대 하중, 등받이 높이 등)
- **프로필 행:** 맨 위 "적합도" 행에 ScoreBadge S + 축소형 FitGauge
- **구조:** 시맨틱 `<table>`, 모델 헤더 `<th scope="col">`, 라벨 `<th scope="row">`. 헤더 행은 스크롤 시 고정
- Best는 색과 함께 ▲ 아이콘과 굵기로도 구분한다.

### 3-3. 공통 · 오버레이

#### FilterPanel · FilterChip
- **FilterChip States:** Default / Hover / Selected / Disabled
- **FilterPanel:** Desktop은 sticky 좌측 패널, Mobile은 바텀시트(적용 / 초기화 고정)

#### CompareTray
- **States:** Hidden(0개) / Partial(1개: "하나 더 담아주세요") / Ready(2~3개) / Full(3개, 추가 시 흔들림 320ms)
- **Mobile:** 높이 80 압축 바(썸네일 + 비교하기). "비우기"는 비교 페이지에서 제공. *(v0.2: 접힘 칩 ↔ 바텀시트 대신 단순화)*

#### StoreCard
- **구성:** 매장명(H3), 주소, 영업시간, 전화(tel 링크), 전시 모델 썸네일
- **States:** Default / Highlighted(`?model` 필터에 해당)

#### GNB
- **States:** Solid / Mobile *(v0.2: 히어로 위 투명 상태는 구현하지 않고 항상 불투명 배경을 쓴다)*
- **구성:** 로고 / 의자 / 비교(개수 배지) / 매장 / 내 의자 찾기(Primary S)
- **Mobile (v0.2):** 메뉴가 4개로 늘어 375px에서 한 줄에 들어가지 않는다(콘텐츠 404px). 햄버거 메뉴 대신 두 줄로 나눈다 — 1행 로고 + 내 의자 찾기, 2행 의자·비교·매장 탭(높이 44). 헤더 높이는 `--header-h`(모바일 101 / md 64 / lg 72)로 관리하고, 헤더 아래 sticky 요소(비교표 머리글 등)가 이 값을 참조한다.
- **활성 메뉴:** `aria-current="page"` + 밑줄 2px

#### Toast · Dialog · BottomSheet
- **Toast:** `role="status"`, 4초 후 닫힘, 액션 링크 1개 허용
- **Dialog / BottomSheet:** 포커스 트랩, 열 때 첫 요소 포커스, 닫을 때 트리거로 포커스 복귀, Esc·배경 클릭으로 닫기

#### EmptyState
- **Variants:** NoMatch(S04) / NoResult(S05) / CompareEmpty(S07) / NotFound(S11)
- **구성:** 일러스트 + H3 + Body/M + 버튼 1~2개

---

## 4. 카피 톤 가이드

| | 브랜드 레이어 | 데이터 레이어 |
|---|---|---|
| 말투 | 대화형 해요체 | 명사형, 짧게 |
| 예시 | "하루에 얼마나 앉아 있나요?" / "허리를 잘 받쳐주는 모델이에요" | "좌판 높이" / "455 mm" / "적합도 92" |
| 숫자 | 문장 안에서는 최소화 | 숫자 + 단위(한 칸 띄움), 범위는 "420–520" |

**쓰지 않는 표현:** 진단, 치료, 교정, 통증 개선, 의학적. 클리닉 콘셉트의 표현 방식만 빌려오고, 의료 효과를 주장하는 것처럼 읽히는 말은 피한다. 대신 "분석", "적합도", "맞춤 추천"을 쓴다. Fit 결과 화면 하단에 "실제 착좌감은 매장에서 확인해 주세요"를 상시 표기한다.

---

## 5. 코드 토큰 대응표 (v0.2)

Tailwind v4는 `--color-*` 이름이 그대로 클래스가 되므로(`bg-{name}`), 시맨틱 토큰은 클래스에서 읽기 좋은 짧은 이름으로 옮겼다. 값과 의미는 1장과 같다. 정의 위치: `src/app/globals.css`

| 스펙 토큰 | 코드 토큰 | 클래스 예 |
|---|---|---|
| `color-bg-default` | `--color-canvas` | `bg-canvas` |
| `color-bg-surface` | `--color-surface` | `bg-surface` |
| `color-bg-elevated` | `--color-elevated` | `bg-elevated` |
| `color-border-default` | `--color-line` | `border-line` |
| `color-text-default` | `--color-ink` | `text-ink` |
| `color-text-muted` | `--color-muted` | `text-muted` |
| `color-text-muted-on-surface` | `--color-muted-strong` | `text-muted-strong` |
| `color-text-inverse` | `--color-inverse` | `text-inverse` |
| `color-interactive-default` / `-hover` / `-subtle` | `--color-primary` / `-hover` / `-subtle` | `bg-primary` |
| `color-highlight-bg` / `-text` | `--color-highlight-bg` / `--color-highlight` | `text-highlight` |
| `color-focus-ring` | `--color-focus` | 전역 `:focus-visible` |
| `color-data-*` | 같은 이름 (`data-border` → `data-line`) | `bg-data-surface` |
| `color-feedback-warning` / `-icon` / `-bg` | `--color-warning` / `-icon` / `-bg` | `text-warning` |
| `color-feedback-error` | `--color-error` | `text-error` |
| (신규) | `--color-photo` `#F7F3F0` | `bg-photo` |

- **`--color-photo` (신규):** 스튜디오 사진 배경의 평균색(모서리 픽셀 샘플링 결과 `#F2EEEB`~`#FBF7F4`). 사진 컨테이너에 깔아 흰 카드 안에서 사진 경계가 박스처럼 드러나지 않게 한다.
- Tailwind 기본 팔레트는 `--color-*: initial`로 지워, 스펙에 없는 색을 쓸 수 없게 했다.
- 간격은 Tailwind 기본 스케일(4px 단위)이 스펙의 `--space-*`와 같아 그대로 쓴다(`p-4` = `--space-4` = 16px).
