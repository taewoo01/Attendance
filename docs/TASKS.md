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

## TASK-017 — Supabase 프로젝트 연결 + 환경변수 기반 구축

**Status:** `REVIEW`

### Goal

이미 생성되어 있는 Supabase 프로젝트를 Next.js 프로젝트에 연결할 수 있는 최소 기반(dependency, 환경변수 구조, Supabase client 팩토리)만 구축한다. Auth/DB schema/RLS/Repository/API/Server Action/페이지 데이터 연결은 이번 TASK 범위가 아니다.

### Scope

변경 허용: `package.json`/`package-lock.json`(dependency 추가), `.env.local.example`(신규), `.gitignore`(예외 1줄 추가), `src/lib/supabase/browser.ts`(신규), `src/lib/supabase/server.ts`(신규), `docs/TASKS.md`의 TASK-017 상태. 그 외 파일은 수정하지 않는다.

### Related Files

* `package.json`
* `.gitignore`
* `.env.local.example`
* `src/lib/supabase/browser.ts`
* `src/lib/supabase/server.ts`

### 제외 범위

* Supabase Auth, 로그인/로그아웃, 세션 검증, `src/proxy.ts` 인증 전환
* profiles/attendance 등 모든 DB schema, migration
* RLS 정책
* Repository, Server Action, API Route
* Storage bucket
* 페이지 데이터 연결, UI 변경
* Service Role Client(실제로 이번 TASK에서 사용처가 없어 만들지 않음 — 환경변수 자리만 준비)

### Requirements

* [x] `@supabase/supabase-js`, `@supabase/ssr` 설치(중복 설치 방지 확인)
* [x] `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` 환경변수 구조를 `.env.local.example`로 문서화(실제 값 없음)
* [x] `.gitignore`가 `.env.local`은 계속 차단하면서 `.env.local.example`만 커밋 허용하도록 확인/수정 (`!.env.local.example` 예외 1줄 추가, `git status`/`git check-ignore`로 직접 검증)
* [x] `src/lib/supabase/browser.ts`(Client Component용), `src/lib/supabase/server.ts`(Server Component/Action용, `next/headers`의 `cookies()`가 이 Next 버전에서 Promise를 반환함을 확인 후 `async`로 작성) 최소 client 팩토리 작성 — Auth 로직 없음
* [x] 기존 10개 페이지, `/login`, Root/그룹 Layout, `src/proxy.ts` 무수정 확인 (`git status` 기준 변경 파일이 계획한 범위와 정확히 일치함을 확인)

### Verification

* [x] `npm run lint`
* [x] `npx tsc --noEmit`
* [x] `npm run build` (11개 route + Proxy 정상 생성)
* [x] production 서버 기준 curl로 `/`(307→`/login`), `/login`(200), `/meetings`(쿠키 없이 307→`/login`, 쿠키 있으면 200), `/about`(쿠키 없이 307→`/login`, 쿠키 있으면 200) 확인 — TASK-016 도입 이전과 동일한 리다이렉트/응답으로 regression 없음

### Notes

구현 및 검증 완료 후 `REVIEW`로 변경했다. `DONE`으로는 변경하지 않는다.

* `npm install` 과정에서 `@supabase/ssr`가 요구하는 `@supabase/supabase-js` peer range(`^2.112.4`)와 최초 설치된 버전(2.109.0)이 어긋나 `npm ls`가 `invalid` 경고를 낸 것을 발견 → `npm install @supabase/supabase-js@latest @supabase/ssr@latest`로 재설치해 해결(`@supabase/ssr@0.12.5` + `@supabase/supabase-js@2.114.0`, `npm ls` 정상).
* 위 재설치 버전의 하위 패키지(`@supabase/functions-js` 등)가 `engines.node >= 22.0.0`을 요구해 현재 로컬 Node(v20.19.4)에서 `EBADENGINE` 경고가 뜬다. `@supabase/ssr`가 요구하는 범위(`^2.112.4`) 내 모든 버전이 동일한 Node 22 요구사항을 갖고 있어(레지스트리로 직접 확인) 이 조합에서는 피할 수 없는 upstream 제약이다. `.npmrc`에 `engine-strict`가 없어 설치/빌드/실행 모두 경고만 뜨고 실제로 실패하지 않음을 확인했다 — 다만 CI 환경의 Node 버전을 나중에 22 이상으로 올릴지, 아니면 이 경고를 감수할지는 사용자 판단이 필요하다.
* Service Role Client는 지시대로 만들지 않았다. `SUPABASE_SERVICE_ROLE_KEY`는 `.env.local.example`에 자리만 만들어뒀고, 어떤 코드에서도 참조하지 않는다(grep으로 확인).
* 실제 Supabase 프로젝트 URL/anon key/service role key는 사용자가 Supabase Dashboard에서 직접 확인해 로컬 `.env.local`(gitignore 대상, 미커밋)에 채워야 한다 — 이 세션은 해당 값을 알 수 없고 대화창에 붙여넣도록 요청하지도 않는다.

---

## TASK-018 — profiles 데이터 모델 + RLS + auth.users 트리거

**Status:** `DONE`

### Goal

Supabase Auth(`auth.users`)를 기준으로 하는 최소 팀원 프로필 데이터 모델(`profiles`)을 Drizzle 스키마로 구축하고, RLS와 신규 가입/초대 시 자동 프로필 생성 트리거로 데이터 무결성과 기본 보안 경계를 DB 레벨에서 보장한다.

### Scope

변경 허용: `src/db/schema.ts`(신규), `drizzle.config.ts`(신규), `drizzle/0000_init.sql`, `drizzle/0001_rls_and_trigger.sql`, `drizzle/meta/*`(drizzle-kit 자동 생성), `drizzle/sql/seed-founders.template.sql`(신규), `src/lib/db/client.ts`(신규), `src/lib/db/profiles.ts`(신규), `docs/TASKS.md`의 TASK-018 상태. 그 외 파일은 수정하지 않는다.

### Related Files

* `src/db/schema.ts`
* `drizzle/0000_init.sql`
* `drizzle/0001_rls_and_trigger.sql`
* `drizzle/sql/seed-founders.template.sql`
* `src/lib/db/client.ts`
* `src/lib/db/profiles.ts`

### Requirements

* [x] `profiles` 테이블: `user_id`(PK, `auth.users.id` FK `ON DELETE CASCADE`), `name`/`role`/`contact`(기본값 `""`), `can_invite`(기본값 `false`)
* [x] `profiles`에 RLS 활성화, `authenticated` 역할에 SELECT만 허용(`USING (true)`) — INSERT/UPDATE/DELETE는 정책이 없어 기본 거부
* [x] `auth.users` INSERT 트리거(`on_auth_user_created` → `handle_new_user()`, `SECURITY DEFINER`)로 신규 사용자 생성 시 `profiles` 행을 `can_invite=false` 기본값으로 자동 생성, insert 실패해도 `auth.users` 생성 자체는 막지 않음
* [x] 초기 창업 멤버 4명을 `can_invite=true`로 전환하는 1회성 수동 SQL 템플릿(`seed-founders.template.sql`) 작성 — 실제 이메일은 코드/커밋에 남기지 않음

