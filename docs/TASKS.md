# PLAY GROUND — Task Tracker

> AI 코딩 에이전트가 현재 작업 상태를 빠르게 파악하기 위한 작업 추적 문서.
>
> 완료된 작업의 상세 구현 내용은 이 문서에 장황하게 기록하지 않는다.
> 필요한 경우 Git history 또는 관련 문서를 확인한다.

---

## Status

| 상태            | 의미             |
| ------------- | -------------- |
| `TODO`        | 작업 예정          |
| `IN_PROGRESS` | 현재 작업 중        |
| `BLOCKED`     | 외부 문제 또는 결정 필요 |
| `REVIEW`      | 구현 완료, 검토 필요   |
| `DONE`        | 구현 및 검증 완료     |

---

# CURRENT

> 현재 진행 중인 작업은 원칙적으로 하나만 둔다.

## TASK-005 — Home 페이지(index.html) Next.js 변환

**Status:** `DONE`

### Goal

`playground-design/index.html`의 Home 화면을 Next.js App Router의 `/` 페이지로 변환한다.

기존 HTML 목업의 시각적 결과와 구조를 최대한 유지하면서 React/TypeScript + Tailwind CSS 기반으로 이식한다.

### Scope

대상 원본은 오직 다음 파일이다.

* `playground-design/index.html`

대상 Next.js 페이지:

* `src/app/page.tsx`

필요한 경우 Home 전용 Component를 `src/components/` 또는 적절한 feature 영역에 최소 범위로 생성할 수 있다.

변환 대상:

* Home 화면 전체 레이아웃
* Hero 영역
* 기존 3D 배터리 장식 그래픽
* 출석 체크 영역
* 오늘 출석 현황
* 기능 목록/BOM 영역
* 기존 Footer/StatusBar와의 연결
* 원본에 존재하는 Home 전용 UI

### Constraints

* `playground-design/index.html` 수정 금지
* 다른 HTML 페이지 변환 금지
* 기존 디자인 재해석 금지
* 디자인 개선 금지
* 색상 임의 변경 금지
* spacing 임의 변경 금지
* typography 임의 변경 금지
* radius 임의 변경 금지
* breakpoint 임의 변경 금지
* 원본에 없는 UI 추가 금지
* 원본의 UI를 임의로 삭제하지 않는다.
* TASK-003에서 생성한 공통 Component를 재사용한다.
* StatusBar/Footer를 새로 만들지 않는다.
* 기존 Navigation 구조를 수정하지 않는다.
* Supabase 연결 금지
* Drizzle 연결 금지
* Auth 연결 금지
* React Query 연결 금지
* API 작성 금지
* DB schema 작성 금지
* 실제 출석 데이터 연결 금지
* mock 데이터를 DB처럼 구현하지 않는다.
* 새로운 dependency 추가 금지
* 불필요한 `use client` 사용 금지

### Important

`index.html`의 기존 정적 목업 데이터는 화면 표현을 위해 필요한 경우 최소한으로 유지할 수 있다.

단, 이를 실제 데이터 모델이나 DB 구조로 확장하지 않는다.

출석 체크 등의 interaction이 원본에 존재한다면 이번 TASK에서는 UI/interaction 구조를 React로 변환하되 실제 서버 검증이나 Supabase 연결은 하지 않는다.

QR 토큰 생성/검증 로직은 구현하지 않는다.

### Design Preservation

반드시 `docs/DESIGN-SYSTEM.md`의 실제 측정값을 기준으로 한다.

특히:

* `--bg`
* `--bg-panel`
* `--bg-raised`
* `--teal`
* `--amber`
* `--silk`
* `--silk-dim`
* `--silk-faint`
* `--border`

등 기존 디자인 토큰을 사용한다.

index.html 전용 값도 원본에 실제로 존재하는 경우 유지한다.

특히 index.html의 3D 장식 및 animation은 임의로 단순화하거나 삭제하지 않는다.

### Componentization

기존 TASK-003 공통 Component:

* StatusBar
* Navigation
* Footer
* UserChip
* IconButton

을 재사용한다.

Home 전용 Component가 필요하다면 실제 `index.html`의 구조를 기준으로 최소 단위만 추출한다.

과도한 abstraction은 하지 않는다.

### Server / Client Boundary

기본적으로 Server Component를 유지한다.

원본 interaction 때문에 React state/event handler가 필요한 영역만 별도 Client Component로 분리한다.

가능하면:

```text
page.tsx
├── Server Components
└── 필요한 interactive Client Components
```

구조를 사용한다.

페이지 전체에 무조건 `use client`를 붙이지 않는다.

### Tailwind Migration

기존 `<style>`의 값을 `docs/DESIGN-SYSTEM.md` 기준으로 Tailwind utility로 변환한다.

단, 다음과 같은 경우는 커스텀 CSS를 허용한다.

* index.html 전용 3D 배터리 그래픽
* 복잡한 keyframes
* Tailwind utility로 표현하면 원본과 달라지는 animation
* 원본의 복잡한 pseudo-element 구조

이 경우에도 새 디자인을 만들지 않고 원본 CSS 값을 그대로 옮긴다.

### Verification

다음 검증을 수행한다.

```bash
npm run lint
npx tsc --noEmit
npm run build
```

가능하면 production build 후 `/`를 실제로 렌더링하여 확인한다.

다음 항목을 원본 `index.html`과 비교한다.

* StatusBar
* Hero
* 3D 배터리 그래픽
* 출석 체크 UI
* 출석 현황
* BOM/기능 목록
* Footer
* typography
* colors
* spacing
* radius
* responsive behavior
* animation

### Notes

이번 TASK는 **Home 한 페이지의 디자인 이식**이다.

다른 페이지의 변환은 별도 TASK에서 수행한다.

이번 TASK에서는 실제 Supabase/DB/Auth 연동을 하지 않는다.

TASK-005를 BACKLOG에만 등록하고 아직 실행하지 않는다.

---

## TASK-006 — Attendance page Next.js conversion

**Status:** `DONE`

### Goal

`playground-design/attendance.html`의 정적 UI와 기존 브라우저 인터랙션을 Next.js App Router + TypeScript 구조로 변환한다.

### Scope

변경 허용:

* `playground-design/attendance.html`
* `src/app/attendance/page.tsx`
* 필요할 경우 `src/components/attendance/*`
* 필요할 경우 Attendance 전용 CSS Module
* `docs/TASKS.md`의 TASK-006 상태

그 외 파일은 수정하지 않는다.

### Constraints

