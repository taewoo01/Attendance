import { AttendanceList, type AttendanceMember } from "@/components/attendance/AttendanceList";
import { AttendanceRealtimeRefresh } from "@/components/attendance/AttendanceRealtimeRefresh";
import { CheckinCard } from "@/components/attendance/CheckinCard";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getAttendancePlansForDate, latestAttendanceByUser, listAttendance, resolveAttendanceState } from "@/lib/db/attendance";
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

/** 밤새 상주해 체크인이 어제 날짜인 채로 아직 "on" 상태인 경우, 시각만 보여주면 오늘 체크인한 것처럼 보여 "전날" 표시를 붙인다. */
function formatCheckinTime(checkedInAt: Date, todayKey: string): string {
  return seoulDateKey(checkedInAt) === todayKey ? seoulTime(checkedInAt) : `전날 ${seoulTime(checkedInAt)}`;
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

  // "오늘 체크인한 행"이 아니라 사용자별 "가장 최근 행"을 기준으로 상태를 판단한다
  // (밤새 상주해 날짜가 바뀌어도 퇴근 전까지 "on" 상태가 유지되도록 — resolveAttendanceState).
  const latestByUser = latestAttendanceByUser(rows);
  const planByUser = new Map(planRows.map((row) => [row.userId, row]));
  // 퇴근하면서 등록한 "내일" 계획 — 등록한 당일에도 퇴근 옆에 미리 보여준다(다음날까지 기다릴 필요 없음).
  const nextPlanByUser = new Map(nextPlanRows.map((row) => [row.userId, row]));

  const members: AttendanceMember[] = roster.map((profile) => {
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

  const myState = user ? resolveAttendanceState(latestByUser.get(user.id), todayKey) : null;

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
          checkedInAt={myState?.checkedInAt}
          checkedOutAt={myState?.checkedOutAt}
          checkedInToday={myState ? seoulDateKey(myState.checkedInAt) === todayKey : true}
          userId={user?.id}
        />
        <AttendanceList members={members} />
      </div>
    </>
  );
}