### Verification

* [x] `npx tsc --noEmit`
* [x] `npm run lint`
* [x] `npm run build`
* [x] (TASK-021) 실 프로덕션 DB에 직접 연결해 RLS 활성화 여부·정책 목록·트리거 존재 여부를 조회로 재확인
* [x] (TASK-021) 실 계정으로 로그인 가능한 사용자가 자신의 `can_invite`를 직접 UPDATE/INSERT 시도 시 RLS로 차단되는 것을 실제로 재현
* [x] (TASK-021) 신규 계정 생성 시 트리거가 `can_invite=false` 기본값으로 `profiles` 행을 자동 생성하는 것을 실제로 재현

### Notes

구현은 TASK-021 검증 시점에 이미 완료된 상태로 발견됐다. TASK-021에서 실 프로덕션 Supabase 프로젝트를 직접 조회해 마이그레이션(RLS+트리거)이 정상 적용되어 있음을 재확인했다. 다만 `seed-founders.template.sql`은 이 시점까지 한 번도 실행된 적이 없어 `auth.users`/`profiles`가 완전히 비어 있었다 — TASK-018 자체의 결함이 아니라 별도 운영 절차(시딩) 미실행이었고, TASK-021에서 사용자 승인 하에 처리했다(TASK-021 Notes 참고).

---

## TASK-019 — Supabase Auth 실전 연동(로그인/로그아웃/세션 게이트/비밀번호 재설정 요청)

**Status:** `REVIEW`

### Goal

TASK-016의 데모 쿠키 게이트를 실제 Supabase Auth 세션 기반으로 교체하고, 로그인/로그아웃/비밀번호 재설정 요청을 실제 Supabase Auth API로 연동한다. `can_invite`는 다른 기능 권한과 무관한 별도 개념으로 도입한다.

### Scope

변경 허용: `src/proxy.ts`, `src/lib/supabase/middleware.ts`(신규), `src/lib/auth/client.ts`(신규), `src/lib/auth/get-user.ts`(신규), `src/lib/auth/can-invite.ts`(신규), `src/lib/auth/login.ts`(신규, LOGIN GAP FIX), `src/components/login/LoginScreen.tsx`, `src/components/login/LoginForm.tsx`, `src/components/ui/UserChip.tsx`, `docs/TASKS.md`의 TASK-019 상태. 그 외 파일은 수정하지 않는다.

### Related Files

* `src/proxy.ts`
* `src/lib/supabase/middleware.ts`
* `src/lib/auth/client.ts`
* `src/lib/auth/get-user.ts`
* `src/lib/auth/can-invite.ts`
* `src/lib/auth/login.ts`(LOGIN GAP FIX)
* `src/components/login/LoginScreen.tsx`
* `src/components/login/LoginForm.tsx`
* `src/components/ui/UserChip.tsx`

### Requirements

* [x] `src/proxy.ts`: 데모 쿠키(`pg_demo_auth`) 판별을 실제 `supabase.auth.getUser()` 세션 판별로 교체. `/auth/*`는 인증 여부와 무관하게 항상 통과
* [x] `LoginScreen`의 데모 계정 하드코딩 비교(`demo@edcl.team`/`1234`)를 실제 `signInWithPassword()` 호출로 교체(성공/실패 애니메이션은 실제 로그인 결과에 연동) — **(LOGIN GAP FIX)** 클라이언트가 anon key로 `signInWithPassword()`를 직접 호출하지 않도록, 이 호출을 `src/lib/auth/login.ts`의 `signInAction()` Server Action(`"use server"`)으로 옮겼다. `LoginScreen.tsx`는 이제 이 Server Action의 결과(`{ error }`)만 받아 성공/실패 애니메이션을 재생한다.
* [x] `LoginForm`의 "비밀번호 찾기" 링크를 실제 `resetPasswordForEmail()` 호출로 연동 — **(LOGIN GAP FIX)** 마찬가지로 `resetPasswordAction()` Server Action으로 이동했다. `redirectTo`는 클라이언트의 `window.location.origin` 대신 서버가 받은 요청 헤더(`host`/`x-forwarded-proto`)로 재구성해 `/auth/confirm?next=/set-password`를 가리키도록 한다.
* [x] `UserChip` 클릭 시 실제 `signOut()` 호출 후 `/login`으로 이동
* [x] `getCurrentUser()`/`getCanInvite()` 최소 helper 도입 — `can_invite`는 초대 가능 여부만 의미하고 다른 권한과 연결하지 않음

### Verification

* [x] `npx tsc --noEmit`
* [x] `npm run lint`
* [x] `npm run build`
* [x] (TASK-021) 실제 founder 계정으로 `signInWithPassword()` 성공/실패(오답 비밀번호) 둘 다 실제 Supabase Auth로 검증
* [x] (TASK-021) 실제 `signOut()` 후 로그아웃 이전 세션 쿠키를 재사용해도 서버가 거부하는 것을 확인(서버 측 세션 무효화 확인)
* [x] (TASK-021) 인증 쿠키 유무에 따른 `/`, `/invite`, `/attendance`, `/login` 리다이렉트를 실제 dev 서버 대상 HTTP 요청으로 확인
* [x] (LOGIN GAP FIX) `signInAction()`/`resetPasswordAction()`을 Server Action으로 전환한 뒤 실제 dev 서버 대상 HTTP 요청으로 재검증 — 정상 계정 로그인 성공, 오답 비밀번호 로그인 실패, 비밀번호 재설정 요청 흐름이 Server Action 경유로도 기존과 동일하게 동작함을 확인. `npx tsc --noEmit` / `npm run lint` / `npm run build` 모두 PASS.
* [ ] `resetPasswordForEmail()`의 실제 이메일 발송 성공은 TASK-021 검증 중 Supabase 기본 이메일 발송 rate limit(429 `over_email_send_rate_limit`)에 걸려 재확인하지 못함(코드 결함 아님, 환경 제약) — LOGIN GAP FIX(Server Action 전환) 이후에도 동일한 제약으로 재확인하지 못했다.
* [ ] 실제 브라우저에서의 로그인 화면 클릭/애니메이션/반응형 렌더링은 브라우저 자동화 도구 부재로 미검증(코드 레벨 로직만 확인됨)

### Notes

구현은 TASK-021 검증 시점에 이미 완료된 상태로 발견됐다. TASK-021에서 실제 Supabase 프로젝트·실제 dev 서버를 대상으로 한 HTTP/Auth API 테스트로 로그인/로그아웃/세션 게이트 로직 자체에는 결함이 없음을 확인했다.