* `attendance.html`을 디자인의 단일 기준으로 사용하고 layout/spacing/width·height/typography/color/border/radius/icon/table·row 구조/modal 구조/breakpoint/hover·active 상태를 임의로 변경하지 않는다.
* 새로운 UI를 추가하지 않는다.
* Root Layout에서 이미 제공되는 StatusBar/Navigation/Footer를 재사용하고 다시 구현하지 않는다.
* 단순한 원본 전용 요소 때문에 불필요한 공통 컴포넌트를 새로 만들지 않는다.
* `<script>`가 있다면 동작을 확인하고 React state 등으로 최소한만 변환한다. `querySelector`/`classList`/`innerHTML` 등 DOM 직접 조작 방식을 쓰지 않는다.
* Supabase/Auth/DB query/Drizzle/실제 출석 저장/실제 QR token 검증/API Route/Server Action/React Query/mock API/가짜 DB 데이터를 구현하지 않는다.
* 기본적으로 Server Component를 유지하고, 실제 브라우저 상태가 필요한 부분만 Client Component로 분리한다. 페이지 전체를 무조건 `"use client"`로 만들지 않는다.
* 단순한 스타일은 Tailwind로 변환하고, 원본의 복잡한 CSS나 정확한 시각적 재현이 어려운 부분만 Attendance 전용 CSS Module을 허용한다. `globals.css`는 수정하지 않고 기존 디자인 토큰을 임의로 새로 만들지 않는다.
* 반복되는 정적 UI는 배열 + map으로 표현할 수 있으나, 단순히 코드를 추상화하기 위한 불필요한 데이터 계층/컴포넌트 추상화는 만들지 않는다.
* 원본에 존재하는 aria-label 등은 유지하고, 새로운 접근성 구조를 이유로 DOM 구조나 시각적 디자인을 변경하지 않는다.

### Related Files

* `playground-design/attendance.html`
* `src/app/attendance/page.tsx`
* `src/components/attendance/*`(필요 시)
* `docs/DESIGN-SYSTEM.md`
* `docs/MIGRATION.md`

### Requirements

* [ ] `attendance.html`을 처음부터 끝까지 읽고 실제 구조/스타일/스크립트를 확인한다.
* [ ] `/attendance` 페이지가 원본과 시각적으로 동일하게 렌더링된다.
* [ ] 원본 인터랙션(있는 경우)이 React 방식으로 정확히 재현된다.

### Verification

* [ ] `npm run lint`
* [ ] `npx tsc --noEmit`
* [ ] `npm run build`
* [ ] 가능하면 production build 기준 `/attendance` 렌더링 확인

### Notes

구현 및 검증 완료 후 `REVIEW`로 변경한다. `DONE`으로는 변경하지 않는다.

---

## TASK-007 — Schedule page Next.js conversion

**Status:** `DONE`

### Goal

`playground-design/schedule.html`의 정적 UI와 원본에 존재하는 브라우저 인터랙션을 Next.js App Router + TypeScript 구조로 변환한다.

### Scope

변경 허용: `playground-design/schedule.html`(읽기 전용), `src/app/schedule/page.tsx`, 필요할 경우 `src/components/schedule/*`, 필요할 경우 Schedule 전용 CSS Module, `docs/TASKS.md`의 TASK-007 상태. 그 외 파일은 수정하지 않는다.

### Constraints

* `schedule.html`의 layout/grid·flex 구조/spacing/width·height/typography/color/border/radius/icon/calendar 구조/schedule row·card/modal/hover·active 상태/breakpoint를 임의로 변경하지 않는다.
* 원본에 없는 UI를 추가하지 않는다.
* Root Layout의 StatusBar/Navigation/Footer를 재사용하고 다시 구현하지 않는다.
* `<script>`가 있으면 처음부터 끝까지 확인하고 React state로 최소 변환한다. `querySelector`/`classList`/`innerHTML` 등 DOM 직접 조작을 쓰지 않는다. 단, 원본에 script가 없거나 특정 UI가 실제로 정적이면 억지로 Client Component를 만들지 않는다.
* Supabase/Auth/Drizzle/DB query/API Route/Server Action/React Query/실제 일정 저장·수정·삭제/실제 사용자 데이터/mock API/가짜 backend를 구현하지 않는다.
* 가능하면 Server Component를 유지하고, 실제 브라우저 상태가 필요한 부분만 Client Component로 분리한다.
* 단순한 스타일은 Tailwind로 변환하고, 복잡하거나 정확한 재현이 필요한 경우에만 Schedule 전용 CSS Module을 쓴다. `globals.css`는 수정하지 않고 기존 디자인 토큰을 임의로 추가/변경하지 않는다.
* 반복 데이터는 배열 + map으로 표현할 수 있으나 과도한 추상화는 금지한다.
* 원본 CSS의 이상 동작(selector mismatch, spacing 특성 등)을 임의로 "고치지" 않고 그대로 보존한다.

### Related Files

* `playground-design/schedule.html`
* `src/app/schedule/page.tsx`
* `src/components/schedule/*`(필요 시)
* `docs/DESIGN-SYSTEM.md`
* `docs/MIGRATION.md`

### Requirements

* [ ] `schedule.html`을 처음부터 끝까지 읽고 구조/스타일/스크립트를 확인한다.
* [ ] `/schedule` 페이지가 원본과 시각적으로 동일하게 렌더링된다.
* [ ] 원본 인터랙션(주/월 보기 전환, 내 일정/팀 전체 필터)이 React 방식으로 정확히 재현된다.

### Verification

* [ ] `npm run lint`
* [ ] `npx tsc --noEmit`
* [ ] `npm run build`
* [ ] 가능하면 production build 기준 `/schedule` 렌더링 확인

### Notes

구현 및 검증 완료 후 `REVIEW`로 변경한다. `DONE`으로는 변경하지 않는다.

---

## TASK-008 — Results page Next.js conversion

**Status:** `DONE`

### Goal

`playground-design/results.html`의 정적 UI와 원본에 존재하는 브라우저 인터랙션을 Next.js App Router + TypeScript 구조로 변환한다.

### Scope

변경 허용: `playground-design/results.html`(읽기 전용), `src/app/results/page.tsx`, 필요할 경우 `src/components/results/*`, 필요할 경우 Results 전용 CSS Module, `docs/TASKS.md`의 TASK-008 상태. 그 외 파일은 수정하지 않는다.

### Constraints

