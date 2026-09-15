import { Battery3D } from "@/components/home/Battery3D";
import { ConsoleLog } from "@/components/home/ConsoleLog";
import { FeatureList } from "@/components/home/FeatureList";
import { HeroSection } from "@/components/home/HeroSection";
import { AttendanceRealtimeRefresh } from "@/components/attendance/AttendanceRealtimeRefresh";
import type { AttendanceMember } from "@/components/attendance/AttendanceList";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getAttendancePlansForDate, listAttendance } from "@/lib/db/attendance";
import { listAchievements } from "@/lib/db/achievements";
import { listIdeas } from "@/lib/db/ideas";
import { listMeetings } from "@/lib/db/meetings";
import { listProfiles } from "@/lib/db/profiles";
import { DOW_KO, addDays, mondayKeyOf, weekdayIndex } from "@/lib/date";

// TASK-030: DB 조회가 build 시점에 고정되지 않도록 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

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

export default async function Home() {
  const todayKey = seoulDateKey(new Date());
  const tomorrowKey = addDays(todayKey, 1);
  const [user, roster, attendanceRows, achievements, ideas, planRows, nextPlanRows, meetings] = await Promise.all([
    getCurrentUser(),
    listProfiles(),
    listAttendance(),
    listAchievements(),
    listIdeas(),
    getAttendancePlansForDate(todayKey),
    getAttendancePlansForDate(tomorrowKey),
    listMeetings(),
  ]);

  const todaysByUser = new Map<string, { checkedInAt: Date; checkedOutAt: Date | null }>();
  for (const row of attendanceRows) {
    if (seoulDateKey(row.checkedInAt) !== todayKey) continue;
    todaysByUser.set(row.userId, { checkedInAt: row.checkedInAt, checkedOutAt: row.checkedOutAt });
  }
  const planByUser = new Map(planRows.map((row) => [row.userId, row]));
  // 퇴근하면서 등록한 "내일" 계획 — 등록한 당일에도 퇴근 옆에 미리 보여준다(다음날까지 기다릴 필요 없음).
  const nextPlanByUser = new Map(nextPlanRows.map((row) => [row.userId, row]));

  const attendance: AttendanceMember[] = roster.map((profile) => {
    const today = todaysByUser.get(profile.userId);
    const plan = planByUser.get(profile.userId);
    const nextPlan = nextPlanByUser.get(profile.userId);
    return {
      userId: profile.userId,
      avatar: profile.name.trim().charAt(0) || "?",
      name: profile.name,
      role: profile.role,
      time: today ? seoulTime(today.checkedInAt) : "—",
      status: !today ? "off" : today.checkedOutAt ? "left" : "on",
      planLabel: plan?.label,
      planKind: plan?.kind,
      nextPlanLabel: nextPlan?.label,
      nextPlanKind: nextPlan?.kind,
    };
  });

  // "오늘 출석한 인원"이 기준이라 이미 퇴근한(left) 인원도 포함한다.
  const checkedInCount = attendance.filter((m) => m.status !== "off").length;
  const myName = (user ? roster.find((p) => p.userId === user.id)?.name : undefined) ?? "팀원";
  const myToday = user ? todaysByUser.get(user.id) : undefined;
  const initialCheckedIn = Boolean(myToday);
  const initialCheckedOut = Boolean(myToday?.checkedOutAt);

  // 콘솔 위젯: 이번 주(월~일, Asia/Seoul) 범위.
  const mondayKey = mondayKeyOf(todayKey);
  const sundayKey = addDays(mondayKey, 6);
  const resultsThisWeekCount = achievements.filter(
    (a) => a.resultDate && a.resultDate >= mondayKey && a.resultDate <= sundayKey,
  ).length;
  const ideasThisWeekCount = ideas.filter((idea) => {
    if (!idea.postedAt) return false;
    const postedDateKey = seoulDateKey(new Date(idea.postedAt));
    return postedDateKey >= mondayKey && postedDateKey <= sundayKey;
  }).length;

  const upcomingMeeting = meetings
    .filter((m) => m.meetingDateKey && m.meetingDateKey >= todayKey)
    .sort((a, b) => (a.meetingDateKey + a.meetingTime).localeCompare(b.meetingDateKey + b.meetingTime))[0];
  const nextMeetingLabel = upcomingMeeting
    ? `${DOW_KO[weekdayIndex(upcomingMeeting.meetingDateKey)]}요일${
        upcomingMeeting.meetingTime ? ` ${upcomingMeeting.meetingTime}` : ""
      }${upcomingMeeting.place ? `, ${upcomingMeeting.place}` : ""}`
    : "예정된 회의 없음";

  return (
    <>
      <AttendanceRealtimeRefresh />
      <HeroSection
        myName={myName}
        initialCheckedIn={initialCheckedIn}
        initialCheckedOut={initialCheckedOut}
        attendance={attendance}
      >
        <Battery3D />
      </HeroSection>
      <ConsoleLog
        checkedInCount={checkedInCount}
        totalCount={roster.length}
        resultsThisWeekCount={resultsThisWeekCount}
        ideasThisWeekCount={ideasThisWeekCount}
        nextMeetingLabel={nextMeetingLabel}
      />
      <FeatureList />
    </>
  );
}