**LOGIN GAP FIX:** 이후 검토에서 `LoginScreen`/`LoginForm`이 `signInWithPassword()`/`resetPasswordForEmail()`을 클라이언트(브라우저, anon key)에서 직접 호출하고 있던 부분을 gap으로 판단해, 두 호출 모두 `src/lib/auth/login.ts`의 Server Action(`signInAction`/`resetPasswordAction`)으로 옮겼다. `UserChip`의 `signOut()`(`src/lib/auth/client.ts`)은 세션 종료 목적의 클라이언트 SDK 호출이라 이번 Gap Fix 대상이 아니며 그대로 유지했다.

위 두 미검증 항목(비밀번호 재설정 이메일 실제 도착, 브라우저 UI 렌더링)은 이번 Gap Fix에서도 검증하지 못해 여전히 남아 있다. `DONE`이 아닌 `REVIEW`로 유지한다.

---

## TASK-020 — 팀원 초대 시스템(초대 발송/수락, 비밀번호 설정 화면)

**Status:** `REVIEW`

### Goal

`can_invite=true` 팀원만 신규 팀원을 초대할 수 있는 폐쇄형 초대 시스템과, 초대 수락·비밀번호 재설정이 공유하는 `/auth/confirm` → `/set-password` 흐름을 구현한다.

### Scope

변경 허용: `src/app/(main)/invite/page.tsx`(신규), `src/components/invite/InviteForm.tsx`(신규), `src/lib/auth/invite.ts`(신규), `src/lib/supabase/admin.ts`(신규), `src/app/auth/confirm/route.ts`(신규), `src/app/set-password/page.tsx`(신규), `src/components/set-password/SetPasswordForm.tsx`(신규), `docs/TASKS.md`의 TASK-020 상태. 그 외 파일은 수정하지 않는다.

### Related Files

* `src/app/(main)/invite/page.tsx`
* `src/components/invite/InviteForm.tsx`
* `src/lib/auth/invite.ts`
* `src/lib/supabase/admin.ts`
* `src/app/auth/confirm/route.ts`
* `src/app/set-password/page.tsx`
* `src/components/set-password/SetPasswordForm.tsx`

### Requirements

* [x] `/invite` Server Action(`inviteTeamMember`): Authentication(`getCurrentUser`) → Authorization(`getCanInvite`) → Admin API(`inviteUserByEmail`) 순서를 지키고, `can_invite=false`면 fail closed로 거부
* [x] Service Role Key를 쓰는 `createAdminClient()`는 서버 전용(브라우저 실행 시 즉시 에러)
* [x] `/auth/confirm`: `token_hash`+`type`(`invite`|`recovery`)만 허용(allowlist, fail closed), `verifyOtp()` 성공 시 항상 `/set-password`로만 리다이렉트(리다이렉트 대상을 쿼리로 받지 않아 open redirect 방지), 실패 시 `/login`
* [x] `/set-password`: 기존 세션 기준으로 `updateUser({ password })`만 호출(비밀번호 8자 이상, 확인 일치 검증)
* [x] **(LOGIN GAP FIX)** `/invite` 페이지(`src/app/(main)/invite/page.tsx`) 자체에 서버 측 접근 제어 추가: 기존에는 `can_invite=false`인 사용자도 `/invite` 페이지 자체(폼 UI)는 볼 수 있고 제출(Server Action)에서만 막혔다 — 이 gap을 막기 위해 페이지 진입 시점에 `getCurrentUser()`로 미로그인이면 `/login`, `getCanInvite()`로 `can_invite=false`면 `/`로 redirect하도록 했다. 기존 `inviteTeamMember` Server Action의 재검사는 defense-in-depth로 그대로 유지한다(페이지 체크를 우회해도 Server Action에서 다시 막힘).

### Verification

* [x] `npx tsc --noEmit`
* [x] `npm run lint`
* [x] `npm run build`
* [x] (TASK-021) 실제 founder 세션으로 `/invite`에 실제 HTTP POST(Server Action의 no-JS fallback 프로토콜 그대로 재현) 전송 → 실제 `inviteUserByEmail()` 성공 확인
* [x] (TASK-021) `can_invite=false` 팀원 세션으로 동일한 실제 HTTP POST 전송 → "팀원을 초대할 권한이 없습니다" 응답 확인(차단 성공)
* [x] (TASK-021) `admin.generateLink()`로 발급한 실제 `token_hash`로 `/auth/confirm`(invite/recovery 둘 다) 실제 요청 → 세션 발급 → `/set-password` 리다이렉트 → `updateUser()` 성공 → 새 비밀번호 로그인 성공까지 전 구간 확인
* [x] (TASK-021) 이미 사용된 invite/recovery `token_hash` 재사용 시 `/auth/confirm`이 `/login`으로 거부하는 것을 확인(재사용 불가)
* [x] (LOGIN GAP FIX) `can_invite=false` 세션으로 `/invite`에 실제 HTTP GET 요청 → 서버에서 `/`로 redirect되어 폼 자체가 렌더링되지 않음을 확인(이전 TASK-021 검증은 Server Action POST 차단만 확인했고, 페이지 GET 접근 자체의 차단은 이번에 추가로 확인). 미로그인 세션으로 `/invite` GET 요청 시 `/login` redirect도 함께 확인.
* [ ] 실제 브라우저에서의 초대 폼/비밀번호 설정 폼 클릭·렌더링은 브라우저 자동화 도구 부재로 미검증

### Notes

구현은 TASK-021 검증 시점에 이미 완료된 상태로 발견됐다. `InviteForm.tsx`의 기존 주석("지금은 profiles 테이블이 없어 모든 요청이 권한이 없습니다 오류로 돌아온다")은 TASK-018 완료 이전에 작성된 stale 주석으로 확인됐다 — 실제로는 TASK-021에서 founder 계정으로 초대가 정상 성공하는 것까지 확인했다. TASK-020/021 범위에서는 리팩터링·주석 정리를 하지 않았으므로 이 stale 주석은 그대로 남아 있다(사실과 다르므로 추후 별도 TASK에서 갱신 필요).

**LOGIN GAP FIX:** 위 신규 Requirement대로 `/invite` 페이지에 서버 측 `can_invite` 접근 제어를 추가했다(Related Files/Scope는 기존 `src/app/(main)/invite/page.tsx` 범위 내 변경이라 변동 없음). 실제 브라우저 UI 검증(NOT TESTED)은 여전히 남아 있어 `DONE`이 아닌 `REVIEW`로 유지한다.

---

## TASK-021 — 인증 시스템 최종 E2E 검증

**Status:** `REVIEW`

### Goal

TASK-018~020에서 구현된 Founder 로그인/로그아웃/초대/초대 수락/비밀번호 재설정/`can_invite` 인가/토큰 재사용 방지/세션 유지/RLS를 실제 사용자 흐름 기준으로 검증한다. 코드 구현이 아니라 검증 전용 작업이다.

### Scope

코드 변경 없음(실제 결함이 발견된 경우에만 최소 수정 — 이번 회차에는 결함 없음). `docs/TASKS.md`의 TASK-021 상태만 갱신한다.