* `results.html`의 layout/grid·flex 구조/spacing/width·height/typography/color/border/radius/icon/table·card·row 구조/tabs·filters/hover·active 상태/breakpoint를 임의로 변경하지 않는다.
* 원본에 없는 UI를 추가하지 않는다.
* Root Layout의 StatusBar/Navigation/Footer를 재사용하고 다시 구현하지 않는다.
* `<script>`를 처음부터 끝까지 확인하고 실제 인터랙션(주간/월간 토글, 등록 모달, 구분 토글, 첨부파일 라벨)만 React state/event로 최소 변환한다. `querySelector`/`classList`/`innerHTML` 등 DOM 직접 조작을 쓰지 않는다.
* Supabase/Auth/Drizzle/DB query/API Route/Server Action/React Query/실제 결과 조회·저장/실제 사용자 데이터/실제 필터·정렬 API/mock API/가짜 backend를 구현하지 않는다.
* 가능하면 Server Component를 유지하고, 실제 브라우저 상태가 필요한 부분만 Client Component로 분리한다.
* 단순한 스타일은 Tailwind로 변환하고, 복잡하거나 정확한 재현이 필요한 경우에만 Results 전용 CSS Module을 쓴다. `globals.css`는 수정하지 않고 기존 디자인 토큰을 임의로 추가/변경하지 않는다.
* 반복 데이터는 배열 + map으로 표현할 수 있으나 과도한 추상화는 금지한다.
* 원본 CSS의 이상 동작(selector mismatch, 기본 브라우저 margin, breakpoint 특성 등)을 임의로 "고치지" 않고 그대로 보존한다.

### Related Files

* `playground-design/results.html`
* `src/app/results/page.tsx`
* `src/components/results/*`
* `docs/DESIGN-SYSTEM.md`
* `docs/MIGRATION.md`

### Requirements

* [x] `results.html`을 처음부터 끝까지 읽고 구조/스타일/스크립트를 확인한다.
* [x] `/results` 페이지가 원본과 시각적으로 동일하게 렌더링된다.
* [x] 원본 인터랙션(주간/월간 토글, 실적 등록 모달 열기/닫기, 구분 토글, 첨부파일 라벨)이 React 방식으로 정확히 재현된다.

### Verification

* [x] `npm run lint`
* [x] `npx tsc --noEmit`
* [x] `npm run build`
* [x] 가능하면 production build 기준 `/results` 렌더링 확인

### Notes

구현 및 검증 완료 후 `REVIEW`로 변경한다. `DONE`으로는 변경하지 않는다.

---

## TASK-009 — Daily 페이지 마이그레이션

**Status:** `DONE`

### Goal

`playground-design/daily.html`을 Next.js `/daily` 페이지로 마이그레이션한다.

### Scope

변경 허용: `src/app/daily/page.tsx`, `src/components/daily/*`, 필요할 경우 `src/components/daily/*.module.css`, `docs/TASKS.md`의 TASK-009 상태. 그 외 파일은 수정하지 않는다.

### Related Files

* `playground-design/daily.html`
* `src/app/daily/page.tsx`
* `src/components/daily/*`
* `docs/DESIGN-SYSTEM.md`
* `docs/MIGRATION.md`

### Requirements

* [x] `daily.html`을 처음부터 끝까지 읽고 구조/스타일/스크립트를 확인한다.
* [x] `/daily` 페이지가 원본과 시각적으로 동일하게 렌더링된다.
* [x] 원본 인터랙션(체크박스 토글, 작성/수정 모달, 팀 기록 날짜 이동, 지난 기록 클릭 이동+스크롤)이 React 방식으로 정확히 재현된다.

### Verification

* [x] `npm run lint`
* [x] `npx tsc --noEmit`
* [x] `npm run build`
* [x] 가능하면 production build 기준 `/daily` 렌더링 확인

### Notes

구현 및 검증 완료 후 `REVIEW`로 변경한다. `DONE`으로는 변경하지 않는다.

---

## TASK-010 — Ideas 페이지 마이그레이션

**Status:** `DONE`

### Goal

`playground-design/ideas.html`을 Next.js `/ideas` 페이지로 마이그레이션한다.

### Scope

변경 허용: `src/app/ideas/page.tsx`, `src/components/ideas/*`, 필요할 경우 `src/components/ideas/*.module.css`, `docs/TASKS.md`의 TASK-010 상태. 그 외 파일은 수정하지 않는다.

### Related Files

* `playground-design/ideas.html`
* `src/app/ideas/page.tsx`
* `src/components/ideas/*`
* `docs/DESIGN-SYSTEM.md`
* `docs/MIGRATION.md`

### Requirements

* [x] `ideas.html`을 처음부터 끝까지 읽고 구조/스타일/스크립트를 확인한다.
* [x] `/ideas` 페이지가 원본과 시각적으로 동일하게 렌더링된다.
* [x] 원본 인터랙션(리액션 버튼 개별 토글, view-toggle 탭 배타적 선택)이 React 방식으로 정확히 재현된다.

### Verification

* [x] `npm run lint`
* [x] `npx tsc --noEmit`
* [x] `npm run build`
* [x] 가능하면 production build 기준 `/ideas` 렌더링 확인

### Notes

구현 및 검증 완료 후 `REVIEW`로 변경한다. `DONE`으로는 변경하지 않는다.

---

## TASK-011 — Meetings 페이지 마이그레이션

**Status:** `DONE`

### Goal

`playground-design/meetings.html`을 Next.js `/meetings` 페이지로 마이그레이션한다.

### Scope

변경 허용: `src/app/meetings/page.tsx`, `src/components/meetings/*`, 필요할 경우 `src/components/meetings/*.module.css`, `docs/TASKS.md`의 TASK-011 상태. 그 외 파일은 수정하지 않는다.

### Related Files

* `playground-design/meetings.html`
* `src/app/meetings/page.tsx`
* `src/components/meetings/*`
* `docs/DESIGN-SYSTEM.md`
* `docs/MIGRATION.md`

### Requirements

* [x] `meetings.html`을 처음부터 끝까지 읽고 구조/스타일/스크립트를 확인한다.
* [x] `/meetings` 페이지가 원본과 시각적으로 동일하게 렌더링된다.
* [x] 원본 인터랙션(검색바 옆 filter-chip 배타적 active 토글)이 React 방식으로 정확히 재현된다.

### Verification

* [x] `npm run lint`
* [x] `npx tsc --noEmit`
* [x] `npm run build`
* [x] 가능하면 production build 기준 `/meetings` 렌더링 확인

### Notes

구현 및 검증 완료 후 `REVIEW`로 변경한다. `DONE`으로는 변경하지 않는다.

---

## TASK-012 — Files 페이지 마이그레이션

**Status:** `DONE`

### Goal

`playground-design/files.html`(자료실)을 Next.js `/files` 페이지로 마이그레이션한다.

기존 static HTML 디자인을 1:1로 유지하며, TASK-005~TASK-011과 동일한 마이그레이션 원칙(AGENTS.md, `docs/DESIGN-SYSTEM.md`, `docs/MIGRATION.md` 기준)을 적용한다.

### Scope

