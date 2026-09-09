import { weekdayIndex, DOW_KO, formatTimeRange } from "@/lib/schedule/calendar";
import { RegisterEventModal } from "@/components/schedule/RegisterEventModal";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { ScheduleSidebar, type AgendaItem, type FixedScheduleItem } from "@/components/schedule/ScheduleSidebar";
import { getCurrentUser } from "@/lib/auth/get-user";
import { listAttendance } from "@/lib/db/attendance";
import { getProfileByUserId } from "@/lib/db/profiles";
import { listFixedSchedules, listPersonalEvents } from "@/lib/db/schedule";

// TASK-028: DB 조회가 build 시점에 고정되지 않도록 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

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

/**
 * playground-design/schedule.html 변환.
 * TASK-028: #weekView와 <aside>(오늘 아젠다/내 고정 시간표)는 실제 personal_events
 * + fixed_schedules로 연동한다.
 * TASK-032: #monthView(달력 그리드, 일자별 인원수 집계)도 실제 데이터로 연동했다.
 * 주/월 그리드 계산과 이전·다음 네비게이션은 ScheduleCalendar(client)가 순수 날짜
 * 연산으로 직접 처리한다 — 이 페이지는 전체 personal_events/fixed_schedules 목록을
 * 그대로 내려주기만 한다(주/달에 이벤트가 있는지와 무관하게 항상 이동 가능해야 하므로,
 * "이벤트가 있는 주/달만" 미리 골라 내려주는 방식은 쓰지 않는다).
 */
export default async function SchedulePage() {
  const [user, personalEvents, fixedSchedules, attendanceRows] = await Promise.all([
    getCurrentUser(),
    listPersonalEvents(),
    listFixedSchedules(),
    listAttendance(),
  ]);

  const todayKey = seoulDateKey(new Date());

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
      .map((e) => ({
        time: e.eventTime,
        endTime: e.eventEndTime ?? undefined,
        title: `${e.name ?? ""} · ${e.title}`,
        sub: "개인 일정",
        ...(user && e.userId === user.id ? { id: e.id, eventDate: e.eventDate, rawTitle: e.title } : {}),
      })),
    ...fixedSchedules
      .filter((f) => f.dayOfWeek === DOW_KO[weekdayIndex(todayKey)])
      .map((f) => ({
        time: formatTimeRange(f.startTime, f.endTime ?? undefined),
        title: `${f.name ?? ""} · ${f.title}`,
        sub: "고정 일정",
      })),
  ];

  const myFixedSchedule: FixedScheduleItem[] = fixedSchedules
    .filter((f) => user && f.userId === user.id)
    .map((f) => ({
      id: f.id,
      day: f.dayOfWeek,
      title: f.title,
      time: formatTimeRange(f.startTime, f.endTime ?? undefined),
      startTime: f.startTime,
      endTime: f.endTime ?? undefined,
    }));

  const allFixedSchedule: FixedScheduleItem[] = fixedSchedules.map((f) => ({
    id: f.id,
    day: f.dayOfWeek,
    title: f.title,
    time: formatTimeRange(f.startTime, f.endTime ?? undefined),
    startTime: f.startTime,
    endTime: f.endTime ?? undefined,
    name: f.name ?? undefined,
    userId: f.userId,
  }));

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
          personalEvents={personalEvents}
          fixedSchedules={fixedSchedules}
          todayKey={todayKey}
          userId={user?.id}
        />
        <ScheduleSidebar
          todayLabel={todayLabel}
          agenda={agenda}
          fixedSchedule={myFixedSchedule}
          allFixedSchedule={allFixedSchedule}
          userId={user?.id}
        />
      </div>
    </>
  );
}
