import { Battery3D } from "@/components/home/Battery3D";
import { ConsoleLog } from "@/components/home/ConsoleLog";
import { FeatureList } from "@/components/home/FeatureList";
import { HeroSection } from "@/components/home/HeroSection";
import type { AttendanceMember } from "@/components/attendance/AttendanceList";
import { getCurrentUser } from "@/lib/auth/get-user";
import { listAttendance } from "@/lib/db/attendance";
import { listAchievements } from "@/lib/db/achievements";
import { listIdeas } from "@/lib/db/ideas";
import { listProfiles } from "@/lib/db/profiles";

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
  const [user, roster, attendanceRows, achievements, ideas] = await Promise.all([
    getCurrentUser(),
    listProfiles(),
    listAttendance(),
    listAchievements(),
    listIdeas(),
  ]);

  const todayKey = seoulDateKey(new Date());
  const todaysByUser = new Map<string, Date>();
  for (const row of attendanceRows) {
    if (seoulDateKey(row.checkedInAt) !== todayKey) continue;
    todaysByUser.set(row.userId, row.checkedInAt);
  }

  const attendance: AttendanceMember[] = roster.map((profile) => {
    const checkedInAt = todaysByUser.get(profile.userId);
    return {
      userId: profile.userId,
      avatar: profile.name.trim().charAt(0) || "?",
      name: profile.name,
      role: profile.role,
      time: checkedInAt ? seoulTime(checkedInAt) : "—",
      status: checkedInAt ? "on" : "off",
    };
  });

  const checkedInCount = attendance.filter((m) => m.status === "on").length;
  const myName = (user ? roster.find((p) => p.userId === user.id)?.name : undefined) ?? "팀원";
  const initialCheckedIn = user ? todaysByUser.has(user.id) : false;

  return (
    <>
      <HeroSection myName={myName} initialCheckedIn={initialCheckedIn} attendance={attendance}>
        <Battery3D />
      </HeroSection>
      <ConsoleLog
        checkedInCount={checkedInCount}
        totalCount={roster.length}
        resultsCount={achievements.length}
        ideasCount={ideas.length}
      />
      <FeatureList />
    </>
  );
}
