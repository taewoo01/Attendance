"use client";

import { useState } from "react";
import { TEAM_CAP, formatTimeRange, type MonthCell, type OwnerFilter } from "@/lib/schedule/calendar";

const DOW_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

type MonthViewProps = {
  cells: MonthCell[];
  owner: OwnerFilter;
};

/**
 * playground-design/schedule.html의 #monthView(.month-grid). TASK-028 당시에는
 * 42칸 정적 목업이었으나(page.tsx 옛 Notes 참고), TASK-032에서 실제
 * personal_events/fixed_schedules 기반 달력 연산으로 교체했다 — 달 길이에 따라
 * 그리드가 정확히 5~6주(35~42칸)로 계산되고, 원본처럼 항상 42칸 고정이 아니다.
 * 원본은 "오늘이 포함된 마지막 줄"에만 이벤트 칩을 보여주고 나머지 칸은
 * count/dots 요약만 보여줬지만, 실데이터에서는 이 구분이 자의적이라 모든 칸에
 * 동일하게 이벤트 칩(최대 2개 + "+N개 더보기")을 보여준다(week view의 TEAM_CAP과
 * 동일한 원칙).
 * 버그 수정: "팀 전체" 뷰에서 하루에 일정이 TEAM_CAP개보다 많으면 "+N개 더보기"가
 * 뜨는데, 클릭해도 아무 반응이 없었다 — buildMonthCells가 애초에 이벤트를
 * TEAM_CAP개로 잘라서 내려보내고 moreCount만 계산해뒀을 뿐, 잘려나간 나머지를
 * 펼쳐서 보여줄 방법이 이 컴포넌트에 없었다. 이제 buildMonthCells는 날짜별 전체
 * 이벤트를 그대로 내려주고, 이 컴포넌트가 week view(ScheduleCalendar)와 동일한
 * 패턴으로 날짜별 펼침 상태(expandedCells)를 들고 "내 일정"이 아닐 때만
 * TEAM_CAP개로 자르며, "+N개 더보기"/"접기"로 토글한다.
 */
export function MonthView({ cells, owner }: MonthViewProps) {
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());

  function expand(dateKey: string) {
    setExpandedCells((prev) => new Set(prev).add(dateKey));
  }

  function collapse(dateKey: string) {
    setExpandedCells((prev) => {
      const next = new Set(prev);
      next.delete(dateKey);
      return next;
    });
  }

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

      {cells.map((cell) => {
        const allEvents = cell.events ?? [];
        const isExpanded = expandedCells.has(cell.dateKey);
        const visible = owner === "me" || isExpanded ? allEvents : allEvents.slice(0, TEAM_CAP);
        const moreCount = owner !== "me" && !isExpanded ? Math.max(0, allEvents.length - TEAM_CAP) : 0;
        return (
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

            {visible.length > 0 && (
              <div className="mt-[5px] flex flex-col gap-[3px]">
                {visible.map((ev, j) => (
                  <div
                    key={j}
                    className={`overflow-hidden rounded-badge px-[5px] py-1 text-[9px] leading-[1.3] border-l-2 ${
                      cell.muted ? "bg-[rgba(231,239,236,0.03)]" : "bg-bg-raised"
                    } ${ev.type === "personal" ? "border-l-teal" : "border-l-amber"}`}
                  >
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                      {formatTimeRange(ev.time, ev.endTime)} {ev.label}
                    </span>
                  </div>
                ))}
                {moreCount > 0 && (
                  <button
                    type="button"
                    onClick={() => expand(cell.dateKey)}
                    className="cursor-pointer border-none bg-transparent px-[5px] py-px text-left font-mono text-[8.5px] text-silk-dim hover:text-teal"
                  >
                    +{moreCount}개 더보기
                  </button>
                )}
                {owner !== "me" && isExpanded && allEvents.length > TEAM_CAP && (
                  <button
                    type="button"
                    onClick={() => collapse(cell.dateKey)}
                    className="cursor-pointer border-none bg-transparent px-[5px] py-px text-left font-mono text-[8.5px] text-silk-dim hover:text-teal"
                  >
                    접기
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