변경 허용: `src/app/files/page.tsx`(현재 `<h1>Files</h1>` placeholder 상태), `src/components/files/*`, 필요할 경우 `src/components/files/*.module.css`, `docs/TASKS.md`의 TASK-012 상태. 그 외 파일은 수정하지 않는다.

### Related Files

* `playground-design/files.html`
* `src/app/files/page.tsx`
* `src/components/files/*`(필요 시)
* `docs/DESIGN-SYSTEM.md`
* `docs/MIGRATION.md`
* `docs/ARCHITECTURE.md`

### 구현 시 반드시 보존해야 할 원본 디자인/동작

* `files.html`에는 `<script>` 태그 자체가 없다 — 페이지 전체가 순수 정적 마크업이며 `addEventListener`/`onclick` 등 실제 JS 인터랙션이 하나도 없다. 이번 마이그레이션도 이 상태를 그대로 유지한다(원본에 없는 클릭/토글/모달 기능을 새로 만들지 않는다).
* `.folder-card`는 `cursor:pointer`와 `border-color` hover transition(`.15s ease`)만 있고 실제 클릭 리스너는 없다 — 클릭 시 아무 동작도 하지 않는 장식적 hover 상태 그대로 유지.
* `.file-dl`(다운로드 버튼), `⇧ 파일 업로드` 버튼, breadcrumb의 `전체 폴더`(`<a class="cur">`, href 없음)도 원본에 이벤트 리스너가 없으므로 정적 요소로 유지.
* page-head(`30px 28px 0`) → crumb-row(`18px 28px 0`) → main(`18px 28px 90px`, `grid-template-columns: 1fr 280px`, `gap:22px`) 순서와 padding/grid 값. 사이드바 폭이 `280px`로 다른 페이지(300px/300px/360px 등)와 다르다는 점을 임의로 통일하지 않는다.
* `.folder-grid`: `repeat(3,1fr)` gap `14px`, `700px` 이하에서 `repeat(2,1fr)`로 collapse(다른 페이지에 없는 files.html 전용 보조 breakpoint).
* `.file-row`: `grid-template-columns: 36px 1fr 90px 130px 80px`, `640px` 이하에서 `30px 1fr 60px`로 축소되며 `.file-size`/`.file-date`가 숨겨짐(다른 페이지의 `860px`/`960px`와 다른 files.html 전용 값).
* `.file-icon`의 파일 유형별 stroke 색상 구분: `pdf`=`#e2543f`, `doc`=`#4a9eff`, `sheet`=`var(--teal)`, `img`=`var(--amber)` — 이 4종 외 타입 처리 로직을 새로 만들지 않는다(원본에 4종만 존재).
* `.storage-fill`의 `style="width:34%"`는 원본에도 inline style로 박힌 동적 수치이므로 Tailwind 클래스가 아닌 `style={{ width: '34%' }}`로 그대로 유지한다(`docs/MIGRATION.md` 2절).
* main breakpoint `960px`(1fr로 collapse)는 다른 페이지와 공통이지만, `700px`/`640px` 보조 breakpoint는 files.html 전용이므로 공통 스케일로 통합하지 않는다.
* 폴더/파일 텍스트, 파일 크기, 업로드일, 업로더 이름, 저장 용량(`1.7GB 사용 중`, `34%`), 최근 활동 3건 등 정적 데이터는 원본 그대로 유지한다.

### 제외 범위

* 실제 Supabase Storage 연동(업로드/다운로드/목록 조회)
* private bucket 설정, presigned/signed URL 발급 로직
* 실제 파일 확장자 allowlist·용량 제한·실행파일 차단 등 서버 측 검증 로직(`docs/MIGRATION.md` 11절 — 별도 단계)
* 폴더 생성/삭제, 파일 삭제 등 실제 CRUD 기능
* mock API, 가짜 backend, React Query 연동
* Supabase/Auth/Drizzle/DB schema/API Route/Server Action
* 새로운 dependency 추가
* Root Layout(StatusBar/Navigation/Footer) 수정
* 다른 TASK 또는 다른 페이지 파일 수정

### Requirements

* [x] `files.html`을 처음부터 끝까지 읽고 구조/스타일/스크립트(없음)를 확인한다.
* [x] `/files` 페이지가 원본과 시각적으로 동일하게 렌더링된다.
* [x] 원본에 실제 이벤트 리스너가 없음을 재확인하고, 없는 인터랙션을 추가하지 않는다(전체 페이지가 정적 UI로 유지).

### Verification

* [x] `npm run lint`
* [x] `npx tsc --noEmit`
* [x] `npm run build`
* [x] 가능하면 production build 기준 `/files` 렌더링 확인

### Notes

구현 및 검증 완료 후 `REVIEW`로 변경한다. `DONE`으로는 변경하지 않는다.

---

## TASK-013 — About 페이지 마이그레이션

**Status:** `DONE`

### Goal

`playground-design/about.html`(회사 소개)을 Next.js `/about` 페이지로 마이그레이션한다.

기존 static HTML 디자인을 1:1로 유지하며, TASK-005~TASK-012와 동일한 마이그레이션 원칙(AGENTS.md, `docs/DESIGN-SYSTEM.md`, `docs/MIGRATION.md` 기준)을 적용한다.

### Scope

변경 허용: `src/app/about/page.tsx`(현재 `<h1>About</h1>` placeholder 상태), `src/components/about/*`, 필요할 경우 `src/components/about/*.module.css`, `docs/TASKS.md`의 TASK-013 상태. 그 외 파일은 수정하지 않는다.

### Related Files

* `playground-design/about.html`
* `src/app/about/page.tsx`
* `src/components/about/*`(필요 시)
* `docs/DESIGN-SYSTEM.md`
* `docs/MIGRATION.md`
* `docs/ARCHITECTURE.md`

### 구현 시 반드시 보존해야 할 원본 디자인/동작

