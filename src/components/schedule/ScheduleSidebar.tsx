import { FixedScheduleCard } from "@/components/schedule/FixedScheduleCard";

export type AgendaItem = { time: string; title: string; sub: string };
export type FixedScheduleItem = { id: string; day: string; title: string; time: string };

type ScheduleSidebarProps = {
  todayLabel: string;
  agenda: AgendaItem[];
  fixedSchedule: FixedScheduleItem[];
};

/**
 * playground-design/schedule.html의 <aside>(오늘 아젠다 + 내 고정 시간표) 정적 카드.
 * 원본 <script>가 전혀 건드리지 않는 영역이라 Server Component로 유지한다.
 * TASK-028: 하드코딩된 AGENDA(오늘 체크인 + 팀 전체의 오늘 일정)/FIXED_SCHEDULE
 * (로그인한 사용자 본인의 고정 시간표만) 대신 page.tsx가 계산한 실제 데이터를
 * props로 받는다.
 * TASK-032: "내 고정 시간표" 카드는 항목별 삭제 버튼이 필요해 FixedScheduleCard
 * Client Component로 분리했다(ScheduleCalendar의 monthView prop과 동일한 패턴 —
 * 여기서는 반대로 정적 부모가 client 자식을 감싼다). "오늘" 아젠다는 이 상태와
 * 무관해 그대로 Server Component로 남는다.
 */
export function ScheduleSidebar({ todayLabel, agenda, fixedSchedule }: ScheduleSidebarProps) {
  return (
    <aside>
      <div className="mb-[14px] rounded-panel border border-border bg-bg-panel px-4 pt-[15px] pb-[14px]">
        <p className="m-0 mb-2.5 text-[13px] font-semibold">오늘 · {todayLabel}</p>
        {agenda.map((item, i) => (
          <div
            key={i}
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

      <FixedScheduleCard items={fixedSchedule} />
    </aside>
  );
}
