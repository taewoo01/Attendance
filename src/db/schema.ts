import { boolean, date, integer, jsonb, pgSchema, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

/**
 * Supabase가 관리하는 `auth.users`를 가리키는 최소 stub.
 * 이 프로젝트에서 이 테이블을 생성/변경하지 않는다 — `profiles.user_id`의
 * FK 대상을 Drizzle 스키마에서 표현하기 위한 참조 전용 선언이다.
 */
const authSchema = pgSchema("auth");
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

/**
 * TASK-018 최소 스키마. `can_invite`는 관리자 권한이 아니라 "다른 팀원을
 * 초대할 수 있는가"만 의미한다(실적/일정 등 다른 기능 권한과 무관, TASK-019 지시사항).
 * 기본값 false는 "신규 초대 팀원은 기본적으로 초대 권한이 없다"는 요구사항을
 * DB 레벨에서 보장한다. 초기 창업 멤버 4명은 별도 SQL로 true로 전환한다
 * (drizzle/sql/seed-founders.template.sql 참고).
 * 신규 행은 auth.users insert 트리거(0001 마이그레이션)가 자동 생성하며,
 * 앱 코드에서 profiles를 직접 insert하지 않는다.
 */
export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  name: text("name").notNull().default(""),
  role: text("role").notNull().default(""),
  contact: text("contact").notNull().default(""),
  canInvite: boolean("can_invite").notNull().default(false),
});

/**
 * 회의록 액션 아이템 1건. playground-design/meetings.html의 .mtg-card
 * 액션 아이템 구조를 그대로 반영한다(actions 컬럼에 jsonb 배열로 저장).
 */
export type MeetingActionRow = {
  text: string;
  avatar: string;
  who: string;
  due: string;
  dueVariant?: "soon" | "late";
  done?: boolean;
};

/**
 * TASK-023 최소 스키마. playground-design/meetings.html의 .mtg-card 필드를
 * 그대로 반영한다(date/place 등은 원본처럼 사람이 읽는 텍스트로 저장하고
 * 별도 포맷팅 로직을 새로 만들지 않는다).
 */
export const meetingNotes = pgTable("meeting_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull().default(""),
  meetingDate: text("meeting_date").notNull().default(""),
  place: text("place").notNull().default(""),
  attendees: text("attendees").array().notNull().default([]),
  agenda: text("agenda").array().notNull().default([]),
  decisions: text("decisions").array().notNull().default([]),
  actions: jsonb("actions").$type<MeetingActionRow[]>().notNull().default([]),
  tag: text("tag").notNull().default(""),
  recorder: text("recorder").notNull().default(""),
});

/**
 * playground-design/ideas.html의 .idea-card 댓글 1건. `postedAt`은 TASK-034에서
 * 댓글 작성 기능과 함께 추가했다(jsonb라 컬럼 마이그레이션은 필요 없다) — 기존에
 * 저장된 댓글(시딩 데이터 등)에는 이 필드가 없을 수 있어 optional로 둔다.
 */
export type IdeaCommentRow = {
  avatar: string;
  who: string;
  text: string;
  postedAt?: string;
};

/**
 * TASK-024 당시 `.react-btn` 클릭이 count를 바꾸지 않는 장식 인터랙션이라
 * 이 값을 "단순 조회 값"으로만 썼다. TASK-034부터는 실제 반응 여부를
 * `idea_reactions` 테이블(사용자별 행)에서 계산하고 이 컬럼은 더 이상 읽지
 * 않는다 — 컬럼 자체는 기존 데이터 보존을 위해 그대로 남겨둔다(가비지 컬럼,
 * 새 쓰기 경로 없음).
 */
export type IdeaReactionRow = {
  count: number;
  active: boolean;
};

/**
 * TASK-024 최소 스키마. playground-design/ideas.html의 .idea-card 필드를
 * 그대로 반영한다.
 * TASK-034: `userId`를 추가했다 — 원래 이 테이블엔 작성자 소유권 컬럼이 아예
 * 없어 "내 아이디어" 필터를 `who`(자유 텍스트) 문자열 비교로만 할 수 있었다.
 * 다른 모든 개인 소유 데이터(personal_events/daily_logs/attendance/files)가
 * `user_id` FK를 쓰는 것과 일관되게 맞춘다. 계정이 삭제돼도 팀 콘텐츠 자체는
 * 남아야 하므로(meeting_notes의 recorder와 같은 원칙) `onDelete: "set null"`로
 * 작성자만 익명화한다(행 자체는 삭제하지 않음).
 */
