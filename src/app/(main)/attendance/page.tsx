import { AttendanceList, type AttendanceMember } from "@/components/attendance/AttendanceList";
import { CheckinCard } from "@/components/attendance/CheckinCard";
import { listAttendance } from "@/lib/db/attendance";
import { listProfiles } from "@/lib/db/profiles";

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
 * 원본에 <script>가 없어 전체를 Server Component로 유지한다(체크인/체크아웃 버튼도
 * 원본에서 동작이 연결돼 있지 않고, 체크아웃 버튼은 원본에서도 disabled 정적 상태).
 * TASK-027: 하드코딩된 출석 현황 8명 대신 실제 profiles + 오늘의 attendance를
 * 조회해 병합한다. 실제 QR 체크인 로직(AGENTS.md 11.3절)은 이번 범위가 아니라
 * CheckinCard는 그대로 정적으로 유지한다.
 */
export default async function AttendancePage() {
  const [roster, rows] = await Promise.all([listProfiles(), listAttendance()]);
  const now = new Date();
  const todayKey = seoulDateKey(now);

  const todaysByUser = new Map<string, Date>();
  for (const row of rows) {
    if (seoulDateKey(row.checkedInAt) !== todayKey) continue;
    // 하루 여러 번 체크인한 경우 첫 체크인 시각을 사용한다(orderBy desc이므로
    // 나중에 만나는 값으로 덮어써서 가장 이른 시각이 남는다).
    todaysByUser.set(row.userId, row.checkedInAt);
  }

  const members: AttendanceMember[] = roster.map((profile) => {
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

  const checkedInCount = members.filter((m) => m.status === "on").length;
  const [y, m, d] = todayKey.split("-");
  const dow = WEEKDAY_KO[new Date(`${todayKey}T00:00:00+09:00`).getUTCDay()];
  const dateLabel = `${y}.${m}.${d} (${dow})`;

  return (
    <>
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
        <CheckinCard />
        <AttendanceList members={members} />
      </div>
    </>
  );
}