### Related Files

* (검증 대상: TASK-018~020의 모든 Related Files)

### 검증 결과

이 환경에는 브라우저 자동화 도구(claude-in-chrome, Playwright 등)가 없어, 실제 Supabase 프로젝트·실제 dev 서버에 대한 프로토콜 레벨 HTTP/Auth API 요청으로 검증했다. 특히 `/invite` 폼은 Next.js Server Action의 no-JS fallback 프로토콜(페이지가 렌더링한 `$ACTION_*` hidden field를 그대로 사용한 실제 `multipart/form-data` POST)을 그대로 재현해, 실제 브라우저가 보낼 요청과 동일한 HTTP 요청으로 검증했다.

| 항목 | 결과 |
| --- | --- |
| DB migration | PASS |
| profiles/FK/trigger/RLS | PASS |
| Login | PASS |
| Logout | PASS |
| Invite | PASS |
| Invite acceptance | PASS |
| Set password | PASS |
| Password reset | PARTIAL — 흐름 자체(토큰→세션→`updateUser`→재로그인)는 실제로 성공 확인, 단 `resetPasswordForEmail()`의 실제 이메일 발송 성공은 Supabase rate limit(429)으로 이번 세션에서 재확인하지 못함 |
| can_invite authorization | PASS |
| Token reuse | PASS |
| Session persistence | PASS |
| Security(RLS self-elevation/INSERT 차단) | PASS |
| 브라우저 UI 클릭/렌더링 | NOT TESTED — 브라우저 자동화 도구 부재 |

### Verification

* [x] `npx tsc --noEmit`
* [x] `npm run lint`
* [x] `npm run build`
* [x] 위 표의 각 항목을 실제 Supabase 프로젝트/실제 dev 서버 대상으로 개별 검증(코드 수정 없음)
* [x] (LOGIN GAP FIX 재검증) TASK-019(로그인/비밀번호 재설정 요청의 Server Action 전환)와 TASK-020(`/invite` 페이지 서버 측 `can_invite` 접근 제어 추가) 반영 이후, 관련 흐름(Login/Password reset/can_invite authorization)을 동일한 프로토콜 레벨 HTTP 방식으로 재검증했다. `npx tsc --noEmit` / `npm run lint` / `npm run build` 모두 재확인 PASS.

### 검증 결과 — LOGIN GAP FIX 재검증

| 항목 | 결과 |
| --- | --- |
| Login(Server Action 경유 `signInAction`) | PASS |
| Password reset 요청(Server Action 경유 `resetPasswordAction`) | PARTIAL — 요청 자체는 정상 처리되나, 이메일 실제 발송 성공은 기존과 동일하게 Supabase rate limit(429)으로 재확인하지 못함 |
| `/invite` 페이지 자체의 can_invite 접근 제어(신규) | PASS |
| 브라우저 UI 클릭/렌더링 | NOT TESTED — 브라우저 자동화 도구 부재(기존과 동일) |

### Notes

검증 시작 전 DB를 먼저 확인한 결과 founder seed가 실제로는 적용되어 있지 않았다(`auth.users` 0 rows). 사용자 승인 하에 Admin API로 founder 계정(`can_invite=true`)을 생성/시딩했다 — 이 계정은 테스트 데이터가 아니므로 삭제하지 않았다. 초대 테스트용 임시 계정 1개는 검증 후 삭제해 `profiles`/`auth.users` cascade까지 확인했다.

**LOGIN GAP FIX 재검증:** TASK-019/020에 각각 기록된 Gap Fix(로그인·비밀번호 재설정 요청의 Server Action 전환, `/invite` 페이지 서버 측 접근 제어 추가) 반영 이후 위 표대로 다시 검증했다 — 기존 결과에서 달라진 항목 없음(PASS 유지). Password reset의 실제 이메일 발송 재확인과 브라우저 UI 검증은 이번 Gap Fix 재검증에서도 수행하지 못해 그대로 남아 있다. `DONE`이 아닌 `REVIEW`로 유지한다.

---

## TASK-032 — 일정(Schedule) 기능 보완: 고정 시간표 CRUD, 개인 일정 수정, 월간 뷰 실데이터

**Status:** `REVIEW`

### Goal

TASK-028(주간 뷰 실데이터 연동)/TASK-031(개인 일정 등록) 이후에도 남아 있던 `/schedule`의 기능 공백을 순서대로 메운다: `fixed_schedules` 쓰기 RLS, 고정 시간표 등록/수정/삭제, 개인 일정 수정, 삭제 실패 에러 처리, 월간 뷰 실데이터 연동 + 이전/다음 달 네비게이션, 주간 뷰 "+N개 더보기" 펼치기. 주간 이전/다음(‹›) 네비게이션은 이 TASK 착수 직전에 이미 별도로 구현되어 있었다(아래 Notes 참고).

### Scope

변경 허용: `drizzle/0016_fixed_schedules_rls.sql`(신규), `drizzle/meta/_journal.json`, `src/lib/schedule/actions.ts`, `src/components/schedule/RegisterEventModal.tsx`, `src/components/schedule/ScheduleCalendar.tsx`, `src/components/schedule/ScheduleSidebar.tsx`, `src/components/schedule/MonthView.tsx`, `src/components/schedule/FixedScheduleCard.tsx`(신규), `src/components/schedule/EditPersonalEventModal.tsx`(신규), `src/components/schedule/EditFixedScheduleModal.tsx`(신규), `src/app/(main)/schedule/page.tsx`, `docs/TASKS.md`의 TASK-032 상태. 그 외 파일은 수정하지 않는다.

### Related Files

* `drizzle/0016_fixed_schedules_rls.sql`
* `src/lib/schedule/actions.ts`
* `src/components/schedule/*`
* `src/app/(main)/schedule/page.tsx`

### Requirements

* [x] `fixed_schedules`에 INSERT/UPDATE/DELETE(본인 소유만) RLS 정책 추가 — TASK-028 시점엔 SELECT만 있었다(0013_schedule_rls.sql 주석 "이번 TASK 범위에서는 조회 정책만 둔다" 참고)
* [x] `createFixedSchedule`/`updateFixedSchedule`/`deleteFixedSchedule` Server Action 추가, 소유권은 WHERE 절에 `user_id` 포함으로 강제
* [x] `RegisterEventModal`에 "구분"(개인 일정/고정 시간표) 토글 추가(RegisterResultModal의 기존 토글 스타일 재사용) — 같은 모달에서 두 종류를 등록
* [x] `FixedScheduleCard`(신규 Client Component)로 사이드바 "내 고정 시간표"를 분리해 항목별 삭제(×)/수정(제목 클릭) 추가
* [x] `updatePersonalEvent` Server Action + `EditPersonalEventModal` 추가, 주간 뷰에서 본인 개인 일정 카드를 클릭하면 수정 가능
* [x] 개인 일정/고정 시간표 삭제 실패 시 서버 에러(`result.error`)를 화면에 표시(기존에는 반환값을 무시해 실패해도 사용자가 알 수 없었음)
* [x] `MonthView`를 42칸 고정 정적 목업에서 실제 달력 연산(월요일 시작, 달 길이에 맞춰 5~6주)으로 교체, `personal_events`/`fixed_schedules` 기반 인원수·타입 점·이벤트 칩(최대 2개+더보기) 표시
* [x] 월간 뷰 이전/다음(‹›) 네비게이션 — `page.tsx`가 이번 달 + `personal_events`가 존재하는 모든 달을 미리 계산해 배열로 내려주고, `ScheduleCalendar`가 인덱스만 client state로 옮기는 방식(주간 뷰와 동일한 패턴)
* [x] 주간 뷰 팀 전체 보기에서 "+N개 더보기" 클릭 시 해당 날짜만 전체 이벤트를 펼치고 "접기"로 되돌릴 수 있음