export const ideas = pgTable("ideas", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => authUsers.id, { onDelete: "set null" }),
  avatar: text("avatar").notNull().default(""),
  who: text("who").notNull().default(""),
  postedAt: text("posted_at").notNull().default(""),
  title: text("title").notNull().default(""),
  body: text("body").notNull().default(""),
  tags: text("tags").array().notNull().default([]),
  reactions: jsonb("reactions").$type<IdeaReactionRow[]>().notNull().default([]),
  comments: jsonb("comments").$type<IdeaCommentRow[]>().notNull().default([]),
});

/**
 * TASK-034 신규 테이블. 아이디어 카드의 리액션 버튼 3개(👍/❤️/💡) 중 하나를
 * 사용자가 눌렀다는 사실 1건 = 행 1개. (idea_id, user_id, reaction_index) 조합이
 * unique라 "같은 사람이 같은 버튼을 두 번 누르면 취소"(토글)를 행 존재 여부로
 * 바로 표현한다 — count는 매번 계산하지 않고 group by로 집계한다.
 */
export const ideaReactions = pgTable(
  "idea_reactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ideaId: uuid("idea_id")
      .notNull()
      .references(() => ideas.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    reactionIndex: integer("reaction_index").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("idea_reactions_unique").on(table.ideaId, table.userId, table.reactionIndex)],
);

/** playground-design/daily.html의 체크리스트 항목 1건. */
export type DailyLogChecklistItem = {
  text: string;
  done: boolean;
};

/**
 * TASK-025 최소 스키마. playground-design/daily.html의 팀 기록/지난 기록
 * 카드가 쓰는 실제 데이터만 저장한다. `check`("2/4 완료")/`pct`(50)는
 * checklist 배열에서 파생 가능해 별도 컬럼으로 두지 않는다. 날짜/시간
 * 표시("8월 31일 (월)", "09:14")도 loggedAt에서 매번 계산하고 별도로
 * 저장하지 않는다(중복 저장 금지, AGENTS.md 8절).
 */
export const dailyLogs = pgTable("daily_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  loggedAt: timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
  body: text("body").notNull().default(""),
  checklist: jsonb("checklist").$type<DailyLogChecklistItem[]>().notNull().default([]),
});

/**
 * TASK-035 신규 테이블. playground-design/daily.html의 "자주 쓰는 체크리스트"
 * (원본엔 템플릿 제목 3개만 있고 실제 항목 데이터는 존재하지 않았다 — 가짜
 * 값을 채우지 않는다는 원칙에 따라 시드하지 않고, 사용자가 직접 만든
 * 템플릿만 쌓이는 빈 상태로 시작한다). personal_events/fixed_schedules와
 * 동일한 개인 소유 모델(RLS: 본인만 쓰기, 팀 전체 조회)을 따른다. `items`는
 * 적용 시 `{ text, done: false }`로 펼쳐질 재사용 목록이라 완료 여부가
 * 의미 없어 daily_logs.checklist(jsonb)와 달리 문자열 배열로만 저장한다.
 */
export const dailyLogTemplates = pgTable("daily_log_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  title: text("title").notNull().default(""),
  items: text("items").array().notNull().default([]),
});

/**
 * TASK-026 최소 스키마. playground-design/results.html의 .res-row 필드를
 * 그대로 반영한다. `tag`("개인"/"팀")는 `team` boolean에서 파생 가능해
 * 별도 컬럼으로 두지 않는다. `file`/`metric_label`/`metric_value`는 원본처럼
 * 선택 항목이라 빈 문자열을 "없음"으로 취급한다(다른 테이블과 동일 컨벤션).
 * `createdAt`은 "최근 등록"(사이드바) 정렬/파생에 필요해 추가했다.
 * 일정 페이지 상세화와 동일하게(실적 페이지 상세화 #1/#2/#8) 이후 추가된 컬럼:
 * `userId`(작성자 — 등록 기능 자체가 없던 TASK-026 당시엔 없었다, ideas.userId와
 * 동일하게 nullable + onDelete set null), `link`(참고 링크, 선택), `teamMembers`
 * (구분이 "팀"일 때 참여자 목록, ideas.tags와 동일한 text[] 컨벤션). `file`(단일
 * 첨부파일 텍스트)은 기존 데이터 호환을 위해 그대로 두고, 여러 첨부파일은 별도
 * achievementFiles 테이블(1:N)로 관리한다(files 테이블의 Storage 업로드 패턴 재사용).
 */
