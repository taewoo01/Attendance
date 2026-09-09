import type { MonthCell, MonthData } from "@/components/schedule/MonthView";
import { RegisterEventModal } from "@/components/schedule/RegisterEventModal";
import { ScheduleCalendar, type WeekData, type WeekDay } from "@/components/schedule/ScheduleCalendar";
import { ScheduleSidebar, type AgendaItem, type FixedScheduleItem } from "@/components/schedule/ScheduleSidebar";
import { getCurrentUser } from "@/lib/auth/get-user";
import { listAttendance } from "@/lib/db/attendance";
import { getProfileByUserId } from "@/lib/db/profiles";
import { listFixedSchedules, listPersonalEvents } from "@/lib/db/schedule";

// TASK-028: DB 조회가 build 시점에 고정되지 않도록 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

const DOW_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"];

/** Asia/Seoul 기준 캘린더 날짜 키(YYYY-MM-DD). */
function seoulDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(date);
}

function seoulTime(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function addDays(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

function weekdayIndex(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function mondayKeyOf(dateKey: string): string {
  return addDays(dateKey, -((weekdayIndex(dateKey) + 6) % 7));
}

function weekRangeLabelOf(mondayKey: string, sundayKey: string): string {
  const [startY, startM, startD] = mondayKey.split("-").map(Number);
  const [endY, endM, endD] = sundayKey.split("-").map(Number);
  return startY === endY && startM === endM
    ? `${startM}월 ${startD}일 – ${endD}일`
    : `${startM}월 ${startD}일 – ${endM}월 ${endD}일`;
}

/**
 * 주어진 주(mondayKey)의 7일치 WeekDay[]를 계산한다. fixed_schedules는 요일
 * 기반 반복 일정이라 모든 주에 동일하게 적용되고, personal_events는 해당
 * 주의 날짜와 정확히 일치하는 것만 포함한다.
 */
function buildWeekDays(
  mondayKey: string,
  todayKey: string,
  personalEvents: Awaited<ReturnType<typeof listPersonalEvents>>,
  fixedSchedules: Awaited<ReturnType<typeof listFixedSchedules>>,
  userId: string | undefined,
): WeekDay[] {
  return Array.from({ length: 7 }, (_, i) => addDays(mondayKey, i)).map((dateKey) => {
    const dow = weekdayIndex(dateKey);
    const events: WeekDay["events"] = [
      ...personalEvents
        .filter((e) => e.eventDate === dateKey)
        .map((e) => ({
          id: e.id,
          time: e.eventTime,
          label: `${e.name ?? ""} · ${e.title}`,
          type: "personal" as const,
          owner: (userId && e.userId === userId ? "me" : "team") as "me" | "team",
          eventDate: dateKey,
          title: e.title,
        })),
      ...fixedSchedules
        .filter((f) => f.dayOfWeek === DOW_KO[dow])
        .map((f) => ({
          time: f.timeRange,
          label: `${f.name ?? ""} · ${f.title}`,
          type: "fixed" as const,
          owner: (userId && f.userId === userId ? "me" : "team") as "me" | "team",
        })),
    ];
    return {
      dow: DOW_EN[dow],
      date: Number(dateKey.split("-")[2]),
      today: dateKey === todayKey,
      events,
    };
  });
}

const TEAM_CAP = 2;

/** dateKey("YYYY-MM-DD")의 "YYYY-MM" 부분. */
function monthKeyOf(dateKey: string): string {
  return dateKey.slice(0, 7);
}

function daysInMonth(monthKey: string): number {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/**
 * 주어진 달(monthKey="YYYY-MM")의 캘린더 그리드(월요일 시작, 5~6주 = 35~42칸)를
 * 계산한다. TASK-032 이전에는 42칸 고정 정적 목업이었지만(page.tsx 옛 Notes),
 * 이제 달 길이에 맞춰 정확히 계산한다. fixed_schedules는 요일 반복이라 그리드에
 * 걸친 인접 달의 날짜(muted)에도 동일하게 적용된다.
 */
function buildMonthCells(
  monthKey: string,
  todayKey: string,
  personalEvents: Awaited<ReturnType<typeof listPersonalEvents>>,
  fixedSchedules: Awaited<ReturnType<typeof listFixedSchedules>>,
): MonthCell[] {
  const firstDateKey = `${monthKey}-01`;
  const lastDateKey = `${monthKey}-${String(daysInMonth(monthKey)).padStart(2, "0")}`;
  const gridStart = mondayKeyOf(firstDateKey);
  const gridEnd = addDays(mondayKeyOf(lastDateKey), 6);

  const cells: MonthCell[] = [];
  for (let dateKey = gridStart; dateKey <= gridEnd; dateKey = addDays(dateKey, 1)) {
    const dow = weekdayIndex(dateKey);
    const dayPersonalEvents = personalEvents.filter((e) => e.eventDate === dateKey);
    const dayFixedSchedules = fixedSchedules.filter((f) => f.dayOfWeek === DOW_KO[dow]);

    const events: MonthCell["events"] = [
      ...dayPersonalEvents.map((e) => ({ time: e.eventTime, label: `${e.name ?? ""}·${e.title}`, type: "personal" as const })),
      ...dayFixedSchedules.map((f) => ({ time: f.timeRange, label: `${f.name ?? ""}·${f.title}`, type: "fixed" as const })),
    ];

    const dots: Array<"personal" | "fixed"> = [
      ...(dayPersonalEvents.length > 0 ? (["personal"] as const) : []),
      ...(dayFixedSchedules.length > 0 ? (["fixed"] as const) : []),
    ];

    const peopleCount = new Set([...dayPersonalEvents.map((e) => e.userId), ...dayFixedSchedules.map((f) => f.userId)]).size;

    cells.push({
      dateKey,
      date: Number(dateKey.split("-")[2]),
      muted: monthKeyOf(dateKey) !== monthKey,
      today: dateKey === todayKey,
      count: peopleCount > 0 ? `${peopleCount}명` : undefined,
      dots: dots.length > 0 ? dots : undefined,
      events: events.length > 0 ? events.slice(0, TEAM_CAP) : undefined,
      moreCount: events.length > TEAM_CAP ? events.length - TEAM_CAP : 0,
    });
  }

  return cells;
}

/**
 * playground-design/schedule.html 변환.
 * TASK-028: #weekView와 <aside>(오늘 아젠다/내 고정 시간표)는 실제 personal_events
 * + fixed_schedules로 연동한다.
 * TASK-032: #monthView(달력 그리드, 일자별 인원수 집계)도 실제 데이터로 연동했다
 * (이전에는 42칸 정적 목업이었다 — git history 참고).
 */
export default async function SchedulePage() {
  const [user, personalEvents, fixedSchedules, attendanceRows] = await Promise.all([
    getCurrentUser(),
    listPersonalEvents(),
    listFixedSchedules(),
    listAttendance(),
  ]);

  const todayKey = seoulDateKey(new Date());
  const currentMondayKey = mondayKeyOf(todayKey);

  // 주간 이전/다음(‹›) 네비게이션 대상: 이번 주 + personal_events가 존재하는 모든 주.
  // fixed_schedules는 요일 반복이라 매주 동일하게 적용되므로 대상 주 목록에 영향을 주지 않는다.
  const mondayKeys = new Set<string>([currentMondayKey]);
  for (const e of personalEvents) {
    mondayKeys.add(mondayKeyOf(e.eventDate));
  }

  const weeks: WeekData[] = Array.from(mondayKeys)
    .sort((a, b) => (a < b ? 1 : -1)) // 최신 주가 앞에 오도록 내림차순
    .map((weekMondayKey) => {
      const sundayKey = addDays(weekMondayKey, 6);
      return {
        mondayKey: weekMondayKey,
        weekDays: buildWeekDays(weekMondayKey, todayKey, personalEvents, fixedSchedules, user?.id),
        rangeLabel: weekRangeLabelOf(weekMondayKey, sundayKey),
      };
    });

  const currentWeekIndex = weeks.findIndex((w) => w.mondayKey === currentMondayKey);

  // 월간 이전/다음(‹›) 네비게이션 대상: 이번 달 + personal_events가 존재하는 모든 달.
  const currentMonthKey = monthKeyOf(todayKey);
  const monthKeys = new Set<string>([currentMonthKey]);
  for (const e of personalEvents) {
    monthKeys.add(monthKeyOf(e.eventDate));
  }

  const months: MonthData[] = Array.from(monthKeys)
    .sort((a, b) => (a < b ? 1 : -1)) // 최신 달이 앞에 오도록 내림차순
    .map((mKey) => {
      const [y, m] = mKey.split("-").map(Number);
      return {
        monthKey: mKey,
        rangeLabel: `${y}년 ${m}월`,
        cells: buildMonthCells(mKey, todayKey, personalEvents, fixedSchedules),
      };
    });

  const currentMonthIndex = months.findIndex((mo) => mo.monthKey === currentMonthKey);

  const myCheckinToday = user
    ? attendanceRows.find((row) => row.userId === user.id && seoulDateKey(row.checkedInAt) === todayKey)
    : undefined;
  const myProfile = user ? await getProfileByUserId(user.id) : null;
  const myName = myProfile?.name;

  const agenda: AgendaItem[] = [
    ...(myCheckinToday
      ? [{ time: seoulTime(myCheckinToday.checkedInAt), title: `${myName ?? "나"} 체크인`, sub: "DAY" }]
      : []),
    ...personalEvents
      .filter((e) => e.eventDate === todayKey)
      .map((e) => ({ time: e.eventTime, title: `${e.name ?? ""} · ${e.title}`, sub: "개인 일정" })),
    ...fixedSchedules
      .filter((f) => f.dayOfWeek === DOW_KO[weekdayIndex(todayKey)])
      .map((f) => ({ time: f.timeRange, title: `${f.name ?? ""} · ${f.title}`, sub: "고정 일정" })),
  ];

  const myFixedSchedule: FixedScheduleItem[] = fixedSchedules
    .filter((f) => user && f.userId === user.id)
    .map((f) => ({ id: f.id, day: f.dayOfWeek, title: f.title, time: f.timeRange }));

  const [, tm, td] = todayKey.split("-").map(Number);
  const todayLabel = `${tm}월 ${td}일 (${DOW_KO[weekdayIndex(todayKey)]})`;

  return (
    <>
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">일정</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">일정</h1>
        </div>
        <RegisterEventModal />
      </div>

      <div className="mx-auto grid max-w-[1220px] grid-cols-[1fr_280px] items-start gap-[18px] px-7 pt-4 pb-[70px] max-[960px]:grid-cols-1">
        <ScheduleCalendar
          weeks={weeks}
          initialWeekIndex={currentWeekIndex}
          months={months}
          initialMonthIndex={currentMonthIndex}
        />
        <ScheduleSidebar todayLabel={todayLabel} agenda={agenda} fixedSchedule={myFixedSchedule} />
      </div>
    </>
  );
}
