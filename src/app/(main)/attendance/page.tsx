import { AttendanceList, type AttendanceMember } from "@/components/attendance/AttendanceList";
import { AttendanceRealtimeRefresh } from "@/components/attendance/AttendanceRealtimeRefresh";
import { CheckinCard } from "@/components/attendance/CheckinCard";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getAttendancePlansForDate, listAttendance } from "@/lib/db/attendance";
import { listProfiles } from "@/lib/db/profiles";
import { addDays } from "@/lib/date";

// TASK-027: DB 조회가 build 시점에 고정되지 않도록 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

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
 * playground-design/attendance.html 변환.
 * TASK-027: 하드코딩된 출석 현황 8명 대신 실제 profiles + 오늘의 attendance를
 * 조회해 병합한다.
 * QR 체크인(AGENTS.md 11.3절): 실제 체크인은 /attendance/checkin GET 라우트가
 * 처리하고 결과 화면(/attendance/checkin-result)으로 리다이렉트된다(로그인 없이
 * 체크인되는 개인 토큰도 있어, 결과 확인에 로그인을 요구하지 않는 별도 페이지로
 * 분리했다) — 여기서는 로그인 사용자 본인의 오늘 체크인/퇴근 여부만 CheckinCard에
 * 내려준다.
 */
export default async function AttendancePage() {
  const now = new Date();
  const todayKey = seoulDateKey(now);
  const tomorrowKey = addDays(todayKey, 1);
  const [user, roster, rows, planRows, nextPlanRows] = await Promise.all([
    getCurrentUser(),
    listProfiles(),
    listAttendance(),
    getAttendancePlansForDate(todayKey),
    getAttendancePlansForDate(tomorrowKey),
  ]);

  const todaysByUser = new Map<string, { checkedInAt: Date; checkedOutAt: Date | null }>();
  for (const row of rows) {
    if (seoulDateKey(row.checkedInAt) !== todayKey) continue;
    // 하루 여러 번 체크인한 경우 첫 체크인 시각을 사용한다(orderBy desc이므로
    // 나중에 만나는 값으로 덮어써서 가장 이른 시각이 남는다).
    todaysByUser.set(row.userId, { checkedInAt: row.checkedInAt, checkedOutAt: row.checkedOutAt });
  }
  const planByUser = new Map(planRows.map((row) => [row.userId, row]));
  // 퇴근하면서 등록한 "내일" 계획 — 등록한 당일에도 퇴근 옆에 미리 보여준다(다음날까지 기다릴 필요 없음).
  const nextPlanByUser = new Map(nextPlanRows.map((row) => [row.userId, row]));

  const members: AttendanceMember[] = roster.map((profile) => {
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
  const checkedInCount = members.filter((m) => m.status !== "off").length;
  const [y, m, d] = todayKey.split("-");
  const dow = WEEKDAY_KO[new Date(`${todayKey}T00:00:00+09:00`).getUTCDay()];
  const dateLabel = `${y}.${m}.${d} (${dow})`;

  return (
    <>
      <AttendanceRealtimeRefresh />
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">출석 인증</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">출석 인증</h1>
        </div>
        <p className="font-mono text-[12.5px] text-silk-dim">
          오늘 <b className="font-semibold text-teal">{checkedInCount} / {members.length}명</b> 체크인 · {dateLabel}
        </p>
      </div>

      <div className="mx-auto grid max-w-[1220px] grid-cols-[360px_1fr] items-start gap-[22px] px-7 pt-[26px] pb-[90px] max-[860px]:grid-cols-1">
        <CheckinCard
          checkedInAt={user ? todaysByUser.get(user.id)?.checkedInAt : undefined}
          checkedOutAt={user ? todaysByUser.get(user.id)?.checkedOutAt : undefined}
          userId={user?.id}
        />
        <AttendanceList members={members} />
      </div>
    </>
  );
}