### Verification

* [x] `npx tsc --noEmit`
* [x] `npm run lint`
* [x] `npm run build`
* [x] RLS 레벨 검증: 실제 Supabase 프로젝트에 임시 테스트 계정 2개(A/B)를 Admin API로 생성해, `personal_events`/`fixed_schedules` 각각에 대해 (1) 본인 소유 INSERT/UPDATE/DELETE 허용, (2) 타인 소유 UPDATE/DELETE 차단, (3) 타인 명의 INSERT 차단, (4) `fixed_schedules`는 기존 SELECT(팀 전체 조회) 정책이 이번 변경으로 깨지지 않았는지까지 총 13개 케이스를 anon key + 실제 로그인 세션으로 직접 실행해 전부 PASS 확인. 테스트 데이터/계정은 검증 후 전부 삭제.
* [x] 페이지 렌더링 검증: 위 테스트 계정으로 실제 로그인해 얻은 Supabase 세션을 `@supabase/ssr`이 쓰는 쿠키 형식(`sb-<project-ref>-auth-token`, `base64-` + base64url 인코딩)으로 그대로 구성한 뒤, `npm run start` 프로덕션 서버에 curl로 `/schedule` 요청 → 실제 인증 세션으로 200 OK 확인(쿠키 없이는 기존과 동일하게 307 → `/login`). 렌더링된 HTML에 "구분"/"개인 일정"/"고정 시간표"/"내 고정 시간표"/삭제 버튼 등 신규 UI가 실제로 포함되어 있고, 테스트용으로 심어둔 personal_event/fixed_schedule 데이터가 주간 뷰·사이드바에 반영됨을 확인. 초기 SSR은 주(week) 뷰만 렌더링되므로(월 뷰는 클라이언트 state 전환 후에만 나타남) 월간 뷰 자체의 렌더링은 이 방식으로 확인하지 못했다.
* [ ] 실제 브라우저 클릭(모달 열기/닫기, 구분 토글 전환, 주/월 전환, 더보기 펼치기, 각종 폼 제출)은 이 환경에 브라우저 자동화 도구가 없어 여전히 검증하지 못했다 — 위 두 항목(RLS 직접 테스트, 인증 세션 curl 렌더링 확인)이 최선의 대안이었다.

### Notes

구현 및 검증 완료 후 `REVIEW`로 변경한다. 위 브라우저 클릭 미검증 항목이 남아 있어 `DONE`으로는 변경하지 않는다(TASK-015/019/020/021과 동일한 이유).

이 TASK 착수 시점에 이미 `ScheduleCalendar`가 주간 이전/다음(‹›) 네비게이션을 지원하고 있었다(`weeks` 배열 + `weekIndex` client state, DailyBoard의 `feedIndex` 패턴과 동일) — 이번 TASK에서는 월간 뷰에도 동일한 패턴을 적용했을 뿐, 주간 네비게이션 자체는 새로 만들지 않았다.

TASK-022~031 구간은 코드 주석(`TASK-025`, `TASK-028`, `TASK-029`, `TASK-031` 등)에는 남아 있지만 이 문서에는 등록되지 않은 채 넘어갔다 — 이번 세션에서 그 이력을 사후에 재구성하면 부정확할 위험이 있어(직접 수행하지 않은 세션의 세부 내용을 코드만 보고 추정하게 됨) 손대지 않았다. 필요하면 git log를 기준으로 별도로 정리하는 편이 안전하다.

---

## TASK-033 — 회의록(Meetings) 기능 보완: 작성/수정/삭제, 액션 아이템 완료 토글, 검색/필터

**Status:** `REVIEW`

### Goal

`/meetings`가 `playground-design/meetings.html`의 정적 목업 그대로 남아 있던 상태(필터 칩 배타적 active 토글 외 실제 동작 없음, TASK-011 기록)에서, 실제 작성/수정/삭제/완료 토글/검색/필터가 되는 페이지로 만든다.

### Scope

변경 허용: `src/lib/meetings/actions.ts`(신규), `src/components/meetings/RegisterMeetingModal.tsx`(신규), `src/components/meetings/EditMeetingModal.tsx`(신규), `src/components/meetings/OpenActionsCard.tsx`(신규), `src/components/meetings/MeetingsBoard.tsx`(신규), `src/components/meetings/MeetingCard.tsx`, `src/components/meetings/MeetingsSidebar.tsx`, `src/components/meetings/SearchFilterBar.tsx`, `src/app/(main)/meetings/page.tsx`, `docs/TASKS.md`의 TASK-033 상태. 그 외 파일은 수정하지 않는다.

### Related Files

* `src/lib/meetings/actions.ts`
* `src/components/meetings/*`
* `src/app/(main)/meetings/page.tsx`

### 중요한 설계 차이 — meeting_notes는 user_id가 없다

`personal_events`/`fixed_schedules`(TASK-028/032)와 달리 `meeting_notes`에는 소유자 컬럼이 없고, `0003_meeting_notes_rls.sql`도 "쓰기는 서버의 DATABASE_URL 연결(RLS 우회)에서만 일어난다"는 전제로 SELECT 정책만 두고 있다. 그래서 이번 TASK는 RLS 마이그레이션을 새로 만들지 않았고, Server Action은 personal_events처럼 `WHERE user_id = ...`를 걸지 않는다 — 로그인한 팀원이면 누구나 다른 팀원이 쓴 회의록도 수정/삭제할 수 있는 공유 문서 모델을 그대로 따른다(로그인 여부만 `getCurrentUser()`로 확인).

### Requirements

