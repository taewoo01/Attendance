export const DOW_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"];

export type PersonalEventRow = {
  id: string;
  userId: string;
  eventDate: string;
  eventTime: string;
  eventEndTime: string | null;
  title: string;
  name: string | null;
};

export type FixedScheduleRow = {
  id: string;
  userId: string;
  dayOfWeek: string;
  timeRange: string;
  title: string;
  name: string | null;
};

export type WeekEvent = {
  id?: string;
  time: string;
  /** personal 타입에만 존재 — 종료 시간을 입력하지 않았으면 undefined(시작 시간만 표시). */
  endTime?: string;
  label: string;
  type: "personal" | "fixed";
  owner: "me" | "team";
  /** personal 타입 + owner "me"일 때만 존재 — 수정 모달을 채우는 데 쓴다. */
  eventDate?: string;
  title?: string;
};
export type WeekDay = { dow: string; date: number; today?: boolean; events: WeekEvent[] };

export type MonthEvent = {
  id?: string;
  time: string;
  /** personal 타입에만 존재 — 종료 시간을 입력하지 않았으면 undefined(시작 시간만 표시). */
  endTime?: string;
  label: string;
  type: "personal" | "fixed";
  owner: "me" | "team";
  /** personal 타입 + owner "me"일 때만 존재 — 수정 모달을 채우는 데 쓴다. */
  eventDate?: string;
  title?: string;
};

export type MonthCell = {
  dateKey: string;
  date: number;
  muted?: boolean;
  today?: boolean;
  count?: string;
  dots?: Array<"personal" | "fixed">;
  events?: MonthEvent[];
  moreCount?: number;
};

const TEAM_CAP = 2;

/** dateKey("YYYY-MM-DD") 기준 +/- delta일. */
export function addDays(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

export function weekdayIndex(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function mondayKeyOf(dateKey: string): string {
  return addDays(dateKey, -((weekdayIndex(dateKey) + 6) % 7));
}

export function weekRangeLabelOf(mondayKey: string, sundayKey: string): string {
  const [startY, startM, startD] = mondayKey.split("-").map(Number);
  const [endY, endM, endD] = sundayKey.split("-").map(Number);
  return startY === endY && startM === endM
    ? `${startM}월 ${startD}일 – ${endD}일`
    : `${startM}월 ${startD}일 – ${endM}월 ${endD}일`;
}

/** dateKey("YYYY-MM-DD")의 "YYYY-MM" 부분. */
export function monthKeyOf(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function daysInMonth(monthKey: string): number {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** monthKey("YYYY-MM") 기준 +/- delta개월. */
export function addMonths(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split("-").map(Number);
  const total = y * 12 + (m - 1) + delta;
  const ny = Math.floor(total / 12);
  const nm = ((total % 12) + 12) % 12;
  return `${ny}-${String(nm + 1).padStart(2, "0")}`;
}

/** 종료 시간이 있으면 "시작–종료", 없으면 시작 시간만. */
export function formatTimeRange(time: string, endTime?: string): string {
  return endTime ? `${time}–${endTime}` : time;
}

export function monthRangeLabelOf(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return `${y}년 ${m}월`;
}

/**
 * 주어진 주(mondayKey)의 7일치 WeekDay[]를 계산한다. fixed_schedules는 요일
 * 기반 반복 일정이라 모든 주에 동일하게 적용되고, personal_events는 해당
 * 주의 날짜와 정확히 일치하는 것만 포함한다.
 */
export function buildWeekDays(
  mondayKey: string,
  todayKey: string,
  personalEvents: PersonalEventRow[],
  fixedSchedules: FixedScheduleRow[],
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
          endTime: e.eventEndTime ?? undefined,
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

/**
 * 주어진 달(monthKey="YYYY-MM")의 캘린더 그리드(월요일 시작, 5~6주 = 35~42칸)를
 * 계산한다. fixed_schedules는 요일 반복이라 그리드에 걸친 인접 달의 날짜(muted)에도
 * 동일하게 적용된다.
 */
export function buildMonthCells(
  monthKey: string,
  todayKey: string,
  personalEvents: PersonalEventRow[],
  fixedSchedules: FixedScheduleRow[],
  userId: string | undefined,
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
      ...dayPersonalEvents.map((e) => ({
        id: e.id,
        time: e.eventTime,
        endTime: e.eventEndTime ?? undefined,
        label: `${e.name ?? ""}·${e.title}`,
        type: "personal" as const,
        owner: (userId && e.userId === userId ? "me" : "team") as "me" | "team",
        eventDate: dateKey,
        title: e.title,
      })),
      ...dayFixedSchedules.map((f) => ({
        time: f.timeRange,
        label: `${f.name ?? ""}·${f.title}`,
        type: "fixed" as const,
        owner: (userId && f.userId === userId ? "me" : "team") as "me" | "team",
      })),
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
