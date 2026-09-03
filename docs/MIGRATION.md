# PLAY GROUND — Migration Guide

> `playground-design/`의 정적 HTML/CSS 목업을 Next.js(App Router) + TypeScript + Tailwind CSS +
> Supabase/Drizzle 구현으로 변환할 때 반복적으로 발생하는 판단을 줄이기 위한 기준 문서.
>
> 이 문서는 `docs/ARCHITECTURE.md`(디자인 분석 결과)와 `docs/DESIGN-SYSTEM.md`(디자인 토큰)를
> 기준으로 작성되었다. 실제 값이 필요할 때는 이 문서만 보지 말고 두 문서를 함께 참조한다.
>
> 이 문서 작성 시점 기준으로 `package.json`, Next.js 프로젝트, `src/` 등 실제 코드는 아직 존재하지
> 않는다. 아래 내용은 코드 작성 전 판단 기준이며, 이 문서 자체가 코드나 설정을 변경하지 않는다.
>
> **우선순위 원칙**: 이 문서와 실제 코드 상태 또는 `docs/TASKS.md`(특히 `CURRENT` 섹션)가 충돌하면
> 추측하지 않고 실제 코드와 `TASKS.md`를 따른다. 이 문서는 원칙과 매핑 기준을 제공할 뿐, 특정 시점의
> 작업 순서를 강제하지 않는다. `docs/TASKS.md`는 현재(이 문서 작성 시점) `CURRENT`에 실제 작업이
> 등록되어 있지 않고 템플릿만 있는 상태다 — 실제 작업을 시작하기 전 `TASKS.md`부터 확인한다.

---

## 1. Migration Strategy

페이지 전체를 한 번에 변환하지 않는다. **페이지 단위**로 아래 6단계를 순서대로 거친다.

```
1. HTML/CSS 원본 확인 (playground-design/*.html)
       ↓
2. JSX/TSX 변환 (구조만, 시각적 결과 동일 유지 — 2절)
       ↓
3. 공통 Component 추출 (재사용/독립 책임 있는 것만 — 4절)
       ↓
4. Tailwind 적용 (DESIGN-SYSTEM.md 토큰 기준 — 3절)
       ↓
5. Server/Client Boundary 결정 (기본은 Server — 7절)
       ↓
6. 실제 데이터 연결 (mock → Supabase/Drizzle — 8, 9절)
```

- 한 페이지가 4단계까지 끝나기 전에 다음 페이지로 넘어가지 않는다. 특히 3단계(공통 컴포넌트 추출)는
  최소 2개 페이지 이상에서 동일 패턴이 확인된 뒤에 진행한다 — 첫 페이지에서 성급하게 공통화하지 않는다.