* `about.html`에도 `<script>` 태그가 없다 — 전체가 순수 정적 마크업이며 실제 JS 인터랙션이 하나도 없다. 원본에 없는 클릭/토글/모달 기능을 새로 만들지 않는다.
* `about-hero`는 다른 8개 페이지(좌측 정렬 `page-head`)와 달리 **유일하게 중앙 정렬**된 히어로 구조다(`text-align:center`, padding `70px 28px 50px`). kicker(dot+`COMPANY INTRODUCTION`, teal, `margin:0 0 20px`), `about-h1`(42px/700/line-height 1.25, `<span>` 부분만 teal, `<br>` 줄바꿈 위치 포함: "현장의 `<span>`배터리·전력 데이터`</span>`를`<br>`AI로 연결하는 팀, PLAY GROUND"), `about-lead`(15.5px, `max-width:56ch`, `margin:0 auto`)를 그대로 유지한다.
* `vm-grid`(2열, `800px` 이하 1열 — 다른 페이지에 없는 about.html 전용 보조 breakpoint), `vm-card`(`padding:30px 28px`, `radius:16px`), `vm-icon`(44×44, radius 12px, teal-dim bg/border, svg 20×20).
* **중요:** `.vm-card h3`("Vision"/"Mission")와 `.biz-card h4`(사업 아이템 제목)는 원본 CSS에 `font-weight`가 선언되어 있지 않아 브라우저 기본 `<h3>`/`<h4>` bold에 의존한다. 이 프로젝트는 Tailwind Preflight가 `h1~h6`의 `font-weight`를 `inherit`으로 리셋하므로, 아무 클래스도 주지 않으면 원본과 달리 bold가 사라진다 — 구현 시 반드시 명시적으로 굵게 처리해 원본과 동일한 결과를 만들어야 한다.
* `biz-grid`(3열, `860px` 이하 1열 — about.html 전용 보조 breakpoint), `biz-card`(`biz-tag` amber 색상 배지 + h4 + p), 사업 아이템 3종의 텍스트.
* `timeline`: `::before` pseudo-element로 그린 세로선(`left:5px; width:1px; background:border`), `.tl-dot`의 absolute 포지셔닝(`left:-26px`)·크기(11×11)·보더. `past` class는 연혁 3건 중 **마지막(2026.03) 항목에만** 존재해 dot/date 색상이 달라지는 상태(`.tl-item.past .tl-dot`, `.tl-item.past .tl-date`)를 그대로 유지하고, 다른 항목에 임의로 적용하거나 실제 날짜 비교 로직으로 재계산하지 않는다.
* `stats-strip`(4열, `760px` 이하 2열 — about.html 전용 보조 breakpoint), `stat-card`(중앙 정렬, `stat-num` 28px mono teal bold, `stat-label`).
* **StatusBar 우측 영역이 다른 8개 페이지와 다르다**: `.share-chip`("외부 공유 링크", teal 텍스트/배경/보더, pill) + 캘린더 아이콘 버튼만 있고, 알림 아이콘(`badge-count`)이나 `UserChip`이 없다. `.statusbar-right`의 `gap`도 `12px`로 다른 페이지(`16px`)와 다르다. 기존 TASK-003 공유 `StatusBar` 컴포넌트는 이 variant를 지원하지 않으므로, Root Layout을 임의로 수정하거나(금지) 반대로 원본과 다른 알림 배지/UserChip을 그대로 노출한 채 넘어가지 말고, **이 차이를 어떻게 반영할지는 구현 착수 시 별도로 사용자에게 보고하고 결정한다**(`docs/DESIGN-SYSTEM.md` 12절 Status Bar, `docs/MIGRATION.md` 4절 Global Layout 항목 참고).
* HTML entity `&amp;`(R&D)는 JSX에서 일반 문자 `&`로 표현하면 되며 별도 이스케이프가 필요 없다.
* 히어로 문구, Vision/Mission 설명, 사업 아이템 3종, 연혁 3건, 통계 4종(`8`/`3`/`1`/`2026`) 등 모든 정적 텍스트·수치를 원본 그대로 유지한다.

### 제외 범위

* 실제 Supabase 연동(`company_info` 공개/비공개 데이터 분리, `anon` SELECT 등)
* About을 공개 페이지로 분류하는 실제 인증/라우트 그룹 로직(Auth 연동)
* mock API, 가짜 backend, React Query 연동
* Supabase/Auth/Drizzle/DB schema/API Route/Server Action
* 새로운 dependency 추가
* Root Layout(StatusBar/Navigation/Footer) 임의 수정 — StatusBar 우측 variant 처리 방식은 구현 시 별도 보고 후 결정
* 다른 TASK 또는 다른 페이지 파일 수정

### Requirements

* [x] `about.html`을 처음부터 끝까지 읽고 구조/스타일/스크립트(없음)를 확인한다.
* [x] `/about` 페이지가 원본과 시각적으로 동일하게 렌더링된다.
* [x] 원본에 실제 이벤트 리스너가 없음을 재확인하고, 없는 인터랙션을 추가하지 않는다(전체 페이지가 정적 UI로 유지).
* [x] StatusBar 우측 영역(`share-chip`) 차이를 어떻게 반영할지 구현 착수 시 사용자에게 보고한다. → `StatusBar.tsx`에 pathname(`/about`) 기반 최소 분기 추가로 처리(아래 Notes 참고).

### Verification

* [x] `npm run lint`
* [x] `npx tsc --noEmit`
* [x] `npm run build`
* [x] 가능하면 production build 기준 `/about` 렌더링 확인

### Notes

구현 및 검증 완료 후 `REVIEW`로 변경한다. `DONE`으로는 변경하지 않는다.

StatusBar 우측 variant 처리: 사용자 승인 하에 `src/components/layout/StatusBar.tsx`에 `usePathname` 기반 최소 분기(`pathname === "/about"`)만 추가했다(다른 8개 페이지의 기존 분기는 그대로 유지). About 전용 `ShareChip`은 `src/components/about/ShareChip.tsx`에 배치. Scope에 명시된 파일 외 유일한 예외이며, TASK-013 정의 시점에 미리 "구현 착수 시 보고 후 결정"으로 남겨둔 항목을 이번 구현에서 실제로 처리한 것이다.

---

## TASK-014 — Team 페이지 마이그레이션

**Status:** `DONE`

### Goal

`playground-design/team.html`(팀원 소개)을 Next.js `/team` 페이지로 마이그레이션한다.

기존 static HTML 디자인을 1:1로 유지하며, TASK-005~TASK-013과 동일한 마이그레이션 원칙(AGENTS.md, `docs/DESIGN-SYSTEM.md`, `docs/MIGRATION.md` 기준)을 적용한다.

### Scope

변경 허용: `src/app/team/page.tsx`(현재 `<h1>Team</h1>` placeholder 상태), `src/components/team/*`, 필요할 경우 `src/components/layout/*`(팀 전용 UI 재현을 위한 최소 변경만), `docs/TASKS.md`의 TASK-014 상태. 그 외 파일은 수정하지 않는다.

### Related Files

* `playground-design/team.html`
* `src/app/team/page.tsx`
* `src/components/team/*`(필요 시)
* `docs/DESIGN-SYSTEM.md`
* `docs/MIGRATION.md`
* `docs/ARCHITECTURE.md`

### 구현 시 반드시 보존해야 할 원본 디자인/동작

