import { Battery3D } from "@/components/home/Battery3D";
import { ConsoleLog } from "@/components/home/ConsoleLog";
import { FeatureList } from "@/components/home/FeatureList";
import { HeroSection } from "@/components/home/HeroSection";
import { AttendanceRealtimeRefresh } from "@/components/attendance/AttendanceRealtimeRefresh";
import type { AttendanceMember } from "@/components/attendance/AttendanceList";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getAttendancePlansForDate, latestAttendanceByUser, listAttendance, resolveAttendanceState } from "@/lib/db/attendance";
import { formatCheckinTime } from "@/lib/attendance/format";
import { listAchievements } from "@/lib/db/achievements";
import { listIdeas } from "@/lib/db/ideas";
import { listMeetings } from "@/lib/db/meetings";
import { listProfiles } from "@/lib/db/profiles";
import { DOW_KO, addDays, daysBetweenKeys, mondayKeyOf, seoulDateKey, weekdayIndex } from "@/lib/date";

// TASK-030: DB 조회가 build 시점에 고정되지 않도록 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

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

  // "오늘 체크인한 행"이 아니라 사용자별 "가장 최근 행"을 기준으로 상태를 판단한다
  // (밤새 상주해 날짜가 바뀌어도 퇴근 전까지 "on" 상태가 유지되도록 — resolveAttendanceState).
  const latestByUser = latestAttendanceByUser(attendanceRows);
  const planByUser = new Map(planRows.map((row) => [row.userId, row]));
  // 퇴근하면서 등록한 "내일" 계획 — 등록한 당일에도 퇴근 옆에 미리 보여준다(다음날까지 기다릴 필요 없음).
  const nextPlanByUser = new Map(nextPlanRows.map((row) => [row.userId, row]));

  const attendance: AttendanceMember[] = roster.map((profile) => {
    const state = resolveAttendanceState(latestByUser.get(profile.userId), todayKey);
    const plan = planByUser.get(profile.userId);
    const nextPlan = nextPlanByUser.get(profile.userId);
    return {
      userId: profile.userId,
      avatar: profile.name.trim().charAt(0) || "?",
      name: profile.name,
      role: profile.role,
      time: state ? formatCheckinTime(state.checkedInAt, todayKey) : "—",
      status: state?.status ?? "off",
      planLabel: plan?.label,
      planKind: plan?.kind,
      nextPlanLabel: nextPlan?.label,
      nextPlanKind: nextPlan?.kind,
    };
  });

  // "오늘 출석한 인원"이 기준이라 이미 퇴근한(left) 인원도 포함한다.
  const checkedInCount = attendance.filter((m) => m.status !== "off").length;
  const myName = (user ? roster.find((p) => p.userId === user.id)?.name : undefined) ?? "팀원";
  const myState = user ? resolveAttendanceState(latestByUser.get(user.id), todayKey) : null;
  const initialCheckedIn = Boolean(myState);
  const initialCheckedOut = Boolean(myState?.checkedOutAt);
  // 퇴근을 안 누른 채 며칠째 열려 있는 체크인이면 헤더 버튼에 그 사실을 바로 보여준다
  // (그냥 "오늘 출석 현황 보기"만 보이면 실제로 며칠째 상주 중인지 눌러보기 전엔 알 수 없다).
  const myResidentDays =
    myState && !myState.checkedOutAt ? daysBetweenKeys(seoulDateKey(myState.checkedInAt), todayKey) + 1 : null;

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
        residentDays={myResidentDays}
        attendance={attendance}
        userId={user?.id}
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