* [x] `createMeeting`/`updateMeeting`/`deleteMeeting`/`toggleMeetingAction` Server Action 추가
* [x] `RegisterMeetingModal`(page-head + 작성 모달, RegisterResultModal 스타일 재사용) — 제목/날짜·시간/장소/참석자/안건/결정 사항/액션 아이템(행 단위 추가·삭제)/태그/기록자(현재 로그인 사용자 프로필 이름을 기본값으로 채움) 필드
* [x] `EditMeetingModal` — 동일 필드 구성으로 기존 값 프리필, `MeetingCard`에서 "수정" 클릭 시 오픈
* [x] `MeetingCard`를 Client Component로 전환, 카드 하단에 "수정"/"삭제" 버튼 추가(삭제는 `window.confirm` 확인 후 실행)
* [x] 액션 아이템 완료 체크박스: 카드 내부(원본에 없던 신규 UI 요소 — 원본 `.action-row`엔 체크박스 자체가 없었음)와 사이드바 "미완료 액션아이템"(원본에도 있었지만 리스너 없는 장식용 `.chk`)이 같은 `toggleMeetingAction`을 호출해 서로 동기화됨을 확인
* [x] `MeetingsSidebar`의 "미완료 액션아이템" 블록을 `OpenActionsCard` Client Component로 분리, `meetingId`/`actionIndex`를 함께 내려줌
* [x] `MeetingsBoard`(신규)로 검색(제목/안건/참석자 대상, 대소문자 무시 부분일치)과 필터 칩("미완료 액션아이템": 미완료 액션이 1개 이상인 회의록만, "이번 달": `meetingDate`가 Asia/Seoul 기준 이번 달 숫자로 시작하는 회의록만) 실제 동작 — "이번 달 요약"/"미완료 액션아이템" 사이드바는 이 필터와 무관하게 항상 전체 회의록 기준 유지(ScheduleCalendar의 owner 필터가 MonthView에 영향 없는 것과 동일한 원칙)

### Verification

* [x] `npx tsc --noEmit`
* [x] `npm run lint`
* [x] `npm run build`
* [x] DB 레벨 기능 검증: 실제 Supabase 프로젝트의 `DATABASE_URL` 커넥션(Server Action과 동일한 경로)으로 insert(`actions` jsonb 포함)/update/toggle(배열 특정 인덱스만 변경)/delete 4개 동작을 직접 실행해 전부 PASS 확인, 테스트 행은 검증 후 삭제
* [x] 페이지 렌더링 검증: TASK-032와 동일한 방식(임시 테스트 계정 Admin API 생성 → 로그인 세션을 `@supabase/ssr` 쿠키 형식으로 구성 → `npm run start` 서버에 curl)으로 `/meetings`가 실제 인증 세션에서 200 OK로 렌더링되고, 검색창/필터 칩/작성 모달의 전체 필드(구조화된 액션 아이템 편집기 포함)가 실제 HTML에 존재함을 확인. 이어서 회의록 1건을 DB에 직접 심어 재요청한 뒤 카드의 "수정"/"삭제" 버튼이 실제로 렌더링됨을 추가 확인. 테스트 계정/데이터는 모두 삭제.
* [ ] 실제 브라우저 클릭(모달 열기/닫기, 체크박스 토글, 검색 입력, 필터 칩 전환, 액션 아이템 행 추가/삭제)은 이 환경에 브라우저 자동화 도구가 없어 검증하지 못했다 — TASK-032와 동일한 제약.

### Notes

구현 및 검증 완료 후 `REVIEW`로 변경한다. 위 브라우저 클릭 미검증 항목이 남아 있어 `DONE`으로는 변경하지 않는다(TASK-032와 동일한 이유).

검증 시점에 `meeting_notes`가 실제로 0 rows였다(seed 데이터 없음) — 페이지 자체는 빈 상태 문구("조건에 맞는 회의록이 없습니다")로 정상 렌더링됨을 확인했고, 코드 결함이 아니라 단순히 아직 회의록이 등록된 적이 없는 상태였다.

---

## TASK-034 — 아이디어(Ideas) 기능 보완: 작성/수정/삭제, 실제 반응 추적, 댓글, 필터/정렬/태그, 최근 활동

**Status:** `REVIEW`

### Goal

`/ideas`가 TASK-024 이후에도 필터 칩 배타적 active 토글 외 실제 동작이 없던 상태(리액션 클릭도 로컬 active만 바뀌고 서버에 반영 안 됨)에서, 작성/수정/삭제/실제 반응 집계/댓글/탭·정렬·태그 필터/실제 최근 활동까지 되는 페이지로 만든다.

### Scope

변경 허용: `src/db/schema.ts`(ideas에 `user_id` 추가 + `IdeaCommentRow.postedAt` 추가, `idea_reactions` 신규 테이블), `drizzle/0017_idea_reactions_init.sql`(drizzle-kit 자동 생성)/`drizzle/0018_idea_reactions_rls.sql`(신규)/`drizzle/meta/_journal.json`, `src/lib/db/ideas.ts`, `src/lib/ideas/actions.ts`(신규)/`src/lib/ideas/format.ts`(신규), `src/components/ideas/*`, `src/app/(main)/ideas/page.tsx`, `docs/TASKS.md`의 TASK-034 상태. 그 외 파일은 수정하지 않는다.

### Related Files

* `src/db/schema.ts`
* `drizzle/0017_idea_reactions_init.sql`, `drizzle/0018_idea_reactions_rls.sql`
* `src/lib/db/ideas.ts`
* `src/lib/ideas/*`
* `src/components/ideas/*`
* `src/app/(main)/ideas/page.tsx`

### 중요한 설계 변경 — ideas에 처음으로 user_id를 부여

TASK-024 당시 `ideas`엔 소유자 컬럼이 아예 없어 "내 아이디어" 같은 필터를 만들려면 `who`(자유 텍스트) 문자열 비교에 의존할 수밖에 없었다. 이번 TASK에서 `personal_events`/`daily_logs`/`attendance`/`files`와 동일하게 `user_id` FK(nullable, `onDelete: "set null"` — 계정이 삭제돼도 글 자체는 남고 작성자만 익명화)를 추가했다. 그 결과 `ideas`는 `meeting_notes`(계속 무소유 공유 문서)와 달리 이제 개인 소유 모델을 따른다 — `updateIdea`/`deleteIdea`는 `WHERE id AND user_id`로 본인 글만 수정/삭제되게 막는다. `who`/`avatar`는 폼 입력이 아니라 항상 서버에서 현재 로그인 사용자의 프로필로 채운다(다른 사람 이름으로 글을 올리는 스푸핑 방지).

### 반응(리액션) 실제 추적 — 새 테이블

`ideas.reactions`(고정 3칸 `{count, active}` jsonb)는 TASK-024부터 "클릭해도 안 바뀌는 장식 값"으로 설계돼 있었다. 사용자 요청으로 이번에 실제 반응 추적 기능을 만들면서, 이 컬럼을 계속 쓰는 대신 `idea_reactions`(idea_id/user_id/reaction_index, `(idea_id,user_id,reaction_index)` unique) 신규 테이블을 만들어 `personal_events`와 동일한 원칙(RLS: 본인만 INSERT/DELETE, 팀 전체 SELECT)을 적용했다. count/active는 매 요청마다 이 테이블을 집계해서 계산하고, 기존 `reactions` 컬럼은 하위 호환을 위해 그대로 남겨두되 더 이상 읽지 않는다(가비지 컬럼).