* `team.html`은 `<script>`가 있으며, `.filter-chip` 클릭 시 배타적으로 active 클래스만 토글하고(`meetings.html`과 동일 패턴) 실제로 `team-grid`를 필터링하지 않는다 — 이 동작만 React state로 재현하고, 없는 필터링 로직을 새로 만들지 않는다.
* `page-head`에 다른 페이지에 없는 `.page-sub`("Team VAMOS · AI Solution Team Playground")가 추가로 존재한다.
* `.filter-chip`의 `border-radius`는 `999px`(pill)로, `meetings.html`의 `.filter-chip`(`8px`)과 다르다 — 임의로 통일하지 않는다.
* `team-grid`: `20px 28px 100px`, `repeat(4,1fr)` gap `18px`, `960px` 이하 `repeat(2,1fr)`, `560px` 이하 `1fr`(다른 페이지에 없는 team.html 전용 보조 breakpoint).
* `.id-card`: `::before` pseudo-element로 그린 상단 56px 높이의 teal 그라디언트 오버레이, `.id-punch`(상단 노치 장식), `.id-avatar`(64×64, `position:relative;z-index:1`로 그라디언트 오버레이 위에 노출), hover 시 `border-color` + `transform:translateY(-2px)` 트랜지션.
* `.id-divider`: CSS에 `background: var(--border)`가 선언된 뒤 같은 규칙 안에서 `background:none`으로 다시 덮어써 최종적으로는 배경이 없고 `border-width:1px 0 0; border-style:dashed;`만 적용되는 상단 점선만 남는 상태다 — 실제 렌더 결과(점선 상단 테두리)만 재현하고 배경색 있는 실선으로 "고치지" 않는다.
* `.id-contact-row` 2줄(이메일 아이콘+이메일, 전화 아이콘+전화번호), `.id-stack`의 태그 pill들을 원본 그대로 유지.
* 팀원 8명의 이름/이니셜/역할/소속팀·학년/이메일/전화번호/기술스택 태그를 원본과 정확히 동일하게 유지한다.
* 원본 font-size에 line-height가 함께 선언되지 않은 곳은 Tailwind named scale(`text-xs`, `text-2xl` 등)을 쓰지 않고 `text-[Npx]`로 정확히 대응한다(TASK-011/012/013 리뷰에서 반복 확인된 항목).

### 제외 범위

* 실제 프로필 편집/저장 기능("+ 프로필 편집" 버튼은 원본에 리스너 없음 — 정적 유지)
* 실제 필터링 로직(원본은 active 클래스만 토글)
* Supabase/Auth/Drizzle/API Route/Server Action/mock API
* 새로운 dependency 추가
* Root Layout/StatusBar/Navigation/Footer의 불필요한 변경(Team 전용 UI 재현을 위한 최소 변경 외 금지)
* 다른 TASK 또는 다른 페이지 파일 수정

### Requirements

* [x] `team.html`을 처음부터 끝까지 읽고 구조/스타일/스크립트를 확인한다.
* [x] `/team` 페이지가 원본과 시각적으로 동일하게 렌더링된다.
* [x] 원본 인터랙션(`.filter-chip` 배타적 active 토글)이 React 방식으로 정확히 재현된다.

### Verification

* [x] `npm run lint`
* [x] `npx tsc --noEmit`
* [x] `npm run build`
* [x] 가능하면 production build 기준 `/team` 렌더링 확인

### Notes

구현 및 검증 완료 후 `REVIEW`로 변경한다. `DONE`으로는 변경하지 않는다.

---

## TASK-015 — Login 페이지 마이그레이션

**Status:** `REVIEW`

### Goal

`playground-design/login.html`(로그인)을 Next.js `/login` 페이지로 마이그레이션한다.

### Scope

변경 허용(예정): `src/app/login/page.tsx`(신규), `src/components/login/*`(신규), `docs/TASKS.md`의 TASK-015 상태. 그 외 파일은 수정하지 않는다.

**단, 아래 "레이아웃 구조 결정 필요" 항목이 먼저 해결되기 전까지 구현에 착수하지 않는다.**

### Related Files

* `playground-design/login.html`
* `src/app/login/page.tsx`
* `src/components/login/*`(필요 시)
* `src/app/layout.tsx`(Root Layout — 아래 결정 사항에 따라 참고만 하거나 최소 수정 대상이 될 수 있음)
* `docs/DESIGN-SYSTEM.md`
* `docs/MIGRATION.md`
* `docs/ARCHITECTURE.md`

### 레이아웃 구조 결정 (해결됨)

옵션 1(Next.js route group)로 확정되어 이미 적용되었다. 기존 10개 페이지는 `src/app/(main)/` route group으로 이동되었고, 공유 `StatusBar`/`main`/`Footer` 골격은 `src/app/(main)/layout.tsx`로 옮겨졌다. `(main)` 폴더명은 URL에 포함되지 않으므로 10개 페이지의 실제 경로는 변경되지 않았다. `/login`(`src/app/login/page.tsx`)은 이 route group 밖에 위치해 Root Layout(`src/app/layout.tsx`, 미수정)만 상속하고 `StatusBar`/`Navigation`/`Footer`는 상속하지 않는다.

### 구현 시 반드시 보존해야 할 원본 디자인/동작

* `login.html`의 `:root`는 다른 10개 페이지의 공통 `:root`와 다르다 — `--amber-dim`이 정의되어 있지 않고, `--trace`값도 `rgba(231,239,236,0.032)`로 다른 페이지의 `0.028`과 다르다. 특히 이 페이지에서는 `--trace`가 실제로 brand-panel의 grid-paper 배경(`background-image: linear-gradient(...)`, `46px 46px`)에 사용되어(다른 9개 페이지는 미사용 dead 변수) 임의로 공통값(0.028)을 재사용하면 안 된다.
* 반응형 breakpoint는 `900px` 하나뿐이며, 다른 페이지의 `960px` nav-hide와 다른 값이다. `900px` 이하에서 `brand-panel` 전체가 `display:none`으로 사라지고 `.mobile-logo`가 폼 위에 나타난다.
* 원본 `<script>`의 실제 동작(전부 React state/event로 변환 필요):
  * `#togglePw` 클릭 → `#password`의 `type`을 `password`/`text`로 토글(아이콘 자체는 바뀌지 않음).
  * `#loginForm` submit → `preventDefault`, 버튼 비활성화, 라벨을 "충전 중..."으로 변경 후 하드코딩된 데모 계정(`demo@edcl.team` / `1234`)과 비교 — 실제 Supabase Auth 연동 없이 이 데모 비교 로직 자체를 그대로 재현한다(원본에도 `// TODO: Supabase Auth signInWithPassword()로 교체` 주석으로 남아있는 자리표시자).
  * 성공 시 `chargeSuccess()`: 배터리 셀 5개를 아래→위 순서로 `STEP_MS=160ms` 간격으로 채우고, SOC 숫자를 0→82%로 애니메이션, 완료 후 충전 pill을 "CHARGED"로, 로그인 버튼 라벨을 "✓ 로그인 완료"로 바꾸고 숨겨져 있던 `#goHomeBtn`("홈으로 이동 →")을 노출한다.
  * 실패 시 `chargeFail()`: 셀 5개 중 3개만 채우고 SOC를 비례값까지 올린 뒤 pill을 `.error`("ERROR")로 바꾸고 배터리 body에 `.shake` 애니메이션을 추가, 350ms 후 채웠던 3칸을 역순으로 다시 비우고 SOC를 0으로 되돌리며 pill/버튼 라벨을 원상복구하고 `#loginError` 문구를 노출한다.
  * `#goHomeBtn` 클릭 → 홈으로 이동(원본은 `location.href='index.html'`, Next.js에서는 `/`로 이동).
  * `#magicLinkBtn` 클릭 → `alert('이메일로 로그인 링크를 보냈습니다. (데모)')`(원본에도 `// TODO: Supabase Auth signInWithOtp() 연동` 주석의 자리표시자) — 그대로 `alert` 유지, 새 UI(토스트 등)로 개선하지 않는다.
