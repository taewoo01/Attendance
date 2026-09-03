const AGENDA = [
  { time: "09:02", title: "김연구 체크인", sub: "DAY" },
  { time: "10:00", title: "박준서 · 전공수업", sub: "고정 일정 · ~12:00" },
  { time: "14:00", title: "정민재 · 병원 예약", sub: "개인 일정" },
];

const FIXED_SCHEDULE = [
  { day: "수", title: "전공수업", time: "09–11시" },
  { day: "금", title: "세미나수업", time: "14–16시" },
];

/**
 * playground-design/schedule.html의 <aside>(오늘 아젠다 + 내 고정 시간표) 정적 카드.
 * 원본 <script>가 전혀 건드리지 않는 영역이라 Server Component로 유지한다.
 */
export function ScheduleSidebar() {
  return (
    <aside>
      <div className="mb-[14px] rounded-panel border border-border bg-bg-panel px-4 pt-[15px] pb-[14px]">
        <p className="m-0 mb-2.5 text-[13px] font-semibold">오늘 · 8월 31일 (월)</p>
        {AGENDA.map((item) => (
          <div
            key={item.time}
            className="flex gap-[9px] border-b border-border py-1.5 last:border-b-0 last:pb-0"
          >
            <span className="w-10 shrink-0 font-mono text-[11px] text-teal">{item.time}</span>
            <div>
              <div className="text-xs text-silk">{item.title}</div>
              <div className="mt-px text-[10.5px] text-silk-faint">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-[14px] rounded-panel border border-border bg-bg-panel px-4 pt-[15px] pb-[14px]">
        <p className="m-0 mb-2.5 text-[13px] font-semibold">내 고정 시간표</p>
        {FIXED_SCHEDULE.map((item) => (
          <div
            key={item.day + item.title}
            className="flex items-baseline justify-between border-b border-border py-1.5 text-xs last:border-b-0 last:pb-0"
          >
            <span className="w-5 shrink-0 font-mono text-[10.5px] text-amber">{item.day}</span>
            <span className="mx-2 flex-1">{item.title}</span>
            <span className="font-mono text-[10px] text-silk-faint">{item.time}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
