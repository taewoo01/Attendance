type ResultsToolbarProps = {
  view: "week" | "month";
  onViewChange: (view: "week" | "month") => void;
  rangeLabel: string;
  onPrev: () => void;
  onNext: () => void;
};

/**
 * playground-design/results.html의 .cal-toolbar(주간/월간 뷰 전환 + 정렬 select).
 * 원본은 view state와 rangeLabel 텍스트만 정적으로 바꾸고 실제 이전·다음 이동은
 * 구현돼 있지 않았다 — 이 컴포넌트도 그 구조를 그대로 따라 만들어져서 ‹ › 버튼이
 * onClick 없는 장식 버튼이었고, RANGE_LABEL도 하드코딩된 고정 문자열이라 기간이
 * 전혀 넘어가지 않는 버그가 있었다. 이제 이 컴포넌트는 상태 없는 프레젠테이션으로
 * 바뀌고, view/기간 state와 실제 날짜 이동 로직은 부모인 ResultsBoard(client)가
 * ScheduleCalendar와 동일한 패턴(mondayKey/monthKey + addDays/addMonths)으로 갖는다.
 * sort-select는 원본에 change 리스너가 없어 상태 없이 정적 select로 유지한다.
 */
export function ResultsToolbar({ view, onViewChange, rangeLabel, onPrev, onNext }: ResultsToolbarProps) {
  return (
    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5 font-mono text-xs text-silk-dim">
      <div className="flex items-center gap-2.5">
        <div className="flex overflow-hidden rounded-chip border border-border">
          <button
            type="button"
            onClick={() => onViewChange("week")}
            className={`cursor-pointer border-none px-[14px] py-[7px] font-mono text-[11.5px] font-semibold ${
              view === "week" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
            }`}
          >
            주간
          </button>
          <button
            type="button"
            onClick={() => onViewChange("month")}
            className={`cursor-pointer border-none px-[14px] py-[7px] font-mono text-[11.5px] font-semibold ${
              view === "month" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
            }`}
          >
            월간
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onPrev}
            className="h-6 w-6 cursor-pointer rounded-md border border-border bg-transparent text-silk-dim"
          >
            ‹
          </button>
          <span>{rangeLabel}</span>
          <button
            type="button"
            onClick={onNext}
            className="h-6 w-6 cursor-pointer rounded-md border border-border bg-transparent text-silk-dim"
          >
            ›
          </button>
        </div>
      </div>
      <select className="cursor-pointer rounded-chip border border-border bg-bg-panel px-2.5 py-[7px] font-mono text-[11.5px] text-silk-dim">
        <option>최신순</option>
        <option>담당자순</option>
        <option>수치 지표순</option>
      </select>
    </div>
  );
}