* `.spinner`/`.btn-primary.loading` CSS가 정의되어 있지만 원본 DOM/스크립트 어디에도 `.spinner` 엘리먼트나 `.loading` 클래스 토글이 없다 — 실제로는 도달 불가능한 죽은 스타일이므로 스피너 UI를 새로 만들지 않는다.
* `#goHomeBtn`의 초기 `style="display:none; margin-top:10px;"`(성공 시에만 노출), `.login-error`의 기본 `display:none`(실패 시에만 노출)은 조건부 렌더링으로 재현한다.
* `remember` 체크박스는 기본 `checked`이고 원본에 별도 리스너가 없다 — 상태를 관리하는 controlled input으로 바꾸지 않고 원본 그대로(비제어 또는 defaultChecked) 유지한다.
* "비밀번호 찾기", "팀장에게 초대 요청" 링크는 `href="#"`이며 클릭 리스너가 없다 — 정적으로 유지한다.
* `demo-hint` 문구("데모 계정: demo@edcl.team / 1234")를 그대로 유지한다(보안상 이상해 보여도 원본 설계 그대로).
* 3D 배터리 비주얼(`.b3d-*`)은 `index.html`(Home, TASK-005에서 이미 `src/components/home/Battery3D.tsx`로 구현됨)과 클래스 네이밍은 비슷하지만 실제 치수(`280×400`, `transform:scale(1.15)` 래퍼 등)와 로그인 성공/실패에 종속된 상태 머신이 달라 Home의 컴포넌트를 그대로 재사용하지 않고 Login 전용으로 별도 구현한다.
* circuit trace-flow 6개의 `animation-delay`(-0.6s 간격 순차)를 그대로 유지한다.

### 제외 범위

* 실제 Supabase Auth 연동(`signInWithPassword`/`signInWithOtp`)
* 실제 세션/쿠키/서버 인증 검증
* API Route/Server Action
* 회원가입 기능
* 실제 "비밀번호 찾기"/"팀장에게 초대 요청" 플로우
* mock API, 가짜 backend
* 새로운 dependency 추가
* 위 "레이아웃 구조 결정 필요" 항목 확정 전의 Root Layout/기존 페이지 변경

### Requirements

* [x] `login.html`을 처음부터 끝까지 읽고 구조/스타일/스크립트를 확인한다.
* [x] 레이아웃 구조(StatusBar/Footer 미노출 방식)를 확정한다 — route group 분리(위 참고).
* [x] `/login` 페이지가 원본과 시각적으로 동일하게 렌더링된다.
* [x] 원본 인터랙션(비밀번호 표시 토글, 데모 로그인 성공/실패 애니메이션, 홈 이동, 매직링크 alert)이 React 방식으로 정확히 재현된다.

### Verification

* [x] `npm run lint` (수정 전 `react-hooks/exhaustive-deps` warning 1건 발견 후 수정, 현재 0 warning)
* [x] `npx tsc --noEmit`
* [x] `npm run build` (11개 route 모두 정적 생성 성공)
* [x] production build 기준 `npm run start` 실행 후 `/login`, `/`, `/meetings`, `/about`, `/attendance`, `/schedule`, `/results`, `/daily`, `/ideas`, `/files`, `/team` 전체 HTTP 200 확인. 렌더링된 HTML을 검사해 `/login`에 StatusBar(`PLAY_GROUND` 텍스트)/`<footer>`가 없음을 확인했고, `/meetings`·`/about`에는 정상적으로 있음을 확인해 회귀 없음을 확인했다. `/login`의 battery cell 5개, grid-template-columns:1fr 560px, `--trace:0.032` 로컬 override, `.page button{font-family:inherit}` 등이 컴파일된 CSS/HTML에 실제로 존재함을 직접 grep으로 확인했다.
* [ ] Chrome 확장(claude-in-chrome)이 설치되어 있지 않아 실제 브라우저의 애니메이션 타이밍/pixel-level 렌더링(성공/실패 배터리 애니메이션, 900px 반응형 전환)은 육안으로 확인하지 못했다. 정적 렌더링(HTML/CSS 산출물)과 로직(타이머 순서/인덱스 계산)만 코드 레벨로 검증했다.

### Notes

구현은 이전 세션에서 대부분 완료된 상태로 발견되었다(`src/app/login/page.tsx`, `src/components/login/*`). 이번 세션에서 검토 후 다음을 수정했다:

* `LoginScreen.module.css`에 원본의 `button{font-family:inherit}` 규칙이 누락되어 있어 버튼이 시스템 기본 폰트로 렌더링되는 문제를 발견하고 `.page button{font-family:inherit}`로 추가했다.
* `LoginScreen.tsx`의 cleanup effect에서 `react-hooks/exhaustive-deps` warning(ref 값을 effect cleanup에서 직접 참조)을 effect 내부 지역 변수로 캡처하도록 수정했다.

그 외 기존 구현(BrandPanel/LoginForm/LoginBattery 컴포넌트 분리, 성공/실패 애니메이션 타이밍, `--trace` 로컬 override, dead `.spinner`/`.btn-primary.loading` CSS 보존 등)은 원본 `login.html`과 대조 검토한 결과 요구사항을 충실히 만족해 그대로 유지했다.

Chrome 확장 미설치로 실제 브라우저 시각 검증은 완료하지 못했다(위 Verification 참고). `DONE`으로는 변경하지 않는다.