export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  userId: uuid("user_id").references(() => authUsers.id, { onDelete: "set null" }),
  avatar: text("avatar").notNull().default(""),
  team: boolean("team").notNull().default(false),
  teamMembers: text("team_members").array().notNull().default([]),
  title: text("title").notNull().default(""),
  desc: text("desc").notNull().default(""),
  who: text("who").notNull().default(""),
  link: text("link").notNull().default(""),
  file: text("file").notNull().default(""),
  resultDate: text("result_date").notNull().default(""),
  metricLabel: text("metric_label").notNull().default(""),
  metricValue: text("metric_value").notNull().default(""),
});

/**
 * TASK(실적 페이지 상세화 #8): 실적 하나에 이미지/파일을 여러 개 첨부할 수 있어야
 * 해서 achievements.file(단일 text) 대신 1:N 테이블로 분리했다. Storage 업로드는
 * files 테이블(TASK-029)과 동일한 패턴(private 버킷 + storagePath 메타데이터만
 * DB에 저장, 다운로드는 서버가 발급하는 presigned URL)을 그대로 재사용한다.
 * `userId`는 업로드한 사람 추적용이라 nullable(achievements.userId와 동일 원칙) —
 * 첨부파일 자체의 존재/삭제는 achievementId(부모 실적)에 종속된다(cascade).
 */
export const achievementFiles = pgTable("achievement_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  achievementId: uuid("achievement_id")
    .notNull()
    .references(() => achievements.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => authUsers.id, { onDelete: "set null" }),
  storagePath: text("storage_path").notNull(),
  name: text("name").notNull().default(""),
  sizeBytes: integer("size_bytes").notNull().default(0),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * TASK-027 최소 스키마. playground-design/attendance.html의 QR 체크인 카드/
 * 출석 현황 목록이 쓰는 데이터만 저장한다. 실제 QR 토큰 발급/만료/중복사용
 * 검증(AGENTS.md 11.3절)은 이번 TASK 범위가 아니다 — 한 행은 "이 사용자가
 * 이 시각에 체크인했다"는 사실만 기록하고, 체크인 로직 자체는 구현하지 않는다.
 */
export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * TASK-028 최소 스키마. playground-design/schedule.html의 주간 뷰/사이드바가
 * 쓰는 데이터만 저장한다. 월간 뷰(42칸 그리드, 일자별 인원수 집계)는 정확한
 * 달력 연산이 이번 TASK 범위를 넘어서 정적으로 남긴다(page.tsx 참고).
 * personal_events는 특정 날짜 1회성 일정(eventDate), fixed_schedules는
 * 요일마다 반복되는 고정 시간표(dayOfWeek)로 원본의 두 이벤트 타입을
 * 그대로 반영한다.
 */
export const personalEvents = pgTable("personal_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  eventDate: date("event_date").notNull(),
  eventTime: text("event_time").notNull().default(""),
  /** 종료 시간은 선택 입력이라 nullable — 없으면 시작 시간만 표시한다. */
  eventEndTime: text("event_end_time"),
  title: text("title").notNull().default(""),
});

/**
 * dayOfWeek는 "월"/"화"/"수"/"목"/"금"/"토"/"일" 중 하나(원본 표기 그대로).
 * 한 row = 요일 하나(+ 시간 하나)다 — 등록 폼에서 여러 요일을 한 번에 고르면
 * (일정 페이지 고도화 #2) day마다 별도 row를 insert한다(createFixedSchedule
 * 참고). timeRange(자유 텍스트, "9~12" 등 표기가 들쭉날쭉했다) 대신
 * personal_events.eventTime/eventEndTime과 동일한 컨벤션으로 startTime/endTime을
 * 구조화된 값으로 저장한다.
 */
export const fixedSchedules = pgTable("fixed_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  dayOfWeek: text("day_of_week").notNull().default(""),
  startTime: text("start_time").notNull().default(""),
  /** 종료 시간은 선택 입력이라 nullable — personal_events.eventEndTime과 동일. */
  endTime: text("end_time"),
  title: text("title").notNull().default(""),
});

/**
 * TASK-029 최소 스키마. playground-design/files.html의 자료실. 실제 Supabase
 * Storage(private bucket "files")에 올라간 객체의 메타데이터만 저장한다 —
 * 파일 종류(pdf/doc/sheet/img)는 `name`의 확장자에서 매번 계산하고 별도로
 * 저장하지 않는다. `folder`는 원본의 폴더 그룹핑을 반영하되, 이번 TASK에는
 * 업로드 시 폴더를 선택하는 UI가 없어 항상 빈 문자열로 남는다(가짜 값 금지).
 */
export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  storagePath: text("storage_path").notNull(),
  name: text("name").notNull().default(""),
  folder: text("folder").notNull().default(""),
  sizeBytes: integer("size_bytes").notNull().default(0),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});