- 5, 6단계는 인증/DB 스키마가 준비된 이후에만 진행 가능하므로, 그 전까지는 로컬 mock 데이터로 1~4단계만
  완료한 상태로 둘 수 있다([8절](#8-mock-data-migration) 참고).
- 각 단계 종료 시 [16. Visual Verification](#16-visual-verification)을 수행한다.

---

## 2. HTML → JSX/TSX Rules

기존 HTML 구조를 시각적 결과가 달라질 정도로 임의 변경하지 않는다. 태그 구조, 중첩 순서, 클래스
조합은 그대로 옮기고 문법만 JSX 규칙에 맞춘다.

| 항목 | 규칙 |
|---|---|
| `class` | `className`으로 변경. 값은 그대로 유지(3절에서 Tailwind로 치환하는 것은 별도 단계). |
| `for` | `<label for>` → `htmlFor`. |
| HTML 이벤트 핸들러 | `onclick="..."` 같은 인라인 핸들러는 없음(원본은 `addEventListener`로 분리되어 있음) → `<script>` 로직을 [6절](#6-vanilla-js--react-rules) 기준으로 React 이벤트(`onClick`, `onChange` 등)로 옮긴다. |
| Inline style | 원본에 `style="width:85%"`처럼 동적 수치(진행률 바 등)가 박혀 있는 경우만 `style={{ width: '85%' }}`로 유지한다. 정적 스타일(디자인 토큰으로 대체 가능한 값)은 Tailwind 클래스로 옮기고 인라인 `style`을 남기지 않는다. |
| Boolean attribute | `disabled`, `checked` 등은 JSX에서 `disabled`, `disabled={true}` 또는 조건부 표현식으로. 값 없는 HTML boolean attribute를 문자열로 옮기지 않는다. |
| SVG | 원본 인라인 `<svg>`를 그대로 JSX로 옮기되 속성만 camelCase로 변환(`stroke-width`→`strokeWidth`, `stroke-linecap`→`strokeLinecap`, `fill-rule`→`fillRule` 등). 로고처럼 10개 파일에 반복 등장하는 SVG는 [4절](#4-component-extraction-rules)에서 컴포넌트로 추출한다. |
| Semantic HTML | 원본이 이미 `<header>`, `<footer>`, `<nav>` 없이 `<div class="statusbar">` 형태로 되어 있는 부분은 임의로 semantic 태그로 바꾸지 않는다(시각적 결과와 무관하지만, "구조를 임의 변경하지 않는다"는 원칙에 따라 별도 작업으로 논의 후 결정). 단, 이미 원본에 있는 semantic 태그(`<footer>`, `attendance.html`의 여러 태그는 대부분 `<div>` 기반)는 그대로 유지한다. |
| Accessibility attribute | 원본에 `aria-label`(`modal-x` 닫기 버튼 등)이 있으면 그대로 유지. 원본에 없는 `aria-*`, `role`을 새로 추가하는 것은 이 변환 단계의 범위가 아니다 — 접근성 보강이 필요하면 별도 작업으로 사용자에게 보고한다(AGENTS.md "관련 없는 리팩터링 금지" 원칙). |
| 텍스트/구조 순서 | 원본의 DOM 순서, 텍스트 내용(한국어 라벨 포함)을 그대로 유지한다. |

---

## 3. CSS → Tailwind Rules

`docs/DESIGN-SYSTEM.md`에 기록된 실제 값만 기준으로 삼는다. 이 문서에 없는 값을 추측해서 새로 만들지
않는다.

| 항목 | 규칙 |
|---|---|
| CSS 변수 → Tailwind | `DESIGN-SYSTEM.md` 2.1절의 공통 변수(`--bg`, `--bg-panel`, `--bg-raised`, `--teal`, `--teal-dim`, `--amber`, `--amber-dim`, `--silk`, `--silk-dim`, `--silk-faint`, `--border`)는 `tailwind.config`의 `theme.extend.colors`로 등록한다. `--copper*`/`--via`(index.html 전용, 미사용 확인됨)는 즉시 이관하지 않고 실사용 여부를 먼저 재확인한다. |
| 반복 색상 | 변수화되지 않은 반복 hex(`#e2543f`, `#04231b`, `#157a5f`, `#4a9eff`)도 임의 이름으로 새로 만들지 말고, 실제 의미(danger, on-teal-text, avatar-gradient-end, doc-file)를 확인한 뒤 색상 토큰으로 등록할지 유틸리티에 하드코딩할지 결정한다. |
| Typography | `IBM Plex Sans KR`/`IBM Plex Mono`는 `next/font/google`로 로드 후 `theme.extend.fontFamily`에 등록. 폰트 크기는 Tailwind 기본 스케일에 맞는 것은 기본 유틸리티(`text-sm` 등)를 쓰고, `DESIGN-SYSTEM.md` 3절의 반소수점 값(11.5px, 12.5px 등)처럼 기본 스케일에 없는 값은 필요한 만큼만 arbitrary value(`text-[11.5px]`)로 표현한다. 임의로 반올림해서 값을 바꾸지 않는다. |
| Spacing | `1220px` 컨테이너와 `28px` 좌우 패딩처럼 반복 빈도가 높은 값은 `theme.extend.maxWidth`/`spacing` 커스텀 키로 먼저 등록. 그 외 값은 Tailwind 기본 spacing과 근접하면 기본 유틸리티를 사용하고, 정확히 일치하지 않으면 arbitrary value를 쓴다(임의 반올림 금지). |
| Radius | `DESIGN-SYSTEM.md` 5절의 실측값(4/5/7/8/9/10/12/14/16/24/999px)을 기준으로 한다. 8px(버튼)과 14px(카드)처럼 반복 빈도가 높은 값을 우선 토큰화한다. |
| Shadow | `DESIGN-SYSTEM.md` 7절에 기록된 shadow는 대부분 `index.html` 전용(3D 장식)이거나 카드 1~2곳에 한정된다. Tailwind `shadow-*` 기본 유틸리티로 시각적으로 동일하지 않다면 억지로 매핑하지 말고 arbitrary shadow(`shadow-[...]`) 또는 커스텀 CSS를 사용한다. |
| Breakpoint | 전 페이지 공통값은 `960px` 하나뿐이다([DESIGN-SYSTEM.md 9절](DESIGN-SYSTEM.md#9-responsive)). 이 값만 `theme.extend.screens`에 커스텀 키로 등록하는 것을 고려한다. 나머지 페이지별 breakpoint(860/700/640/560/900/800/760px 등)는 공통 스케일로 통합하지 말고 해당 컴포넌트에서 arbitrary variant(`max-[860px]:`)로 그대로 재현한다. |
| Transition | 원본에서 `transition` 속성이 명시적으로 선언된 곳(`folder-card`, `id-card`, index.html 모달)만 Tailwind `transition-*`으로 옮긴다. 원본에 transition이 없는 hover(즉시 색상 전환)에 임의로 `transition-colors`를 추가하지 않는다 — 없는 애니메이션을 새로 만드는 것도 "디자인 임의 변경"에 해당한다. |
| Animation | 단순 반복 애니메이션(`blink`처럼 opacity 토글)은 Tailwind `keyframes`/`animation` extend로 등록 가능. `index.html`의 `b3d-*` 계열처럼 다단 transform/여러 keyframe이 얽힌 장식은 Tailwind로 강제 변환하지 않는다([14절](#14-animation-migration) 참고). |
| Custom CSS가 필요한 경우 | 다음은 Tailwind utility로 무리하게 변환하지 않고 최소한의 CSS(컴포넌트 scoped CSS 또는 global CSS의 별도 블록)로 유지할 수 있다: `index.html`의 3D 배터리 히어로 전체, SVG QR 코드의 168칸 `<rect>` 마크업, 복합 `radial-gradient`/`conic` 배경. |

**모든 CSS를 Tailwind utility로 바꾸는 것이 목표가 아니다.** 목표는 `DESIGN-SYSTEM.md`에 기록된
실제 값을 시각적으로 동일하게 재현하는 것이다.

---

## 4. Component Extraction Rules

재사용성 또는 독립적인 책임이 있는 경우에만 분리한다. 모든 `<div>`를 컴포넌트로 쪼개지 않는다.

| Component | 추출 근거 | 비고 |
|---|---|---|
| **Global Layout** | 10개 파일 모두 `<style>`+`.statusbar`+`<main 영역>`+`<footer>` 골격이 동일 | `app/(dashboard)/layout.tsx` 후보. `about.html`은 statusbar 우측 구성이 달라 layout을 공유할지 별도로 결정 필요([5절](#5-page--feature-mapping) 참고) |
| **Navigation** | `.statusbar-nav`가 10개 파일에 반복, active 링크만 다름 | 현재 라우트 기준으로 active 상태를 계산하는 클라이언트 로직 필요(`usePathname`) → 이 부분만 Client Component |
| **StatusBar** | `.statusbar` 전체(로고+nav+아이콘+유저칩)가 반복 | `about.html`의 우측 영역(`share-chip`)은 variant로 처리하거나 별도 `PublicStatusBar`로 분리 — 임의로 통합하지 않는다 |
| **Footer** | 10개 파일 텍스트/구조 100% 동일 | 그대로 1개 컴포넌트로 추출 |
| **Button** | `.btn`/`.btn-primary`/`.btn-ghost`/`.btn-sm`/`.btn-done` 반복 | `index.html`의 `.btn`에 `border-radius`가 없는 차이는 임의로 통일하지 말고 [13절](#13-migration-safety-rules) 및 `DESIGN-SYSTEM.md` 13절 확인 후 사용자에게 보고 |
| **Modal** | 두 가지 패턴 공존(fade형 vs display-toggle형, `DESIGN-SYSTEM.md` 10.3절) | 하나의 `Modal` 컴포넌트로 즉시 통합하지 않는다. 통합 여부는 시각적 동작이 달라지는 결정이므로 별도 작업으로 사용자 확인 후 진행 |
| **Card** | `.card`/`.list-card`/`.side-card`/`.idea-card`/`.mtg-card`/`.id-card` — radius/배경/border는 공통이나 내부 구조는 페이지마다 다름 | 배경/border/radius만 공통 `Card` 셸로 추출하고, 내부 콘텐츠는 각 feature 컴포넌트가 children으로 채운다 |
| **Row** | `.att-row`/`.res-row`/`.file-row`/`.log-row`/`.action-row` — grid-template-columns가 페이지마다 다름 | 완전히 하나로 통합하지 않는다. "아바타/아이콘 + 본문 + 메타" 뼈대만 공통화하고 컬럼 폭은 각 feature에서 지정 |
| **UserChip** | `.user-chip` 마크업이 10개 파일 동일(이름 `김연구` 하드코딩 포함) | 컴포넌트화 시 이름/아바타를 props로 받도록 변경(하드코딩 제거는 [8절](#8-mock-data-migration) 대상) |
| **IconButton** | `.icon-btn`(34×34, 알림/캘린더 아이콘) | children으로 svg를 받는 wrapper로 추출 |
| **Badge** | `.badge-count`, `.log-tag`/`.idea-tag`/`.res-tag`, `.metric-chip`, `.action-due` | 색상 variant(default/teal/amber/red)가 있는 하나의 `Badge` 계열로 추출 가능하나, `action-due`의 3-state(default/soon/late)는 의미가 도메인 종속적이므로 `meetings` feature 전용 컴포넌트로 남기는 것도 가능 — 재사용 범위를 먼저 확인 |

컴포넌트화하지 않는 것: 페이지별로 1회만 등장하는 구조(`about.html`의 `.vm-grid`, `.timeline`,
`schedule.html`의 캘린더 그리드, `team.html`의 `.id-card` 내부 명함 레이아웃, `daily.html`의
`.checklist` 등)는 각 feature 폴더 안에 두고 전역 `components/`로 옮기지 않는다.

---

## 5. Page → Feature Mapping

`AGENTS.md`의 페이지 ↔ 테이블 매핑과 `ARCHITECTURE.md`/`DESIGN-SYSTEM.md`의 분석을 기준으로 한다.
실제 라우트 경로(`(dashboard)` 등 그룹명 포함)는 Next.js 초기화 시점에 확정하며, 여기서는 매핑 기준만
제시한다.

| HTML | 라우트(제안) | Feature 폴더(제안) | 관련 테이블(AGENTS.md 기준) | Global로 이동 | Feature에 남김 |
|---|---|---|---|---|---|
| `index.html` | `/` (홈 대시보드) | `features/home` | `attendance` | StatusBar, Footer, Button, Modal 셸 | QR 체크인 모달 콘텐츠, 3D 배터리 히어로, 콘솔 로그 위젯, 기능 목록(BOM) |
| `attendance.html` | `/attendance` | `features/attendance` | `attendance`, `presence` | StatusBar, Footer, Button, Card 셸, Row 셸 | QR 프레임, 체크인/체크아웃 액션, 출석 리스트 데이터 로직 |
| `schedule.html` | `/schedule` | `features/schedule` | `personal_events`, `fixed_schedules` | StatusBar, Footer, Button | 주간/월간 캘린더 그리드, 내 일정/팀 전체 필터, 사이드바 아젠다·고정시간표 카드 |
| `results.html` | `/results` | `features/results` | `achievements` | StatusBar, Footer, Button, Modal 셸, Card/Row 셸 | 실적 등록 폼 내용, 팀원별 등록 현황 바, 정렬/필터 |
| `daily.html` | `/daily` | `features/daily` | `daily_logs` | StatusBar, Footer, Button, Modal 셸, Card/Row 셸 | 체크리스트, streak 위젯, 팀 피드 날짜 네비게이션 |
| `ideas.html` | `/ideas` | `features/ideas` | `ideas`, `idea_comments`, `idea_reactions` | StatusBar, Footer, Button, Badge | 작성 composer, 리액션 버튼, 댓글 스레드, 태그 클라우드 |
| `meetings.html` | `/meetings` | `features/meetings` | `meeting_notes` | StatusBar, Footer, Button, Badge | 회의록 카드(안건/결정/액션아이템), 검색/필터바 |
| `files.html` | `/files` | `features/files` | `files` | StatusBar, Footer, Button, Row 셸 | 폴더 그리드, 파일 리스트, 용량 표시 — [11절](#11-storage-migration) 대상 |
| `about.html` | `/about` (공개) | `features/about` | `company_info` | Footer, Button | 전용 히어로/비전-미션/사업아이템/연혁/통계 — StatusBar는 `about.html` 전용 variant(`share-chip`) 사용 여부 결정 필요 |
| `team.html` | `/team` | `features/team` | `profiles` | StatusBar, Footer, Button, Card 셸 | 명함형 `.id-card`, 필터 칩 |

**공통 이동 기준**: 최소 2개 이상 페이지에서 마크업·스타일이 동일하게 반복되는 블록만 `components/`로
옮긴다([4절](#4-component-extraction-rules) 참고). 나머지는 각 `features/<name>/` 아래에 둔다.

---

## 6. Vanilla JS → React Rules

원본 `<script>`는 모두 순수 DOM 조작이며 전역 스코프에 `querySelector`/`addEventListener`로
작성되어 있다(10개 파일 중 `attendance.html`, `about.html`, `files.html`, `team.html` 일부 제외한
대부분에 인라인 `<script>` 존재). 변환 기준은 다음과 같다.

| 기존 패턴 | React 방식 | 등장 위치(예) |
|---|---|---|
| `classList.add('open')`/`remove('open')`로 모달 토글 | `useState<boolean>` + 조건부 className | index.html QR/출석현황 모달, results.html/daily.html 등록·기록 모달 |
| `checkinBtn.dataset.state` 값으로 버튼 텍스트/클래스 전환 | `useState<'pending'|'done'>` | index.html 체크인 버튼 |
| `document.querySelectorAll(...).forEach(...)`로 active 토글(뷰 전환, 필터 칩) | 배열 state(`activeFilter`)로 관리하고 각 버튼은 `activeFilter === value`로 조건부 스타일 | schedule.html view-toggle, ideas.html feed-toolbar, meetings.html filter-chip, team.html filter-chip |
| `renderFeed(index)`로 `innerHTML` 문자열 조립 | 데이터 배열(`FEED_DATA`)을 state/props로 두고 `.map()`으로 JSX 렌더 | daily.html 팀 피드 날짜 네비게이션 |
| `check-box` 클릭 시 `innerHTML` 교체 | 체크 항목 배열을 state로 두고 `done` 여부에 따라 아이콘 조건부 렌더 | daily.html 체크리스트 |
| `document.addEventListener('keydown', ...)`로 Escape 닫기 | `useEffect`에서 `window.addEventListener('keydown', ...)` 등록 후 cleanup에서 해제 | results.html 등록 모달 |
| `e.target === overlay`로 바깥 클릭 닫기 | 오버레이 `onClick`에서 `e.target === e.currentTarget` 검사 | index.html, results.html, daily.html 모달 |
| `input.addEventListener('change', ...)`로 파일명 표시 | controlled input + `onChange` 핸들러로 `useState`에 파일명 저장 | results.html 첨부파일 |
| `document.querySelector(...).scrollIntoView(...)` | DOM 노드가 실제로 필요하므로 `useRef` + `ref.current.scrollIntoView(...)` 유지 | daily.html 팀 피드 클릭 시 스크롤 |

**원칙**: DOM을 직접 조작하는 대부분의 코드는 state/조건부 렌더링으로 대체 가능하다. `scrollIntoView`,
포커스 이동처럼 **React state로 표현할 수 없는 명령형 DOM API만** `useRef`로 남긴다. "정말 필요한
경우"를 판단하기 전에 먼저 state로 표현 가능한지 확인한다.

---

## 7. Server / Client Component Rules

기본값은 **Server Component**다. 아래 조건 중 하나라도 해당하면 그 컴포넌트(또는 그 컴포넌트를 감싸는
최소 범위)에만 `'use client'`를 붙인다.

- `useState`/`useReducer` 사용
- `useEffect`/`useRef` 등 DOM/lifecycle 접근
- 사용자 이벤트 핸들러(`onClick`, `onChange` 등)가 실제로 상태를 바꾸는 경우
- Modal open/close, Calendar view/필터 토글 등 [6절](#6-vanilla-js--react-rules)에서 상태로 옮긴 상호작용
- React Query(`useQuery`/`useMutation`) 사용
- `window`, `document`, `localStorage` 등 브라우저 API 접근

**적용 예**: `results.html`을 변환한다면, 페이지 자체(`page.tsx`)와 정적 리스트(`.list-card`,
`.res-row`)는 Server Component로 유지하고, `.modal-overlay`(등록 폼)와 `.view-toggle`(주간/월간
전환)만 별도 Client Component로 분리한다. 페이지 전체에 `'use client'`를 붙이지 않는다.

불필요한 `use client`를 추가하지 않는다 — 정적으로 보이기만 하는 리스트/카드에 상호작용이 없다면
Server Component로 남긴다.

---

## 8. Mock Data Migration

기존 HTML의 하드코딩 데이터(팀원 이름, 출석 시간, 실적 목록 등)는 **디자인 원본**이다. 실제 데이터가
아니라 레이아웃/타이포그래피를 검증하기 위한 예시로 취급한다.

- 1~4단계(JSX/TSX, 컴포넌트 추출, Tailwind 적용) 진행 중에는 이 하드코딩 데이터를 **local
  constant 또는 props의 기본값**으로 그대로 사용해도 된다. 이 시점에는 디자인 재현이 목적이므로
  mock 데이터를 사용하는 것이 mock으로 실제 기능을 우회하는 것에 해당하지 않는다.
- 5~6단계(Server/Client 경계 확정 이후, 실제 기능 구현 단계)에서는 mock 데이터를 Supabase 조회
  결과로 교체한다. AGENTS.md 원칙(0.1절: "mock 데이터로 실제 구현 문제를 우회하지 않는다")에 따라
  **기능 구현이 완료된 이후에도 mock 데이터가 화면에 남아있으면 안 된다.**
  - 예외: 로딩/에러 상태를 보여주기 위한 스토리북/테스트 픽스처는 별개이며 이 규칙의 대상이 아니다.

---

## 9. Supabase / Drizzle Integration

UI 컴포넌트가 Supabase 클라이언트나 Drizzle을 직접 호출하지 않는다. 다음 계층 구조를 따른다.

```
UI (page.tsx / Client Component)
    ↓
Server Action 또는 Route Handler
    ↓
Feature Logic (유효성 검사, 권한 판단 등 도메인 규칙)
    ↓
Repository (테이블 단위 CRUD 함수)
    ↓
Drizzle
    ↓
Supabase PostgreSQL
```

- Client Component가 Repository나 Drizzle 스키마를 import하지 않는다 — 반드시 Server
  Action/Route Handler를 경유한다.
- `service_role` key는 Repository/Server Action 레이어(서버 사이드)에서만 사용한다(AGENTS.md
  5절, 11.1절).
- RLS가 적용된 테이블은 Repository 함수 작성 시 RLS 정책을 전제로 쿼리를 작성한다 — RLS를 우회하기
  위해 `service_role`을 클라이언트 접근 가능한 경로에 노출하는 구현을 만들지 않는다.
- 인증 확인은 Server Action/Route Handler 진입 시점에 수행하고, 클라이언트 측 조건부 렌더링만으로
  권한을 판단하지 않는다.

---

## 10. Authentication Migration

기존 정적 HTML에는 인증 개념이 없다(모든 페이지가 `김연구`로 로그인된 상태를 가정한 하드코딩). 실제
구현 단계에서 Supabase Auth를 연결하며, 페이지를 다음 기준으로 구분한다.

| 구분 | 페이지 |
|---|---|
| 공개 페이지 (비로그인 접근 가능) | `about` |
| 내부 페이지 (로그인 필요) | `attendance`, `schedule`, `results`, `daily`, `ideas`, `meetings`, `files`, `team` |

`index.html`(홈 대시보드)은 위 목록에 명시되어 있지 않다. 홈 화면은 개인 체크인 상태와 팀 출석 현황을
보여주므로 내부 페이지로 취급하는 것이 자연스러워 보이지만, **이 문서에서 임의로 확정하지 않는다.**
실제 라우트 그룹을 나눌 때 `docs/TASKS.md`의 해당 작업 항목에서 확인하거나 사용자에게 보고 후
결정한다.

- 위 표는 현재 요구사항 스냅샷이며, 실제 요구사항이 바뀌면 이 표보다 `docs/TASKS.md`를 우선한다.
- `company_info`(about 페이지 데이터)는 AGENTS.md 11.2절에 따라 공개 데이터와 내부 데이터를 분리
  저장하고, `anon` SELECT는 공개 데이터에만 허용한다.
- `profiles`(team 페이지 데이터)는 내부 연락처 등 민감 정보를 `anon`에 노출하지 않는다 — team
  페이지가 내부 페이지로 분류된 이유이기도 하다.

---

## 11. Storage Migration

`files.html`은 실제 Supabase Storage와 연결한다. **디자인(폴더 그리드, 파일 리스트, 용량 바
UI)은 그대로 유지**하고 데이터/파일 처리 로직만 교체한다.

- Storage bucket은 **private**으로 생성한다(AGENTS.md 11.4절).
- 다운로드 버튼(`.file-dl`)은 클릭 시 클라이언트가 직접 Storage URL을 조합하지 않는다 — Server
  Action/Route Handler가 요청자의 권한을 확인한 뒤 **만료 시간이 있는 signed/presigned URL**을
  발급하고, 클라이언트는 그 URL로만 다운로드한다.
- 업로드(`⇧ 파일 업로드` 버튼)는 서버 측에서 확장자 allowlist 검증, 파일 용량 제한, 실행 파일 차단을
  수행한다. 클라이언트 측 검증(예: `<input accept>`)만으로 대체하지 않는다.
- `.file-icon`의 pdf/doc/sheet/img 색상 구분(`DESIGN-SYSTEM.md` 13절)은 실제 업로드된 파일의
  MIME 타입/확장자를 기준으로 매핑한다 — 디자인에 있는 4종 외 확장자가 들어오는 경우의 기본
  아이콘/색상을 별도로 정의해야 한다(이 문서는 값을 추측하지 않으므로 실제 작업 시 결정).

---

## 12. QR Attendance Migration

`index.html`과 `attendance.html`의 QR UI(168칸 `<rect>` 기반 정적 QR 그래픽, 체크인 버튼, 상태
모달)는 **디자인을 그대로 유지**한다.

- 실제 체크인 로직은 AGENTS.md 11.3절을 따른다: **정적 QR 금지**, 시간 기반 토큰을 짧은 주기로
  재발급하고, 체크인 요청 시 서버에서 토큰 만료 여부와 중복 사용 여부를 검증한다.
- 현재 디자인의 QR 그래픽은 고정된 SVG 패턴이므로, 실제 구현에서는 이 SVG를 매 세션/주기마다 새
  토큰 값으로 다시 그리거나 QR 라이브러리로 대체해야 한다 — 다만 **시각적 스타일(프레임 크기,
  border, 배경)은 유지**하고 QR 내용만 동적으로 바뀐다.
- 체크인 확정(`▸ 체크인 완료`, `▸ 체크인` 버튼)은 클라이언트에서 성공 여부를 임의로 판단하지 않고,
  서버 응답(토큰 유효성 검증 결과)에 따라 상태를 갱신한다.
- 필요 시 연구실 내부 IP/Wi-Fi 확인을 보조 조건으로 추가하는 것은 AGENTS.md에 "검토"로만 명시되어
  있으므로, 이 문서에서 구현을 확정하지 않는다.

---

## 13. Responsive Migration

`docs/DESIGN-SYSTEM.md` 9절에 기록된 실제 breakpoint만 기준으로 삼는다.

- 공통 breakpoint는 **960px**(nav 숨김, 대부분의 2단 그리드 collapse) 하나뿐이다.
- `attendance.html`(860px), `schedule.html`(640px), `files.html`(700px/640px),
  `team.html`(560px), `about.html`(800/860/760px), `index.html`(900px/520px)의 보조
  breakpoint는 페이지마다 다르며, **하나의 공통 값으로 임의 통합하지 않는다.**
- 변환 후에는 각 페이지를 원본과 동일한 breakpoint에서 리사이즈하며 레이아웃이 같은 지점에서 같은
  방식으로 바뀌는지 확인한다([16절](#16-visual-verification) 참고).

---

## 14. Animation Migration

`index.html`의 3D 배터리 히어로 및 관련 keyframes(`blink`, `b3d-float`, `b3d-glow2-pulse`,
`b3d-floor-pulse`, `b3d-trace-flow`, `b3d-shine-sweep`, `b3d-shimmer`, `b3d-pulse`,
`b3d-ring-spin` — `DESIGN-SYSTEM.md` 10.2절)는 기능(체크인 로직)과 분리해서 순수 장식
컴포넌트로 옮긴다.

- 시각적 결과(속도, easing, 반복 여부)를 유지한다 — 임의로 더 화려하게 만들거나 단순화하지 않는다.
- Tailwind `animation`/`keyframes` extend로 표현 가능한 것은 그렇게 하되, 여러 요소가 서로 다른
  `animation-delay`로 얽혀 있는 구조(예: circuit trace 6개가 `-0.6s` 간격으로 순차 실행)처럼
  Tailwind 유틸리티 조합이 오히려 원본보다 읽기 어려워지는 경우 별도 CSS(컴포넌트 scoped
  `<style>` 또는 CSS Module)로 유지한다.
- 다른 9개 페이지에는 이런 수준의 애니메이션이 없다 — 새 페이지에 없던 애니메이션을 추가하지 않는다.
- 모달 open/close 애니메이션 차이(fade형 vs display-toggle형, [4절](#4-component-extraction-rules)
  Modal 항목)를 이 단계에서 임의로 통일하지 않는다.

---

## 15. Asset Migration

- 기존 SVG(아이콘, 로고, QR 패턴)를 우선 재사용한다. 새 아이콘 세트나 아이콘 라이브러리로 교체하지
  않는다.
- 반복 등장하는 SVG(로고 `pg-logo`, 체크마크, 파일 타입 아이콘 등)는 React 컴포넌트로 변환해
  props(`size`, `className` 등)를 받도록 만들 수 있다 — 다만 outline(`stroke-width`,
  `viewBox`) 자체는 `DESIGN-SYSTEM.md` 11절 값을 유지한다.
- 이미지를 임의로 교체하거나 없는 이미지에 placeholder를 새로 추가하지 않는다(원본에는 png/jpg
  이미지가 없음 — `DESIGN-SYSTEM.md` 2.3절/4절 참고).
- `playground-logo (1).svg`는 어떤 HTML에서도 참조되지 않는 것으로 확인되었다(`ARCHITECTURE.md`,
  `DESIGN-SYSTEM.md` 공통 확인 사항). 이 파일을 `public/`으로 옮기거나 `<Image>`/컴포넌트로
  사용하기 전에 **먼저 실제로 필요한지(디자이너가 별도 원본으로 보관 중인 파일인지, 인라인 SVG를
  대체할 의도인지) 확인**한다. 확인 없이 삭제하지도, 사용하지도 않는다. 파일명의 공백/괄호는
  실제로 import하기로 결정된 시점에만 정리한다.

---

## 16. Visual Verification

각 페이지를 변환한 뒤 원본 HTML(`playground-design/<name>.html`)을 브라우저로 열어 다음 항목을
나란히 비교한다. 디자인 변경 요구사항이 없는 한 기존 목업과 시각적으로 최대한 동일해야 한다.

- [ ] layout (그리드 컬럼 수/폭, 전체 페이지 폭)
- [ ] spacing (padding/margin/gap)
- [ ] typography (폰트, 크기, weight, line-height)
- [ ] colors (배경, 텍스트, accent)
- [ ] borders (두께, 색상, 위치)
- [ ] radius
- [ ] shadow
- [ ] icon (크기, stroke-width, 색상)
- [ ] responsive behavior (해당 페이지의 실제 breakpoint에서)
- [ ] hover/focus (원본에 있는 것만 — 없는 걸 새로 추가했는지도 확인)
- [ ] animation (원본에 있는 것만, 속도/반복까지)

차이가 발견되면 Tailwind 매핑 값을 조정하되, `DESIGN-SYSTEM.md`에 없는 새 값을 추측해서 채워
넣지 않는다 — 원본 HTML의 실제 computed 값을 다시 확인한다.

---

## 17. Migration Order

기본 변환 순서는 다음과 같다. **단, 실제 작업 우선순위는 `docs/TASKS.md`의 `CURRENT` 작업을
따른다.** 이 순서는 `CURRENT`가 비어 있을 때의 기본 제안일 뿐, 이미 다른 순서로 작업이
지정되어 있다면 그것을 따른다.

1. Project initialization
2. Global CSS / Design Tokens
3. Root Layout
4. StatusBar / Navigation / Footer
5. UI Components
6. Home (`index.html`)
7. Attendance
8. Schedule
9. Results
10. Daily
11. Ideas
12. Meetings
13. Files
14. About
15. Team
16. Supabase Auth
17. Database / Drizzle
18. Feature data integration
19. Storage
20. QR attendance

이 문서 작성 시점 기준 `docs/TASKS.md`의 `CURRENT`에는 실제 작업이 등록되어 있지 않다(템플릿만
존재). 실제 작업을 시작하기 전 `TASKS.md`를 먼저 갱신하고 그 내용을 우선한다.

---

## 18. Migration Safety Rules

변환 과정에서 다음을 금지한다(AGENTS.md 원칙과 동일선상).

- 기존 디자인 임의 변경
- 전체 코드 리팩터링
- 관련 없는 페이지 수정
- dependency 임의 추가
- DB schema 임의 변경
- 인증 우회
- RLS 우회
- mock data로 실제 기능 대체
- 테스트 삭제
- 오류 무시
- 필요 이상의 `use client`

문서/코드 상태가 이 문서와 다르면 추측하지 말고 실제 코드와 `docs/TASKS.md`를 우선한다.

---

## Migration Checklist

페이지 하나를 변환할 때마다 이 체크리스트를 복사해서 사용한다.

### 준비

- [ ] `docs/TASKS.md`의 `CURRENT` 확인 — 이 페이지가 실제로 지금 할 작업인지 확인
- [ ] 대상 HTML(`playground-design/<name>.html`) 재확인
- [ ] `docs/DESIGN-SYSTEM.md`에서 해당 페이지의 [13. Page-specific Tokens] 항목 확인

### 변환

- [ ] HTML → JSX/TSX 변환 (2절 규칙 적용, 구조 임의 변경 없음)
- [ ] 공통 컴포넌트 재사용 확인 (StatusBar/Footer/Button/Modal/Card/Row/UserChip/IconButton/Badge —
      이미 있으면 재사용, 없으면 이 페이지가 두 번째 등장인지 확인 후 추출)
- [ ] Tailwind 적용 (3절 규칙, `DESIGN-SYSTEM.md` 토큰 기준)
- [ ] Vanilla JS → React state/handler 변환 (6절 규칙)
- [ ] Server/Client 경계 결정 (7절 규칙, 최소 범위에만 `'use client'`)
- [ ] mock 데이터는 local constant로 임시 배치 (8절, 아직 DB 연동 전이면 정상)

### 검증

- [ ] Visual Verification 11개 항목 비교 (16절)
- [ ] Responsive: 해당 페이지의 실제 breakpoint에서 확인 (13절)
- [ ] Animation/hover/focus가 원본에 없는데 새로 생기지 않았는지 확인
- [ ] typecheck / lint / build 통과 (AGENTS.md 4절)

### 데이터 연동 단계(해당 시점에만)

- [ ] Repository/Server Action 경유 여부 확인 (UI가 Drizzle/Supabase 직접 호출 안 함)
- [ ] RLS 정책 전제로 쿼리 작성했는지 확인
- [ ] mock 데이터가 실제 데이터로 완전히 교체되었는지 확인 (남은 하드코딩 없음)
- [ ] (files 페이지) private bucket + presigned URL 적용 확인
- [ ] (attendance/index 페이지) QR 토큰이 서버에서 만료/중복 검증되는지 확인

### 완료

- [ ] `docs/TASKS.md` 상태 갱신 (`IN_PROGRESS` → `REVIEW` → `DONE`)
