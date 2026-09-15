export type AttendanceMember = {
  userId: string;
  avatar: string;
  name: string;
  role: string;
  time: string;
  /** "on"=체크인 후 아직 근무 중, "left"=체크인 후 퇴근 완료, "off"=오늘 체크인 안 함. */
  status: "on" | "off" | "left";
  /** 어제 퇴근할 때 등록해둔 오늘 상주 계획 배지("주간"/"야간"/"종일"/"안 옴"/직접 입력). 없으면 미설정. */
  planLabel?: string;
  /** planLabel의 스타일 분기용("day"|"night"|"full"|"off"|"custom"). */
  planKind?: string;
  /** 오늘 퇴근하면서 등록한 "내일" 상주 계획. status가 "left"일 때만 퇴근 옆에 같이 보여준다. */
  nextPlanLabel?: string;
  /** nextPlanLabel의 스타일 분기용. */
  nextPlanKind?: string;
};

type AttendanceListProps = {
  members: AttendanceMember[];
};

/** AttendanceMember.planLabel 배지. HeroSection의 출석 현황 모달도 동일한 스타일로 재사용한다. */
export function PlanBadge({ label, kind }: { label: string; kind?: string }) {
  return (
    <span
      className={`ml-1.5 inline-flex items-center whitespace-nowrap rounded-pill border px-1.5 py-[1px] align-middle font-mono text-[9.5px] ${
        kind === "off"
          ? "border-[rgba(226,84,63,0.4)] bg-[rgba(226,84,63,0.12)] text-[#e2543f]"
          : "border-teal-dim bg-teal-dim text-teal"
      }`}
    >
      {label}
    </span>
  );
}

/**
 * playground-design/attendance.html의 .list-card(오늘의 출석 현황).
 * 원본에 <script>가 없어 정적 목록이며, 반복되는 row 구조라 배열 + map으로 표현한다
 * (docs/MIGRATION.md 8절 Mock Data Migration).
 * TASK-027: 하드코딩 8명 대신 page.tsx가 실제 profiles + 오늘의 attendance를
 * 계산한 결과를 props로 받는다.
 */
const STATUS_LABEL: Record<AttendanceMember["status"], string> = {
  on: "체크인",
  left: "퇴근",
  off: "미출근",
};

export function AttendanceList({ members }: AttendanceListProps) {
  // "오늘 출석한 인원"이 기준이라 이미 퇴근한(left) 인원도 포함한다 — 지금 남아있는 인원만 세는 게 아니다.
  const checkedIn = members.filter((m) => m.status !== "off").length;

  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg-panel">
      <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
        <h3 className="m-0 text-[14.5px] font-semibold">오늘의 출석 현황</h3>
        <span className="font-mono text-[11.5px] text-silk-faint">
          {checkedIn} / {members.length} CHECKED IN
        </span>
      </div>

      {members.map((member) => (
        <div
          key={member.userId}
          className="grid grid-cols-[40px_1fr_90px_170px] items-center gap-[14px] border-b border-border px-[22px] py-[14px] last:border-b-0 max-[620px]:grid-cols-[34px_1fr_70px]"
        >
          <div
            className={`flex h-[34px] w-[34px] items-center justify-center rounded-full font-mono text-xs font-bold ${
              member.status === "on"
                ? "bg-[rgba(72,217,176,0.14)] text-teal"
                : member.status === "left"
                  ? "bg-amber-dim text-amber"
                  : "bg-[rgba(231,239,236,0.06)] text-silk-faint"
            }`}
          >
            {member.avatar}
          </div>
          <div>
            <div className="text-sm font-medium">
              {member.name}
              {member.planLabel && <PlanBadge label={member.planLabel} kind={member.planKind} />}
            </div>
            <div className="mt-px text-[11.5px] text-silk-faint">{member.role}</div>
          </div>
          <div className="font-mono text-[12.5px] text-silk-dim">{member.time}</div>
          <div
            className={`flex items-center justify-end gap-[7px] whitespace-nowrap font-mono text-[11.5px] max-[620px]:hidden ${
              member.status === "on" ? "text-teal" : member.status === "left" ? "text-amber" : "text-silk-faint"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                member.status === "on" ? "bg-teal" : member.status === "left" ? "bg-amber" : "bg-silk-faint"
              }`}
            />
            {STATUS_LABEL[member.status]}
            {member.status === "left" && member.nextPlanLabel && (
              <PlanBadge label={`내일 ${member.nextPlanLabel}`} kind={member.nextPlanKind} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
