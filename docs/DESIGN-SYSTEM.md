# PLAY GROUND — Design System

> 이 문서는 `playground-design/` 내 10개 HTML 파일(`index.html`, `attendance.html`, `schedule.html`,
> `results.html`, `daily.html`, `ideas.html`, `meetings.html`, `files.html`, `team.html`, `about.html`)의
> 실제 인라인 `<style>` 코드를 직접 읽고 추출한 값만 기록한다.
>
> 값을 추측하거나 개선하지 않았다. 페이지마다 다른 값은 통합하지 않고 각 항목 또는
> [13. Page-specific Tokens](#13-page-specific-tokens)에 그대로 남겼다.
> Next.js/Tailwind 전환 작업 시 원본 HTML을 다시 열어보지 않고 이 문서만으로 값을 확인할 수 있게 하는 것이 목적이다.

---

## 1. Design Principles

원본 디자인에서 관찰되는 원칙(신규 제안 아님, 코드에서 읽어낸 특징):

- **다크 테마 고정.** 라이트 모드 대응 코드 없음.
- **모노스페이스로 "콘솔/장비" 톤 연출.** 라벨, 숫자, 타임스탬프, 배지, 태그에 `IBM Plex Mono`를 일관되게 사용.
- **패널 기반 카드 레이아웃.** 거의 모든 콘텐츠 블록이 `--bg-panel` 배경 + `--border` 테두리 + radius 조합.
- **페이지마다 `<style>` 전체를 복붙.** 공유 CSS 파일이 없고, 10개 파일이 거의 동일한 `:root`/`.statusbar`/`footer` 블록을 각자 보유. 세부 값 차이는 이 문서에서 하나씩 표시.
- **`index.html`만 장식성이 높음.** 3D 배터리 그래픽, 애니메이션 다수. 나머지 9개 페이지는 기능 위주의 대시보드 스타일.

---

## 2. Colors

### 2.1 공통 CSS 변수 (10개 파일 모두 동일하게 `:root`에 정의)

| 변수 | 값 | 용도(코드 기준) |
|---|---|---|
| `--bg` | `#081512` | 페이지 배경 |
| `--bg-panel` | `#0b1e19` | 카드/패널 배경 (`.card`, `.list-card`, `.side-card`, `.modal`, `.idea-card`, `.mtg-card`, `.id-card` 등) |
| `--bg-raised` | `#0e231d` | 패널 위에 얹는 2단 배경 (input, qr-frame, ev 태그, file-icon, tag-pill 배경 등) |
| `--teal` | `#48d9b0` | Primary accent. 버튼, active 상태, 강조 숫자, 체크 표시 |
| `--teal-dim` | `rgba(72,217,176,0.16)` | teal의 배경용 저채도 버전 (tag, badge, hover 배경) |
| `--amber` | `#e2a83f` | Secondary accent. 경고/보류 상태, 두 번째 강조색(고정 일정 dot, streak-chip, D-day 임박) |
| `--amber-dim` | `rgba(226,168,63,0.16)` | amber의 배경용 저채도 버전 |
| `--silk` | `#e7efec` | 기본 텍스트 |
| `--silk-dim` | `#86a199` | Muted 텍스트 (설명문, 보조 라벨) |
| `--silk-faint` | `#45594f` | Faint 텍스트 (타임스탬프, placeholder성 라벨, 비활성) |
| `--trace` | `rgba(231,239,236,0.028)` | `:root`에 정의되어 있으나 10개 파일 모두에서 실제 사용처를 찾지 못함(정의만 존재) |
| `--border` | `rgba(231,239,236,0.10)` | 전 영역 공통 1px border 색상 |

### 2.2 페이지 전용 변수

| 변수 | 값 | 파일 |
|---|---|---|
| `--copper` | `#c98c4f` | `index.html`만 |
| `--copper-dim` | `rgba(201,140,79,0.18)` | `index.html`만 |
| `--copper-line` | `rgba(201,140,79,0.4)` | `index.html`만 |
| `--via` | `rgba(231,239,236,0.09)` | `index.html`만 정의(다른 9개 파일 `:root`에는 없음). `index.html` 본문에서도 실제 사용처는 확인되지 않음 |

`--copper`/`--copper-dim`/`--copper-line`은 `index.html`의 `<style>` 블록에도 실제 사용된 흔적이 확인되지 않음(정의만 존재). Next.js 전환 시 삭제할지 유지할지는 별도 결정 필요 — 이 문서에서는 "존재하지만 미사용"으로만 기록한다.

### 2.3 변수화되지 않은 반복 색상 (하드코딩된 hex, 여러 페이지에서 동일 값 반복)

| 값 | 용도 | 등장 위치 |
|---|---|---|
| `#e2543f` | Danger/late 색상 | `badge-count` 배경(전 페이지 공통 statusbar), `file-icon.pdf` stroke(files.html), `action-due.late` color(meetings.html) |
| `rgba(226,84,63,0.16)` | Danger 배경 | `action-due.late` 배경(meetings.html) |
| `#04231b` | teal 배경 위 텍스트 색 | `.btn-primary` 텍스트, `.user-chip .avatar` 텍스트, `.avatar-sm` 텍스트, `.id-avatar` 텍스트 등 teal 배경 요소 전반 |
| `#157a5f` | 아바타 그라디언트 종료색 | `linear-gradient(155deg, var(--teal), #157a5f)` — user-chip/composer/log-author/idea-card 아바타 공통 패턴 |
| `#4a9eff` | doc 파일 아이콘 색 | `file-icon.doc` stroke — `files.html`에서만 1회 등장 |
| `#a3e635` → `#22c55e` → `#0e7a3c` | 로고 그라디언트 3-stop | 모든 페이지 인라인 `pg-logo` SVG `<linearGradient>` |

---

## 3. Typography

### 3.1 Font Family

```
body: 'IBM Plex Sans KR', -apple-system, sans-serif
.mono / 라벨·숫자·코드풍 UI: 'IBM Plex Mono', monospace
```

Google Fonts에서 로드하는 weight (모든 파일 동일한 `<link>` 사용):
`IBM Plex Mono: 400;500;600;700`, `IBM Plex Sans KR: 400;500;600`

### 3.2 Heading sizes (실제 사용된 값)

| 크기 | weight | 클래스 | 파일 |
|---|---|---|---|
| 64px (모바일 46px, `@media max-width:900px`) | 700 | `.wordmark` | index.html 전용 |
| 42px | 700 | `.about-h1` | about.html 전용 |
| 26px | 600 | `.page-title` | attendance/schedule/results/daily/ideas/meetings/files/team 공통 |
| 22px | 600 | `.section-title`(about) / `.greeting`(index) | 각 1곳 |
| 17px | — | `.vm-card h3` | about.html |
| 15.5px | 600 | `.mtg-title` | meetings.html |
| 15.5px | 700 | `.id-name` | team.html |
| 15px | 600 | `.idea-title` | ideas.html |
| 14.5px | 600 | `.list-head h3` / `.card-head h3` / `.modal-head h3` | attendance/results/daily/ideas/meetings/files 공통 |
| 13.5px | 600 | `.side-head`(results/ideas/meetings/files/daily) | 대부분 사이드바 소제목 |
| 13px | 600 | `.side-head`(schedule만 예외) | schedule.html |

### 3.3 Body / description text

| 크기 | line-height | 색상 | 사용처 |
|---|---|---|---|
| 16.5px | 1.6 | `--silk` | `.lead` (index hero) |
| 15.5px | 1.7 | `--silk-dim` | `.about-lead` |
| 13.5px | 1.6~1.65 | `--silk` | textarea 계열 (`.log-textarea`, `.form-input`) |
| 13px | 1.65 | `--silk-dim` | `.idea-body` |
| 12.8px | 1.6 | `--silk-dim` | `.mtg-agenda li`, `.action-text` |
| 12.5~12.8px | 1.55~1.75 | `--silk-dim` | `.res-desc`, `.biz-card p`, `.tl-desc`, `.log-desc` |
| 12px | 1.6 | `--silk-dim` | `.promo-card p` |

### 3.4 Label sizes (mono, letter-spacing 존재)

| 크기 | letter-spacing | 클래스 |
|---|---|---|
| 12px | 기본 | `.page-kicker` |
| 11px | 0.14em | `.card-label` |
| 10.5px | 0.1em | `.field-label`, `.section-label`(files) |
| 10px | 0.1em | `.mtg-section-label` |
| 12px | 0.08em | `.section-label`(about) |

### 3.5 숫자/코드 강조용 폰트 크기 (전부 `IBM Plex Mono`, weight 700)

- 30px — `.summary-num` (results, ideas)
- 28px — `.stat-num` (about)
- 24px — `.summary-split .n` (meetings)
- 22px(로고 wordmark 제외) 없음 / 17px — `.summary-split .n`(results)

### 3.6 Font weight 사용 값

`400`(기본 본문, 명시 안 함), `500`(nav 링크, user-chip, att-name), `600`(대부분의 heading·버튼·라벨), `700`(강조 숫자, 아바타 이니셜, wordmark, id-name)

### 3.7 Line-height 사용 값

실제 등장한 값: `0.92`(wordmark), `1.3`, `1.35`, `1.4`, `1.5`, `1.55`, `1.6`, `1.65`, `1.7`, `1.75`. 통일된 단일 line-height 토큰은 없음 — 텍스트 크기별로 개별 지정됨.

---

## 4. Spacing

값을 추측하지 않기 위해 실제 반복 등장한 수치만 나열한다. 통일된 스케일(예: 4px 배수)로 완전히 정리되어 있지는 않다.

### 4.1 페이지 공통 컨테이너

- `max-width: 1220px; margin:0 auto;` — statusbar-in, page-head, main, hero, footer 등 전 페이지 공통 컨테이너 패턴
- 좌우 페이지 패딩: `28px` (거의 모든 컨테이너의 좌우 padding)

### 4.2 반복되는 padding (요소 내부)

| 값 | 사용처 |
|---|---|
| `16px 28px` | `.statusbar-in` (전 페이지 공통) |
| `30px 28px 0` | `.page-head` (attendance/schedule/results/daily/ideas/meetings/files/team 공통) |
| `22px 28px 90px` | `.main` (results/daily/ideas 공통) |
| `26px 28px 90px` | `.main` (attendance) |
| `20px 28px 90px` / `18px 28px 90px` | `.main` (meetings / files) |
| `16px 28px 70px` | `.sched-main` (schedule) |
| `18px 22px` | `.list-head`, `.modal-head` (다수 페이지 공통) |
| `14px 22px` ~ `17px 22px` | row류(`.att-row`, `.res-row`, `.log-row`, `.file-row`) 내부 padding, 페이지마다 13~17px 사이에서 조금씩 다름 |
| `18px 18px 16px` | `.side-card` (results/ideas/meetings/files/daily 공통) |
| `15px 16px 14px` | `.side-card` (schedule만 다른 값) |

### 4.3 footer padding

- `32px 28px 56px` — index, attendance
- `28px 28px 56px` — results, daily, ideas, meetings, files, team, about
- `28px 28px 50px` — schedule

(footer padding-bottom 값이 페이지마다 50/56px로 다름 — 통일 안 됨, 사실 그대로 기록)

### 4.4 반복 gap

- `22px` — 메인 2단 그리드 column-gap (main/sched-main 공통 패턴)
- `18px` — 카드 그리드 gap (`.folder-grid`, `.team-grid`, `.biz-grid`, `.stats-strip`)
- `14px` — `.form-grid-2` gap, row 내부 gap 다수
- `10px` — 소형 flex gap 다수
- `8~9px` — 아이콘+텍스트 gap
- `6~7px` — 타이트한 인라인 gap (배지, dot+텍스트)

---

## 5. Radius

| 값 | 사용처 |
|---|---|
| `3~4px` | 작은 tag/뱃지(`.log-tag`, `.member-bar-track`), 얇은 progress bar |
| `5~7px` | `.filter-chip`, `.cal-nav button`, `.check-box`, 소형 아이콘 버튼 |
| `8px` | `.icon-btn`, `.btn`(index.html **제외** — 아래 6절 참고), `.folder-icon` |
| `9px` | `.folder-icon`(files) |
| `10px` | `.form-input`, `.form-textarea`, `.qr-frame`(attendance/results), `.search-box` |
| `12px` | `.side-card`, `.week-grid`, `.month-grid`, `.biz-card` |
| `14px` | `.card`, `.list-card`, `.modal`, `.mtg-card`, `.idea-card` — 콘텐츠 카드의 기본 radius |
| `16px` | `.id-card`(team), `.vm-card`(about) |
| `24px` | `.b3d-body`, `.b3d-gloss` (index 전용 3D 장식) |
| `999px` (pill) | `.status-pill`, `.streak-chip`, `.filter-chip`(team/ideas), `.type-toggle`, `.tag-pill`, `.react-btn`, `.badge-count`(50%와 별개로 pill류) |
| `50%` | 아바타, dot, 원형 아이콘 배경 전반 |

---

## 6. Borders

- 기본 테두리: `1px solid var(--border)` — 카드, input, 버튼(ghost), row 구분선 등 거의 모든 곳에서 동일하게 사용.
- 구분선(row divider): `border-bottom: 1px solid var(--border)`, 마지막 항목은 `:last-child{ border-bottom:none; }` 패턴이 리스트류 컴포넌트(`.att-row`, `.res-row`, `.log-row`, `.action-row`, `.agenda-item`, `.comment-row` 등)에서 반복됨.
- 강조 테두리:
  - `border-left: 2px solid var(--silk-faint)`(기본) / `var(--teal)`(personal) / `var(--amber)`(fixed) — 일정 이벤트 칩(`.ev`, `.m-ev`)
  - `border-left: 3px solid var(--teal)` — `.mtg-decision`
  - `box-shadow: inset 0 2px 0 var(--teal)` — 오늘 날짜 강조(`.day-col.today`, `.m-cell.today`)
- 점선/파선: `.check-add input{ border-bottom:1px dashed var(--border); }`, `.file-attach-btn{ border:1px dashed var(--border); }`
- Focus 테두리: `outline:none; border-color: var(--teal-dim);` — 모든 input 계열(`form-input`, `form-textarea`, `log-textarea`, `composer-input`은 border 없음이라 예외) 공통 focus 패턴

---

## 7. Shadows

box-shadow는 광범위하게 쓰이지 않고, 다음 위치에서만 실제 값이 확인됨:

| 클래스 | 값 | 파일 |
|---|---|---|
| `.qr-frame` | `0 0 0 1px rgba(72,217,176,0.06), 0 20px 40px -18px rgba(0,0,0,0.6)` | attendance.html, results.html에는 없음(results엔 qr-frame 자체가 없음) — **index.html**의 `.qr-frame`은 `0 0 0 1px rgba(72,217,176,0.06)`만 있고 두 번째 shadow 없음(페이지 간 미세 차이) |
| `.modal-card` | `0 30px 60px -15px rgba(0,0,0,0.6)` | index.html 전용 모달 패턴 |
| `.id-avatar` | `0 8px 20px rgba(72,217,176,0.25)` | team.html |
| `.b3d-body` | `0 30px 60px -15px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(0,0,0,0.4)` | index.html 전용 3D 장식 |
| `.b3d-charging`, `.b3d-hud` | 복합 shadow (`0 8px 20px rgba(0,0,0,0.4)` 등 + teal glow) | index.html 전용 3D 장식 |

`results.html`/`daily.html`/`ideas.html`/`meetings.html`의 `.modal`(모달 박스 자체)에는 box-shadow가 없음 — 오버레이 배경 dim(`rgba(4,10,8,0.65)`)만으로 depth 표현. **카드류(`.card`, `.list-card`, `.side-card`, `.idea-card`, `.mtg-card`, `.id-card` 등) 대부분은 box-shadow 없이 border만으로 구분됨.**

---

## 8. Layout

### 8.1 Page container

- 공통 max-width: **1220px**, `margin:0 auto`, 좌우 padding **28px**

### 8.2 Grid 구조 (페이지별로 다름 — 억지로 통합하지 않음)

| 페이지 | 그리드 | 컬럼 |
|---|---|---|
| index.html | `.hero` | `0.85fr 1fr` (900px 이하 `1fr`) |
| attendance.html | `.main` | `360px 1fr` (860px 이하 `1fr`) |
| schedule.html | `.sched-main` | `1fr 280px` (960px 이하 `1fr`) |
| results.html | `.main` | `1fr 300px` (960px 이하 `1fr`) |
| daily.html | `.main` | `1fr 300px` (960px 이하 `1fr`) |
| ideas.html | `.main` | `1fr 300px` (960px 이하 `1fr`) |
| meetings.html | `.main` | `1fr 300px` (960px 이하 `1fr`) |
| files.html | `.main` | `1fr 280px` (960px 이하 `1fr`) |
| team.html | `.team-grid` | `repeat(4,1fr)` (960px→`repeat(2,1fr)`, 560px→`1fr`) |
| about.html | `.vm-grid` 2열 / `.biz-grid` 3열 / `.stats-strip` 4열 | 섹션마다 별도 그리드, 사이드바 없음 |

같은 "본문+사이드바 2단" 레이아웃이라도 sidebar 폭이 `360px`(attendance), `280px`(schedule, files), `300px`(results, daily, ideas, meetings)로 페이지마다 다름 — 통일된 값이 아니라는 점을 그대로 기록.

### 8.3 세부 grid/flex 패턴

- Row 컴포넌트: `display:grid; grid-template-columns: [고정폭 아바타] 1fr [고정폭 메타...]` 형태 반복 (`.att-row`, `.res-row`, `.file-row`, `.action-row`)
- 캘린더: `display:grid; grid-template-columns: repeat(7,1fr)` (week-grid, month-grid)
- 폴더 카드: `display:grid; grid-template-columns: repeat(3,1fr)` (files.folder-grid, 700px 이하 `repeat(2,1fr)`)

### 8.4 Navigation / Footer

- Status bar: 고정 height 없음(콘텐츠 기반) — `.statusbar-in` padding `16px 28px`, flex `justify-content:space-between`. 로고(SVG 22×20) + nav(gap 16px) + 우측 아이콘/유저칩(gap 16px, about.html만 gap 12px).
- Footer: `display:flex; justify-content:space-between;` + `border-top:1px solid var(--border)`, 좌측 `PLAY_GROUND / rev.0.2`, 우측 `© 2026 PLAY GROUND` — 10개 파일 전부 동일한 텍스트/구조.

---

## 9. Responsive

### 9.1 공통 breakpoint

**960px** — 전 10개 파일에서 동일하게 `.statusbar-nav{ display:none; }` 처리. 대부분의 "본문+사이드바" 2단 그리드도 960px에서 `1fr`로 collapse (schedule, results, daily, ideas, meetings, files, team[→2열]).

### 9.2 페이지별 보조 breakpoint (통일되어 있지 않음, 실제 값만 나열)

| 파일 | breakpoint | 변경 내용 |
|---|---|---|
| index.html | 900px | hero `1fr`, wordmark 46px, scope-frame 높이 380px |
| index.html | 520px | `.modal-card.wide` 너비 92vw |
| attendance.html | 860px | `.main` `1fr`로 collapse (다른 페이지의 960px과 다름) |
| attendance.html | 560px | `.att-row` 컬럼 축소, `.att-status` 숨김 |
| schedule.html | 640px | week-grid/month-grid가 가로 스크롤 방식으로 전환 |
| results.html | 640px | `.res-row` 컬럼 축소, `.res-right` 줄바꿈 배치 |
| files.html | 700px | `.folder-grid` 3열→2열 |
| files.html | 640px | `.file-row` 컬럼 축소, size/date 숨김 |
| team.html | 560px | `.team-grid` 1열 |
| about.html | 800px | `.vm-grid` 1열 |
| about.html | 860px | `.biz-grid` 1열 |
| about.html | 760px | `.stats-strip` 2열 |

결론: **960px만 전 페이지 공통.** 나머지는 페이지 콘텐츠에 맞춰 개별적으로 정해져 있으며 하나의 breakpoint 체계로 통일되어 있지 않다.

---

## 10. Animation

### 10.1 범용으로 반복되는 hover/transition

- `border-color .15s ease` — `.folder-card:hover`, `.id-card:hover`
- `transform .15s ease` (translateY(-2px)) — `.id-card:hover`
- `background .15s ease` — `.bom-row:hover`(index)
- 그 외 대부분의 `:hover`(`.icon-btn:hover`, `.statusbar-nav a:hover`, `.tag-pill:hover` 등)는 **`transition` 속성이 선언되어 있지 않음** → 즉시 색상 전환(트랜지션 없음)이 기본값이며, 일부 컴포넌트에만 선택적으로 transition이 붙어 있음. 이 차이를 임의로 통일하지 않았다.

### 10.2 index.html 전용 keyframes (3D 배터리 히어로 장식)

`blink`, `b3d-float`, `b3d-glow2-pulse`, `b3d-floor-pulse`, `b3d-trace-flow`, `b3d-shine-sweep`, `b3d-shimmer`, `b3d-pulse`, `b3d-ring-spin` — 모두 `index.html`에만 존재하는 장식용 애니메이션이며 다른 페이지에 재사용되지 않는다.

### 10.3 모달 open/close 방식이 두 가지로 나뉨

- **index.html**: `.modal-overlay{ opacity:0; pointer-events:none; transition:opacity .18s ease; } .modal-overlay.open{ opacity:1; pointer-events:auto; }` — 페이드 애니메이션 있음.
- **results/daily.html**: `.modal-overlay{ display:none; } .modal-overlay.open{ display:flex; }` — transition 없이 즉시 표시/숨김.

두 패턴이 원본에 그대로 공존하며, 이 문서는 개선하지 않고 사실만 기록한다(Next.js 전환 시 통일 여부는 별도 결정 필요, [14절](#14-tailwind-migration-notes) 참고).

---

## 11. Icons

- 모든 아이콘은 **인라인 `<svg>`**, 별도 아이콘 폰트/스프라이트 파일 없음.
- 기본 스타일: `viewBox="0 0 24 24" fill="none" stroke-width="1.8"` — line icon 방식이 표준.
- 예외적으로 `stroke-width="2"`를 쓰는 곳: 아이디어 리액션 버튼(`ideas.html`의 좋아요/하트/전구 아이콘), user-chip의 chevron.
- 체크마크류(`daily.html` check-box 내부 svg)는 `stroke-width="3"`.
- 아이콘 실제 렌더 크기(반복 등장 값): `20×20`(로고), `16×16`(icon-btn), `17×17`(folder-icon, bom-icon), `15×15`(file-icon), `14×14`(comment-btn, file-attach-btn), `13×13`(react-btn), `12×12`(id-contact-row, user-chip chevron), `11×11`(res-file, card-foot link-out), `10×10`(check svg).
- 아이콘을 담는 컨테이너: `.icon-btn`(34×34, radius 8px, border 1px), `.folder-icon`(34×34, radius 9px, bg teal-dim), `.file-icon`(32×32, radius 8px, bg bg-raised + border).
- 색상 규칙: 기본 `stroke: var(--silk-dim)` 또는 `var(--silk-faint)`, hover/active 시 `var(--teal)`로 전환. `files.html`에서만 파일 유형별로 색을 분리(pdf `#e2543f`, doc `#4a9eff`, sheet `var(--teal)`, img `var(--amber)`).
- 로고(`pg-logo`)는 전 10개 파일에 동일한 인라인 SVG 마크업이 그대로 복붙되어 있음(그라디언트 정의 포함).

---

## 12. Component Patterns

### Button (`.btn`)
- 공통 골격: `font-weight:600; border:1px solid var(--border); cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:7~8px;`
- 폰트 크기/패딩은 페이지마다 다름: `13px/10px 16px`(대부분), `14px/13px 18px`(attendance), `13.5px/13px 20px`(index)
- Radius: **8px가 표준**이지만 **`index.html`의 `.btn`에는 `border-radius`가 선언되어 있지 않음** → index.html의 히어로 버튼만 각진 모서리로 렌더링됨(사실 그대로 기록, [13절](#13-page-specific-tokens) 참고)
- Variants: `.btn-primary`(`background:var(--teal); color:#04231b;`), `.btn-ghost`(`background:transparent; color:var(--silk); border-color:var(--border);`, `:disabled`는 `color:var(--silk-faint)`), `.btn-sm`(폰트/패딩 축소), `.btn-done`(index 전용, `color:var(--teal); border-color:var(--teal);`)

### Card
- 공통: `background:var(--bg-panel); border:1px solid var(--border);`
- Radius 14px(`.card`, `.list-card`, `.mtg-card`, `.idea-card`, `.modal`), 12px(`.side-card`), 16px(`.id-card`, `.vm-card`)
- 내부에 `-head`/`-body`/`-foot` 3분할 구조를 갖는 카드(`.list-head`+row들, `.modal-head`+`.modal-body`+`.modal-foot`)가 반복 패턴

### Modal
- 두 가지 구현이 공존([10.3절](#103-모달-openclose-방식이-두-가지로-나뉨) 참고): index.html의 페이드형 vs results/daily.html의 display 토글형
- 후자(results/daily)는 `.modal-head`(제목+X버튼) / `.modal-body`(폼) / `.modal-foot`(액션 버튼) 3분할 구조가 명확하고 재사용 가치가 높음

### Status Bar
- `.statusbar` > `.statusbar-in`(max-width 1220px, flex space-between) > `.statusbar-logo` + `.statusbar-nav` + `.statusbar-right`
- `about.html`만 우측 영역이 다름: badge/user-chip 대신 `.share-chip`("외부 공유 링크")를 노출 — 외부 공개 페이지라는 성격 반영(변경 아님, 원본에 이미 이렇게 되어 있음)

### Navigation
- `.statusbar-nav a` 수평 나열, `gap:16px`, active 링크만 `color:var(--teal)`
- 960px 이하에서 `display:none` — **모바일 대체 네비게이션(햄버거 메뉴 등)이 원본에 구현되어 있지 않음**

### User Chip
- `.user-chip`: 아바타(26×26 원형, `linear-gradient(155deg, var(--teal), #157a5f)`, mono bold 이니셜) + 이름 + chevron svg

### Row
- `.att-row`/`.res-row`/`.file-row`/`.log-row`/`.action-row` 등 grid 기반, `border-bottom:1px solid var(--border)` 구분선, `:last-child` 구분선 제거, hover 시 `background: rgba(231,239,236,0.02~0.035)` 옅은 하이라이트(일부만 적용됨, 전부는 아님)

### Badge
- `.badge-count`(알림 카운트, 원형 15×15, `#e2543f` 배경)
- `.log-tag`/`.idea-tag`/`.res-tag`(라벨형, radius 4px 또는 999px)
- `.metric-chip`, `.action-due`(default/`.soon`(amber)/`.late`(red) 3-state)

### Input
- `.form-input`/`.form-textarea`/`.log-textarea`: `background:var(--bg-raised); border:1px solid var(--border); border-radius:10px; padding:11~14px;`
- Focus: `outline:none; border-color:var(--teal-dim);`
- `.composer-input`/검색창(`.search-box input`)은 배경이 부모 컨테이너에 있어 자체는 `border:none; background:transparent;`인 예외 패턴

---

## 13. Page-specific Tokens

억지로 공통 토큰으로 합치지 않고 페이지 전용으로 남겨야 하는 값들.

- **index.html**
  - `--copper`, `--copper-dim`, `--copper-line`, `--via` 변수 (다른 페이지 `:root`에 없음, 실사용도 확인 안 됨)
  - `.btn`에 `border-radius` 선언이 없어 다른 페이지와 달리 버튼이 각짐
  - 3D 배터리 히어로 전체(`b3d-*` 클래스, keyframes 9종)
  - 콘솔 로그 위젯(`.console-window`), 기능 목록(`.bom-*`)
  - `.modal-overlay`가 opacity 트랜지션 방식
- **attendance.html**
  - `.main` grid가 `360px 1fr`(다른 페이지의 `1fr 300px`류와 다름)
  - grid collapse breakpoint가 `860px`(다른 페이지는 960px)
- **schedule.html**
  - 주간/월간 캘린더 그리드(`.week-grid`, `.month-grid`, `.m-cell` 등) — 다른 페이지에 없는 구조
  - `640px`에서 캘린더가 가로 스크롤로 전환되는 유일한 페이지
- **results.html**
  - `.member-bar-*`(팀원별 등록 현황 progress bar) 컴포넌트
  - `register-result` 모달(display 토글형)
- **daily.html**
  - `.streak-chip`, `.week-strip`/`.week-day`(요일별 완료 dot), `.checklist`/`.check-box` 컴포넌트
- **ideas.html**
  - `.composer`(게시물 작성 박스), `.idea-card` + `.idea-comments`(댓글 스레드), 리액션 버튼 3종(하트/좋아요/전구, 이모지 혼용)
- **meetings.html**
  - `.mtg-card`(안건/결정사항/액션아이템 3섹션 구조), `.search-row`+`.filter-chip` 검색바
- **files.html**
  - `.folder-grid`, `.file-row` + 파일 유형별 색상 코드(pdf `#e2543f`, doc `#4a9eff`, sheet teal, img amber)
  - `.storage-track`/`.storage-fill`(용량 그라디언트 바)
- **team.html**
  - `.id-card`(명함형 카드), `.id-punch`(상단 노치 장식), `.id-divider`(점선)
- **about.html**
  - `.about-hero`(중앙 정렬 히어로, 다른 페이지는 전부 좌측 정렬 구조)
  - `.vm-grid`, `.biz-grid`, `.timeline`, `.stats-strip` — 전부 이 페이지 전용
  - `.share-chip`("외부 공유 링크") — statusbar 우측 영역이 다른 페이지와 다름

---

## 14. Tailwind Migration Notes

아래는 **현재 디자인 값을 Tailwind로 옮길 때 필요한 theme/token 정의 방향 제안**이다. `tailwind.config`나 실제 코드는 수정하지 않았다.

1. **Color tokens**: `theme.extend.colors`에 2절의 공통 변수(`bg`, `bg-panel`, `bg-raised`, `teal`, `teal-dim`, `amber`, `amber-dim`, `silk`, `silk-dim`, `silk-faint`, `border`)를 그대로 등록. `copper*`/`via`는 index 전용임을 주석으로 남기고 실제 미사용이 확인되면 이관 여부를 별도로 결정.
2. **Font**: `next/font/google`로 `IBM_Plex_Sans_KR`(400/500/600), `IBM_Plex_Mono`(400/500/600/700)를 로드하고 `theme.extend.fontFamily.sans` / `.mono`로 매핑.
3. **Radius scale**: 5절에서 관찰된 실값(4, 5, 7, 8, 9, 10, 12, 14, 16, 24, 999)을 그대로 커스텀 `borderRadius` 키로 등록할지, Tailwind 기본 스케일(`rounded-md/lg/xl/2xl/full`)에 근사시킬지 결정 필요 — 특히 8px(버튼 표준)과 14px(카드 표준)는 컴포넌트 공통 토큰으로 우선 확정 권장.
4. **Breakpoint**: 공통 breakpoint가 `960px` 하나뿐이므로, Tailwind 기본 `lg(1024px)`를 그대로 쓸지 커스텀 `screens: { nav: '960px' }`를 추가할지 결정 필요. attendance(860px)·files(700px)·about(800/860/760px) 등 페이지별 값은 공통 스케일로 억지로 맞추지 말고 각 컴포넌트에서 arbitrary value(`max-[860px]:`)로 유지하는 것을 권장.
5. **Spacing**: `28px`(페이지 좌우 패딩), `1220px`(컨테이너 max-width)은 재사용 빈도가 매우 높으므로 `container` 설정 또는 커스텀 `maxWidth`/`spacing` 키로 먼저 확정 권장. 그 외 값(22/18/14/10px 등)은 Tailwind 기본 spacing 스케일과 상당 부분 겹치므로 유틸리티 클래스로 바로 대응 가능.
6. **Component 분기점(결정 필요 사항, 이 문서는 방향만 제시)**:
   - 모달 두 패턴(fade vs display-toggle) 중 하나로 통일할지, 용도별로 둘 다 유지할지
   - `index.html`의 `.btn`에만 radius가 없는 것을 버그로 보고 8px로 맞출지, 의도된 예외로 유지할지
   - 사이드바 폭(360/280/300px)을 하나의 `--sidebar-width` 토큰으로 통일할지, 페이지별 값을 유지할지
   - 위 세 가지는 디자인 값 자체를 바꾸는 결정이므로 이 문서에서 임의로 정하지 않았다.
7. **애니메이션**: `index.html` 전용 `b3d-*` keyframes는 Tailwind 유틸리티화하지 않고 컴포넌트 스코프 CSS(예: CSS Module)로 그대로 이식하는 것을 권장 — 재사용 가치가 없는 1회성 장식이기 때문.
8. **아이콘**: 별도 아이콘 라이브러리 도입 여부와 무관하게, 최소한 stroke-width 1.8 / 24×24 viewBox 표준과 크기별 실측값(11~20px)은 컴포넌트 props(`size`)로 재현 가능하도록 유지 권장.
