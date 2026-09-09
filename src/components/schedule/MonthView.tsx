import { formatTimeRange, type MonthCell, type MonthEvent } from "@/lib/schedule/calendar";

const DOW_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

type MonthViewProps = {
  cells: MonthCell[];
  onEdit: (event: MonthEvent) => void;
};

/**
 * playground-design/schedule.html의 #monthView(.month-grid). TASK-028 당시에는
 * 42칸 정적 목업이었으나(page.tsx 옛 Notes 참고), TASK-032에서 실제
 * personal_events/fixed_schedules 기반 달력 연산으로 교체했다 — 달 길이에 따라
 * 그리드가 정확히 5~6주(35~42칸)로 계산되고, 원본처럼 항상 42칸 고정이 아니다.
 * 원본은 "오늘이 포함된 마지막 줄"에만 이벤트 칩을 보여주고 나머지 칸은
 * count/dots 요약만 보여줬지만, 실데이터에서는 이 구분이 자의적이라 모든 칸에
 * 동일하게 이벤트 칩(최대 2개 + "+N개 더보기")을 보여준다(week view의 TEAM_CAP과
 * 동일한 원칙). owner(내 일정/팀 전체) 필터는 ScheduleCalendar가 buildMonthCells에
 * owner를 넘겨 미리 반영한 cells를 받으므로 이 컴포넌트는 필터링을 신경 쓰지 않는다
 * ("내 일정" 선택 시 다른 사람 일정이 보이던 버그 수정 — 원래는 month view가 owner와
 * 무관하게 항상 팀 전체를 보여줬다).
 * 내 소유 개인 일정 칩은 칩 전체(시간+제목)를 눌러 수정 모달을 연다. 삭제는 이 좁은
 * 칸 안에 별도 × 버튼을 두지 않고 그 수정 모달의 "삭제" 버튼으로 처리한다(칸이 좁아
 * 텍스트와 겹치는 별도 버튼은 클릭이 어렵다는 피드백 반영 — EditPersonalEventModal 참고).
 */
export function MonthView({ cells, onEdit }: MonthViewProps) {
  return (
    <div className="grid grid-cols-7 overflow-hidden rounded-panel border border-border bg-bg-panel max-[640px]:grid-cols-[repeat(7,minmax(46px,1fr))] max-[640px]:overflow-x-auto">
      {DOW_LABELS.map((label) => (
        <div
          key={label}
          className="border-b border-border py-2 text-center font-mono text-[10px] text-silk-faint"
        >
          {label}
        </div>
      ))}

      {cells.map((cell) => (
        <div
          key={cell.dateKey}
          className={`relative min-h-[96px] border-r border-b border-border px-[7px] py-1.5 [&:nth-child(7n)]:border-r-0 ${
            cell.today
              ? "bg-[rgba(72,217,176,0.06)] shadow-[inset_0_2px_0_var(--teal)]"
              : cell.muted
                ? "text-silk-faint"
                : ""
          }`}
        >
          <div className={`text-xs font-semibold ${cell.today ? "text-teal" : ""}`}>{cell.date}</div>

          {cell.count && <div className="mt-1 font-mono text-[9.5px] text-silk-dim">{cell.count}</div>}

          {cell.dots && (
            <div className="mt-1 flex gap-[3px]">
              {cell.dots.map((dot, j) => (
                <i key={j} className={`inline-block h-[5px] w-[5px] rounded-full ${dot === "personal" ? "bg-teal" : "bg-amber"}`} />
              ))}
            </div>
          )}

          {cell.events && cell.events.length > 0 && (
            <div className="mt-[5px] flex flex-col gap-[3px]">
              {cell.events.map((ev, j) => {
                const editable = ev.owner === "me" && ev.type === "personal" && ev.id && ev.eventDate && ev.title;
                return (
                  <div
                    key={j}
                    className={`overflow-hidden rounded-badge px-[5px] py-1 text-[9px] leading-[1.3] border-l-2 ${
                      cell.muted ? "bg-[rgba(231,239,236,0.03)]" : "bg-bg-raised"
                    } ${ev.type === "personal" ? "border-l-teal" : "border-l-amber"}`}
                  >
                    {editable ? (
                      <button
                        type="button"
                        onClick={() => onEdit(ev)}
                        className="block w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap border-none bg-transparent p-0 text-left text-[9px] leading-[1.3] text-silk hover:underline"
                      >
                        {formatTimeRange(ev.time, ev.endTime)} {ev.label}
                      </button>
                    ) : (
                      <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                        {formatTimeRange(ev.time, ev.endTime)} {ev.label}
                      </span>
                    )}
                  </div>
                );
              })}
              {cell.moreCount != null && cell.moreCount > 0 && (
                <div className="px-[5px] py-px font-mono text-[8.5px] text-silk-dim">+{cell.moreCount}개 더보기</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
