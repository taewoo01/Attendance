import { DOW_EN, DOW_KO, addDays, daysInMonth, mondayKeyOf, monthKeyOf, weekdayIndex } from "@/lib/date";

// 주/월 날짜 연산 자체는 실적 페이지(results)도 필요로 하는 범용 로직이라
// src/lib/date.ts로 뽑아냈다 — 여기서는 재수출만 해서 기존 import 경로
// ("@/lib/schedule/calendar"에서 addDays 등을 가져오던 컴포넌트들)를 그대로 유지한다.
export { DOW_EN, DOW_KO, addDays, addMonths, mondayKeyOf, monthKeyOf, weekdayIndex, weekRangeLabelOf, monthRangeLabelOf } from "@/lib/date";

/**
 * "내 일정" / "팀 전체(고정 일정 X)" / "팀 전체(고정 일정 O)" 3단 필터.
 * team-no-fixed는 개인 일정은 팀 전체와 동일하게 보여주되 fixed_schedules(반복
 * 고정 시간표)만 전부 제외한다 — 알바 등 고정 시간표가 개인 일정과 섞여 보기
 * 번거롭다는 피드백으로 추가했다.
 */
export type OwnerFilter = "me" | "team" | "team-no-fixed";

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
  startTime: string;
  endTime: string | null;
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
  /** 해당 날짜의 전체 이벤트(자르지 않은 원본) — "팀 전체" 뷰에서 몇 개까지 보여줄지/
   * 펼쳤는지는 MonthView가 (week view와 동일하게) 렌더링 시점에 결정한다. */
  events?: MonthEvent[];
};

/** "팀 전체" 뷰(owner !== "me")에서 하루에 보여줄 기본 이벤트 개수. week/month view가 공유한다. */
export const TEAM_CAP = 2;

/** 종료 시간이 있으면 "시작–종료", 없으면 시작 시간만. */
export function formatTimeRange(time: string, endTime?: string): string {
  return endTime ? `${time}–${endTime}` : time;
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
          time: formatTimeRange(f.startTime, f.endTime ?? undefined),
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
 * 일정 페이지 버그 수정: owner("내 일정"/"팀 전체(고정 O/X)") 필터를 week view와
 * 동일하게 여기서도 적용한다 — 예전에는 month view가 owner 토글과 무관하게 항상
 * 팀 전체를 보여줬다(원본 정적 목업이 month view는 필터링하지 않았던 것을 그대로
 * 따랐던 설계였으나, "내 일정"을 선택해도 다른 사람 일정이 보이는 문제로 이어졌다).
 * "내 일정"일 때는 week view처럼 개수 제한(TEAM_CAP) 없이 전부 보여준다.
 * "팀 전체(고정 일정 X)"는 fixed_schedules 자체를 아예 조회 대상에서 뺀다(dots도
 * "fixed" 점이 안 뜬다) — OwnerFilter 참고.
 * 버그 수정: 예전에는 여기서 이벤트를 TEAM_CAP개로 미리 잘라서 내려보내고 moreCount만
 * 계산해뒀는데, MonthView의 "+N개 더보기"가 그 잘린 나머지를 펼쳐서 보여줄 방법이
 * 없었다(week view는 ScheduleCalendar가 전체 목록을 들고 렌더링 시점에 펼침 여부를
 * 계산하는데, month view만 원본 자체가 이미 잘려 있었다) — 그래서 "더보기"를 눌러도
 * 아무 일도 없었다. 이제 이 함수는 자르지 않은 전체 events를 내려주고, 몇 개까지
 * 보여줄지/펼쳤는지는 week view와 동일하게 MonthView가 렌더링 시점에 결정한다.
 */
export function buildMonthCells(
  monthKey: string,
  todayKey: string,
  personalEvents: PersonalEventRow[],
  fixedSchedules: FixedScheduleRow[],
  userId: string | undefined,
  owner: OwnerFilter,
): MonthCell[] {
  const firstDateKey = `${monthKey}-01`;
  const lastDateKey = `${monthKey}-${String(daysInMonth(monthKey)).padStart(2, "0")}`;
  const gridStart = mondayKeyOf(firstDateKey);
  const gridEnd = addDays(mondayKeyOf(lastDateKey), 6);
  const isMine = (rowUserId: string) => userId !== undefined && rowUserId === userId;

  const cells: MonthCell[] = [];
  for (let dateKey = gridStart; dateKey <= gridEnd; dateKey = addDays(dateKey, 1)) {
    const dow = weekdayIndex(dateKey);
    const dayPersonalEvents = personalEvents.filter(
      (e) => e.eventDate === dateKey && (owner === "me" ? isMine(e.userId) : true),
    );
    const dayFixedSchedules =
      owner === "team-no-fixed"
        ? []
        : fixedSchedules.filter((f) => f.dayOfWeek === DOW_KO[dow] && (owner === "me" ? isMine(f.userId) : true));

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
        time: formatTimeRange(f.startTime, f.endTime ?? undefined),
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
      events: events.length > 0 ? events : undefined,
    });
  }

  return cells;
}
