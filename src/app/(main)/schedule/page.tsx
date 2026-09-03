import { MonthView } from "@/components/schedule/MonthView";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { ScheduleSidebar } from "@/components/schedule/ScheduleSidebar";

export default function SchedulePage() {
  return (
    <>
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">일정</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">일정</h1>
        </div>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-[15px] py-[9px] text-[13px] font-semibold text-[#04231b]"
        >
          + 개인 일정 등록
        </button>
      </div>

      <div className="mx-auto grid max-w-[1220px] grid-cols-[1fr_280px] items-start gap-[18px] px-7 pt-4 pb-[70px] max-[960px]:grid-cols-1">
        <ScheduleCalendar monthView={<MonthView />} />
        <ScheduleSidebar />
      </div>
    </>
  );
}