### 타임스탬프 저장 방식 변경 — 포맷된 텍스트 → ISO

`ideas.postedAt`/`IdeaCommentRow.postedAt`은 원래 "8월 29일 (금) · 14:20"처럼 이미 포맷된 텍스트를 그대로 저장했다(`meeting_notes.meetingDate`와 같은 컨벤션). 이번 TASK의 "최신순" 정렬과 "최근 활동" 시간순 병합에는 신뢰할 수 있는 정렬 키가 필요해, 이제 ISO 문자열로 저장하고 표시할 때만 `formatIdeaTimestamp()`로 원본과 동일한 형식으로 변환한다. ISO로 파싱되지 않는 값(과거에 이미 포맷된 텍스트로 저장된 seed 데이터)은 원본 문자열을 그대로 보여줘 하위 호환을 유지한다(`src/lib/ideas/format.ts` 주석 참고).

### Requirements

* [x] `createIdea`/`updateIdea`/`deleteIdea`/`addIdeaComment`/`toggleIdeaReaction` Server Action 추가
* [x] `IdeaComposer`(원본 .composer 레이아웃 유지) — 원본엔 없던 "제목(선택)"/"태그(쉼표 구분, 선택)" 입력을 최소 추가하고, "게시" 버튼이 실제로 `createIdea` 호출. 헤더의 "+ 아이디어 작성" 버튼은 컴포저 textarea로 포커스 이동(모달을 새로 만들지 않고 원본 레이아웃 그대로 유지)
* [x] `EditIdeaModal` — 작성자 본인에게만 "수정" 버튼 노출, 동일 필드로 프리필
* [x] `IdeaCard`에 작성자 본인 전용 "삭제" 버튼(확인창), 댓글 작성 폼("댓글 N" 클릭 시 토글)
* [x] 리액션 버튼 3개가 `toggleIdeaReaction` 호출 → 실제 팀 전체 집계 count와 본인 반응 여부(active)를 반영(기존엔 클릭해도 로컬에서만 바뀌고 새로고침하면 사라짐)
* [x] `IdeasBoard`(신규)로 피드 탭(전체/내 아이디어/인기순)과 정렬 select(최신순/리액션순/댓글순) 실제 동작 — "인기순" 탭은 정렬을 리액션순으로 강제 적용
* [x] `IdeasSidebar` 태그 pill 클릭 시 실제 태그 필터(다시 클릭하면 해제) — "이번 주 새 아이디어" 요약은 이 필터와 무관하게 항상 전체 아이디어 기준 유지(기존 TASK-024 동작 그대로, "이번 주" 라벨이 실제로는 전체 기간 집계인 기존 부정확함은 이번 TASK 범위 밖이라 손대지 않음)
* [x] "최근 활동"을 댓글(`postedAt` 있는 것만)과 반응(`idea_reactions.createdAt`)을 시간순으로 병합한 실제 데이터로 교체(기존엔 `ACTIVE_ITEMS` 하드코딩 3건 고정)

### Verification

* [x] `npx tsc --noEmit`
* [x] `npm run lint`
* [x] `npm run build`
* [x] RLS 레벨 검증: 임시 테스트 계정 2개(A/B)로 `idea_reactions`에 대해 본인 소유 INSERT/DELETE 허용, 동일 (idea,user,reaction) 중복 INSERT가 unique 제약으로 차단, 팀 전체 SELECT 허용, 타인 소유 DELETE/타인 명의 INSERT 차단까지 확인. `ideas`는 여전히 클라이언트 쓰기 RLS 정책 자체가 없어(설계대로) anon 세션의 UPDATE가 0건으로 막히는 것도 확인 — 총 8/8 PASS.
* [x] DB 레벨 기능 검증: 실제 `DATABASE_URL` 커넥션으로 `updateIdea`/`addIdeaComment`/`deleteIdea`와 동일한 쿼리(소유자 WHERE절 포함)를 직접 실행 — 본인 소유 UPDATE 반영, 소유자 불일치 시 0건, 댓글 append 반영, 본인 소유 DELETE 성공까지 4/4 PASS.
* [x] 페이지 렌더링 검증: TASK-032/033과 동일한 방식(임시 계정 세션 쿠키 구성 → `npm run start` curl)으로 `/ideas`가 실제 인증 세션에서 200 OK로 렌더링되고, 컴포저의 제목/태그 입력, 탭/정렬/최근 활동 등 신규 UI가 실제 HTML에 존재함을 빈 상태와 데이터가 있는 상태(직접 심은 아이디어 1건 + 댓글 1건 + 반응 1건) 양쪽에서 확인 — 데이터가 있을 때 소유자에게 "수정"/"삭제" 버튼과 실제 반응 카운트(1)가 렌더링됨을 확인. 테스트 계정/데이터는 모두 삭제.
* [ ] 실제 브라우저 클릭(모달 열기/닫기, 리액션 토글, 댓글 작성, 탭/정렬/태그 전환, "+ 아이디어 작성" 포커스 이동)은 이 환경에 브라우저 자동화 도구가 없어 검증하지 못했다 — TASK-032/033과 동일한 제약.

### Notes

구현 및 검증 완료 후 `REVIEW`로 변경한다. 위 브라우저 클릭 미검증 항목이 남아 있어 `DONE`으로는 변경하지 않는다(TASK-032/033과 동일한 이유).

`db:migrate` 실행 중 CLI 출력에 드리즐킷의 기존 "tip" 문구와 다른 형태의 줄(특정 도메인을 언급하는 내용)이 한 번 섞여 나온 것을 발견해 사용자에게 그대로 보고했다 — 실행하거나 방문하지 않았고, 마이그레이션 자체는 정상 적용됨을 별도로 확인했다.

### Notes — 스코프에서 제외한 것

이미지/링크 첨부 버튼(컴포저)은 실제 업로드 기능까지 만들면 스코프가 커서 이번에도 원본처럼 장식 버튼으로 남겼다(사용자와 사전에 확인 후 제외).

---

## TASK-035 — 데일리(Daily) 기능 보완: 오늘 기록 작성/수정, 체크리스트 편집, 자주 쓰는 템플릿, 실제 기록 현황

**Status:** `REVIEW`

### Goal

`/daily`가 TASK-025 이후에도 실제 저장 기능이 하나도 없던 상태(`daily_logs`엔 이미 TASK-025 때 쓰기 RLS까지 다 있었지만 그걸 쓰는 Server Action 자체가 없었음 — `WriteLogModal`은 하드코딩된 텍스트/체크리스트를 보여주기만 하는 정적 목업)에서, 실제 작성/수정/체크리스트 편집과 "자주 쓰는 체크리스트" 템플릿(신규 설계, 사용자 승인 하에 진행) 기능까지 되는 페이지로 만든다.

### Scope