추가로, 사용자가 "로그인 화면이 홈보다 먼저 나오고 로그인 성공해야 홈이 보이게" 요청함에 따라 TASK-015 원래 제외 범위였던 "실제 세션/쿠키 검증"과는 다른, **데모 수준의 라우트 게이트**를 별도로 추가했다(TASK-016 참고). Supabase Auth 연동은 여전히 하지 않았다.

---

## TASK-016 — 데모 로그인 라우트 게이트

**Status:** `REVIEW`

### Goal

로그인 전에는 `/login`을 제외한 모든 페이지에 접근할 수 없고, `/login`에서 데모 로그인에 성공해야만 홈(`/`)을 포함한 나머지 페이지를 볼 수 있게 한다. 실제 Supabase Auth/서버 세션이 아닌 데모 수준 쿠키 게이트로 구현한다.

### Scope

변경 허용: `src/proxy.ts`(신규), `src/components/login/LoginScreen.tsx`(로그인 성공 시 쿠키 세팅 로직 추가), `docs/TASKS.md`의 TASK-016 상태. 그 외 파일은 수정하지 않는다.

### Related Files

* `src/proxy.ts`
* `src/components/login/LoginScreen.tsx`

### 구현 내용

* `src/proxy.ts`(Next.js 16 기준 `middleware.ts`의 새 이름): 요청 쿠키 `pg_demo_auth` 존재 여부만 확인한다. 쿠키가 없고 `/login`이 아니면 `/login`으로, 쿠키가 있고 `/login`이면 `/`로 리다이렉트한다. `matcher`로 `_next/static`, `_next/image`, `favicon.ico`는 제외한다.
* `LoginScreen.tsx`의 데모 로그인 성공 분기(`chargeSuccess()` 호출 직전)에서 `document.cookie = "pg_demo_auth=1; path=/; SameSite=Lax"`를 세팅한다. `Max-Age`를 지정하지 않아 브라우저 세션이 끝나면 만료되는 세션 쿠키다("로그인 상태 유지" 체크박스는 TASK-015 범위대로 여전히 리스너가 없는 정적 요소로 유지 — 이 쿠키 수명과는 무관하다).

### 제외 범위

* 실제 Supabase Auth(`signInWithPassword`)/서버 세션/JWT 검증
* 로그아웃 기능(현재 UI에 로그아웃 버튼 없음)
* "로그인 상태 유지" 체크박스 실제 동작 연동

### Verification

* [x] `npm run lint`
* [x] `npx tsc --noEmit`
* [x] `npm run build` (경고 없이 `Proxy (Middleware)` 라우트로 정상 생성됨을 확인)
* [x] production 서버(`npm run start`) 기준 curl로 5가지 시나리오 확인: 쿠키 없이 `/`→307 `/login`, 쿠키 없이 `/attendance`→307 `/login`, 쿠키 없이 `/login`→200, 쿠키 있을 때 `/`→200, 쿠키 있을 때 `/login`→307 `/`.

### Notes

`middleware.ts`로 처음 구현했으나 Next.js 16.3.4가 해당 파일 컨벤션을 deprecated 처리하고 `proxy.ts`(+`proxy` export)를 권장한다는 빌드 경고가 있어 `src/proxy.ts`로 옮겼다. 실제 브라우저(쿠키 발급 후 새로고침 등)로는 Chrome 확장 미설치로 검증하지 못했고 curl 기반 서버 응답 코드/redirect 헤더로만 확인했다. `DONE`으로는 변경하지 않는다.

---

# BACKLOG

> 아직 시작하지 않은 작업.

_실제 작업 없음._

---

# COMPLETED

> 완료된 작업의 목록만 유지한다.
> 상세 구현 설명은 작성하지 않는다.

| ID | 작업 | 완료일 | 검증 |
| -- | -- | --- | -- |
| TASK-001 | Next.js 프로젝트 초기화 | 2026-09-02 | typecheck/lint/build 통과 |
| TASK-002 | Design System 기반 전역 스타일 구축 | 2026-09-02 | typecheck/lint/build 통과 |
| TASK-003 | 공통 Layout 및 UI Component 구축 | 2026-09-02 | typecheck/lint/build 통과 |
| TASK-004 | App Router 라우팅 및 Root Layout 구성 | 2026-09-02 | typecheck/lint/build 통과, 10개 route HTTP 200 |

---

# WORKFLOW

## 작업 시작

새 작업을 시작하면 해당 작업을 `CURRENT`로 이동한다.

```text
BACKLOG
   ↓
CURRENT
   ↓
IN_PROGRESS
```

## 작업 완료

모든 요구사항과 검증을 통과하면:

```text
IN_PROGRESS
   ↓
REVIEW
   ↓
DONE
   ↓
COMPLETED
```

## 작업 중 문제 발생

외부 결정이나 해결되지 않은 문제가 있으면:

```text
IN_PROGRESS
   ↓
BLOCKED
```

문제가 해결되면 다시:

```text
BLOCKED
   ↓
IN_PROGRESS
```

---

# AGENT RULES

Claude는 이 문서를 사용할 때 다음 규칙을 따른다.

### 1. CURRENT 우선

작업을 시작하기 전에 `CURRENT`를 확인한다.

`CURRENT`가 존재하면 해당 작업의 범위와 요구사항을 우선한다.

### 2. BACKLOG 임의 진행 금지

사용자가 명시하지 않은 `BACKLOG` 작업을 임의로 구현하지 않는다.

### 3. Scope 준수

`CURRENT`의 `Scope`와 `Related Files`를 기준으로 작업한다.

관련 없는 기능이나 파일을 임의로 수정하지 않는다.

### 4. 상태 업데이트

작업 상태가 변경되면 이 문서를 업데이트한다.

예:

```text
TODO
→ IN_PROGRESS
→ REVIEW
→ DONE
```

### 5. 완료 조건

다음 조건을 만족하기 전에는 작업을 `DONE`으로 변경하지 않는다.

* 요구사항 완료
* 관련 테스트 통과
* typecheck 통과
* lint 통과
* build 통과
* 보안 요구사항 위반 없음

### 6. 불확실한 변경

요구사항에 없는 대규모 구조 변경이 필요하다고 판단되면 임의로 진행하지 않는다.

해당 문제를 `Notes`에 기록하고 사용자에게 보고한다.

---

# TASK TEMPLATE

새 작업을 추가할 때 다음 형식을 사용한다.

```md
## TASK-ID — 작업 제목

**Status:** `TODO`

### Goal

작업 목표.

### Scope

변경 범위.

### Related Files

- `src/...`

### Requirements

- [ ] 요구사항

### Verification

- [ ] 관련 테스트
- [ ] typecheck
- [ ] lint
- [ ] build

### Notes

필요한 참고사항.
```
