/**
 * playground-design/attendance.html의 .list-card(오늘의 출석 현황).
 * 원본에 <script>가 없어 정적 목록이며, 반복되는 row 구조라 배열 + map으로 표현한다
 * (docs/MIGRATION.md 8절 Mock Data Migration).
 */
const ATTENDEES = [
  { avatar: "연", name: "김연구", role: "AI솔루션 팀 · BMS", time: "09:02", status: "on" as const },
  { avatar: "하", name: "이하늘", role: "AI솔루션 팀 · BMS", time: "08:47", status: "on" as const },
  { avatar: "준", name: "박준서", role: "AI솔루션 팀 · Firmware", time: "09:15", status: "on" as const },
  { avatar: "도", name: "최도윤", role: "AI솔루션 팀 · Firmware", time: "09:31", status: "on" as const },
  { avatar: "민", name: "정민재", role: "AI솔루션 팀 · Data", time: "10:04", status: "on" as const },
  { avatar: "서", name: "한서준", role: "AI솔루션 팀 · Data", time: "—", status: "off" as const },
  { avatar: "지", name: "오지훈", role: "AI솔루션 팀 · PM", time: "—", status: "off" as const },
  { avatar: "태", name: "강태윤", role: "AI솔루션 팀 · PM", time: "—", status: "off" as const },
];

export function AttendanceList() {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg-panel">
      <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
        <h3 className="m-0 text-[14.5px] font-semibold">오늘의 출석 현황</h3>
        <span className="font-mono text-[11.5px] text-silk-faint">5 / 8 CHECKED IN</span>
      </div>

      {ATTENDEES.map((member) => (
        <div
          key={member.name}
          className="grid grid-cols-[40px_1fr_90px_110px] items-center gap-[14px] border-b border-border px-[22px] py-[14px] last:border-b-0 max-[560px]:grid-cols-[34px_1fr_70px]"
        >
          <div
            className={`flex h-[34px] w-[34px] items-center justify-center rounded-full font-mono text-xs font-bold ${
              member.status === "on"
                ? "bg-[rgba(72,217,176,0.14)] text-teal"
                : "bg-[rgba(231,239,236,0.06)] text-silk-faint"
            }`}
          >
            {member.avatar}
          </div>
          <div>
            <div className="text-sm font-medium">{member.name}</div>
            <div className="mt-px text-[11.5px] text-silk-faint">{member.role}</div>
          </div>
          <div className="font-mono text-[12.5px] text-silk-dim">{member.time}</div>
          <div
            className={`flex items-center justify-end gap-[7px] font-mono text-[11.5px] max-[560px]:hidden ${
              member.status === "on" ? "text-teal" : "text-silk-faint"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${member.status === "on" ? "bg-teal" : "bg-silk-faint"}`}
            />
            {member.status === "on" ? "체크인" : "미출근"}
          </div>
        </div>
      ))}
    </div>
  );
}