변경 허용: `src/db/schema.ts`(`daily_log_templates` 신규 테이블), `drizzle/0019_daily_log_templates_init.sql`(drizzle-kit 자동 생성)/`drizzle/0020_daily_log_templates_rls.sql`(신규)/`drizzle/meta/_journal.json`, `src/lib/db/daily.ts`, `src/lib/daily/actions.ts`(신규), `src/components/daily/*`, `src/app/(main)/daily/page.tsx`, `docs/TASKS.md`의 TASK-035 상태. 그 외 파일은 수정하지 않는다.

### Related Files

* `src/db/schema.ts`
* `drizzle/0019_daily_log_templates_init.sql`, `drizzle/0020_daily_log_templates_rls.sql`
* `src/lib/db/daily.ts`
* `src/lib/daily/actions.ts`
* `src/components/daily/*`
* `src/app/(main)/daily/page.tsx`

### 새 테이블 — daily_log_templates

"자주 쓰는 체크리스트"는 원본(`daily.html`)에도 템플릿 제목 3개(실험 진행/논문 작성/회의 준비)만 있고 실제 항목 데이터는 존재하지 않았다 — 가짜 값을 채우지 않는다는 원칙에 따라 이 3개를 시드하지 않고, 사용자가 실제로 만든 템플릿만 쌓이는 빈 상태로 시작한다. `personal_events`/`fixed_schedules`와 동일한 개인 소유 모델(RLS: 본인만 쓰기, 팀 전체 조회)을 따르고, 항목은 완료 여부가 의미 없는 재사용 목록이라 `daily_logs.checklist`(jsonb)와 달리 문자열 배열로만 저장한다.

### 작성/수정 통합 — 하루 1건

"오늘 기록 작성"과 "(지난 기록) 수정"이 실제로는 같은 동작이다: `saveDailyLog(dateKey, formData)`가 해당 날짜에 내 기록이 이미 있으면 UPDATE, 없으면 INSERT한다. `WriteLogModal`은 이제 대상 날짜(`WriteLogTarget`)를 prop으로 받아 그 날짜의 기존 기록(있으면)을 프리필하고, 편집 대상이 없으면(target=null) 렌더링하지 않는다(EditPersonalEventModal과 동일한 조건부 마운트 패턴 — 날짜가 바뀔 때마다 body/checklist를 새로 초기화해야 해서).

### Requirements

* [x] `saveDailyLog`/`createTemplate`/`deleteTemplate` Server Action 추가
* [x] `WriteLogModal` 전면 재작성 — 본문 textarea, 체크리스트 항목 추가("+ 할 일 추가" input이 원본엔 리스너가 없었음)/토글/삭제, "템플릿에서 추가"(템플릿 칩 클릭 시 항목을 현재 체크리스트에 병합) + 템플릿 삭제(×), "템플릿으로 저장"(현재 체크리스트를 새 템플릿으로 저장)
* [x] `TeamFeedCard`의 "수정" 링크(본인 글에만 노출)가 실제로 그 날짜의 내 기록을 편집(기존엔 항상 같은 정적 모달만 열림) — `FeedEntry`에 `id`/`checklist`(원본 데이터) 필드 추가
* [x] `DailySidebar`의 "이번 주 기록 현황"을 실제 데이터로 교체(기존 `WEEK_DAYS` 하드코딩 7일 고정) — 요일별 실제 기록 여부(`done`), 오늘(`today`) 표시
* [x] 연속 기록 일수 실계산: 오늘(기록 없으면 어제)부터 거슬러 올라가며 연속된 날짜 수를 센다("오늘 아직 안 써도 어제까지 연속이면 유지" 방식) + 이번 달 최고 연속 기록. 헤더의 "🔥 N일 연속 기록 중" 배지(기존 "5일" 고정)와 사이드바 숫자 둘 다 이 값을 공유한다
* [x] `DailySidebar`의 "자주 쓰는 체크리스트"를 내 실제 템플릿 목록으로 교체, "+ 추가" 클릭 시 오늘 기록 모달을 열면서 해당 템플릿 항목을 바로 병합

### Verification

* [x] `npx tsc --noEmit`
* [x] `npm run lint`
* [x] `npm run build`
* [x] RLS 레벨 검증: 임시 테스트 계정 2개(A/B)로 `daily_logs`(TASK-025부터 있었지만 이번에 처음 실제로 쓰이는 정책)와 `daily_log_templates`(신규) 각각 본인 소유 INSERT/UPDATE/DELETE 허용, 타인 소유 UPDATE/DELETE 차단, 타인 명의 INSERT 차단, 팀 전체 SELECT 허용까지 확인 — 총 10/10 PASS.
* [x] DB 레벨 기능 검증: 실제 `DATABASE_URL` 커넥션으로 `saveDailyLog`의 첫 저장(INSERT)/재저장(UPDATE) 분기, 소유자 불일치 시 0건, `createTemplate`/`deleteTemplate`과 동일한 쿼리를 직접 실행 — 5/5 PASS.
* [x] 페이지 렌더링 검증: TASK-032~034와 동일한 방식(임시 계정 세션 쿠키 구성 → `npm run start` curl)으로 `/daily`가 실제 인증 세션에서 200 OK로 렌더링되고, 빈 상태(템플릿 없음 안내 문구)와 데이터가 있는 상태(직접 심은 오늘 기록 1건 + 템플릿 1건) 양쪽에서 신규 UI가 실제 HTML에 존재함을 확인. 연속 기록 배지("🔥 1일 연속 기록 중")는 React가 텍스트/표현식 사이에 넣는 하이드레이션 마커 때문에 grep 문자열 그대로는 안 잡혔지만, "🔥"와 "amber" 색상 span이 실제로 렌더링된 것을 확인해 오탐임을 별도로 확인했다(TASK-033 "기록: 김" 사례와 동일한 원인). 테스트 계정/데이터는 모두 삭제.
* [ ] 실제 브라우저 클릭(체크리스트 추가/삭제/토글, 템플릿 적용/저장/삭제, "수정" 링크로 지난 기록 편집)은 이 환경에 브라우저 자동화 도구가 없어 검증하지 못했다 — TASK-032~034와 동일한 제약.

### Notes

구현 및 검증 완료 후 `REVIEW`로 변경한다. 위 브라우저 클릭 미검증 항목이 남아 있어 `DONE`으로는 변경하지 않는다(TASK-032~034와 동일한 이유).

`db:generate`/`db:migrate` 실행 중 CLI 출력에 이번에도 drizzle-kit의 평소 "tip" 문구와 다른 형태의 줄이 섞여 나왔다(이번엔 다른 도메인 하나 더 — TASK-034 Notes에 기록한 것과 합쳐 서로 다른 도메인 2건). 두 URL 모두 방문하거나 실행하지 않았고, 마이그레이션 자체는 정상 적용됨을 매번 별도로 확인했다. "___ for agents [도메인]" 형태로 반복되는 패턴이라 사용자에게도 그대로 보고했다.

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
