"use client";

import { useMemo, useState } from "react";
import {
  TEAM_CAP,
  addDays,
  addMonths,
  buildMonthCells,
  buildWeekDays,
  formatTimeRange,
  mondayKeyOf,
  monthKeyOf,
  monthRangeLabelOf,
  weekRangeLabelOf,
  type FixedScheduleRow,
  type OwnerFilter,
  type PersonalEventRow,
} from "@/lib/schedule/calendar";
import { MonthView } from "@/components/schedule/MonthView";

type ScheduleCalendarProps = {
  personalEvents: PersonalEventRow[];
  fixedSchedules: FixedScheduleRow[];
  todayKey: string;
  userId?: string;
};

/**
 * playground-design/schedule.html의 .cal-toolbar(주/월 전환, 내 일정/팀 전체 필터) +
 * #weekView + #monthView를 담당한다. 원본 <script>의 view/owner state를 useState로 옮긴다.
 * TASK-028: 하드코딩된 WEEK_DAYS/RANGE_LABEL.week 대신 page.tsx가 실제 personal_events/
 * fixed_schedules 전체 목록을 props로 내려주고, 여기서 현재 보고 있는 주(mondayKey)/달
 * (monthKey)을 client state로 들고 필요한 주/달만 그때그때 계산한다(useMemo).
 * 주간/월간 이전·다음(cal-nav ‹›) 네비게이션은 순수 날짜 연산(addDays/addMonths)이라
 * 해당 주/달에 일정이 있는지와 무관하게 항상 이동 가능하다 — 이전에는 personal_events가
 * 존재하는 주/달만 미리 배열로 만들어 인덱스만 옮겨 다니는 구조라 일정이 없는 주/달로는
 * 이동이 안 되는 문제가 있었다.
 * 버그 수정: month view도 owner(내 일정/팀 전체)에 따라 필터링되도록 buildMonthCells에
 * owner를 넘긴다 — 예전에는 week view만 필터링되고 month view는 owner 토글과 무관하게
 * 항상 팀 전체를 보여줘서 "내 일정"을 선택해도 다른 사람 일정이 그대로 보였다.
 * 달력(week/month view) 안에서는 개인 일정을 클릭해도 수정 모달이 뜨지 않는다 —
 * 수정/삭제는 사이드바의 PersonalEventCard로만 한다(ScheduleSidebar 참고). 예전에는
 * 여기서도 클릭해서 EditPersonalEventModal을 열 수 있었지만, 사이드바에 전용 관리
 * 카드가 생긴 뒤로는 두 경로가 중복이라 없앴다.
 */
export function ScheduleCalendar({ personalEvents, fixedSchedules, todayKey, userId }: ScheduleCalendarProps) {
  const [view, setView] = useState<"week" | "month">("week");
  const [owner, setOwner] = useState<OwnerFilter>("me");
  const [mondayKey, setMondayKey] = useState(() => mondayKeyOf(todayKey));
  const [monthKey, setMonthKey] = useState(() => monthKeyOf(todayKey));
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const weekDays = useMemo(
    () => buildWeekDays(mondayKey, todayKey, personalEvents, fixedSchedules, userId),
    [mondayKey, todayKey, personalEvents, fixedSchedules, userId],
  );
  const monthCells = useMemo(
    () => buildMonthCells(monthKey, todayKey, personalEvents, fixedSchedules, userId, owner),
    [monthKey, todayKey, personalEvents, fixedSchedules, userId, owner],
  );
  const currentWeek = { mondayKey, weekDays, rangeLabel: weekRangeLabelOf(mondayKey, addDays(mondayKey, 6)) };
  const currentMonth = { monthKey, cells: monthCells, rangeLabel: monthRangeLabelOf(monthKey) };

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between font-mono text-xs text-silk-dim">
        <div className="flex overflow-hidden rounded-chip border border-border">
          <button
            type="button"
            onClick={() => setView("week")}
            className={`cursor-pointer border-none px-[14px] py-1.5 font-mono text-[11.5px] font-semibold ${
              view === "week" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
            }`}
          >
            주
          </button>
          <button
            type="button"
            onClick={() => setView("month")}
            className={`cursor-pointer border-none px-[14px] py-1.5 font-mono text-[11.5px] font-semibold ${
              view === "month" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
            }`}
          >
            월
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (view === "week") setMondayKey((k) => addDays(k, -7));
              else setMonthKey((k) => addMonths(k, -1));
            }}
            className="h-6 w-6 cursor-pointer rounded-md border border-border bg-transparent text-silk-dim"
          >
            ‹
          </button>
          <span>{view === "week" ? currentWeek.rangeLabel : currentMonth.rangeLabel}</span>
          <button
            type="button"
            onClick={() => {
              if (view === "week") setMondayKey((k) => addDays(k, 7));
              else setMonthKey((k) => addMonths(k, 1));
            }}
            className="h-6 w-6 cursor-pointer rounded-md border border-border bg-transparent text-silk-dim"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-silk-dim">
        <div className="flex overflow-hidden rounded-chip border border-border">
          <button
            type="button"
            onClick={() => setOwner("me")}
            className={`cursor-pointer border-none px-[12px] py-1.5 font-mono text-[11.5px] font-semibold ${
              owner === "me" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
            }`}
          >
            내 일정
          </button>
          <button
            type="button"
            onClick={() => setOwner("team-no-fixed")}
            className={`cursor-pointer border-none px-[12px] py-1.5 font-mono text-[11.5px] font-semibold ${
              owner === "team-no-fixed" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
            }`}
          >
            팀 전체(고정 일정 X)
          </button>
          <button
            type="button"
            onClick={() => setOwner("team")}
            className={`cursor-pointer border-none px-[12px] py-1.5 font-mono text-[11.5px] font-semibold ${
              owner === "team" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
            }`}
          >
            팀 전체(고정 일정 O)
          </button>
        </div>
        <span className="text-silk-faint">보기 기준</span>
      </div>

      {view === "week" ? (
        <div className="grid grid-cols-7 overflow-hidden rounded-panel border border-border bg-bg-panel max-[640px]:flex max-[640px]:overflow-x-auto">
          {currentWeek.weekDays.map((day) => {
            const dayKey = `${currentWeek.mondayKey}-${day.dow}`;
            const isExpanded = expandedDays.has(dayKey);
            const scopedEvents =
              owner === "me"
                ? day.events.filter((e) => e.owner === "me")
                : owner === "team-no-fixed"
                  ? day.events.filter((e) => e.type !== "fixed")
                  : day.events;
            const visible = owner === "me" || isExpanded ? scopedEvents : scopedEvents.slice(0, TEAM_CAP);
            const moreCount = owner !== "me" && !isExpanded ? Math.max(0, scopedEvents.length - TEAM_CAP) : 0;
            return (
              <div
                key={day.dow}
                className={`border-r border-border px-[7px] pt-[9px] pb-[10px] last:border-r-0 max-[640px]:flex-[0_0_108px] min-h-[200px] ${
                  day.today ? "bg-[rgba(72,217,176,0.045)] shadow-[inset_0_2px_0_var(--teal)]" : ""
                }`}
              >
                <div className="mb-[7px] text-center">
                  <div className="font-mono text-[9.5px] tracking-[0.05em] text-silk-faint">{day.dow}</div>
                  <div className={`mt-px text-sm font-semibold ${day.today ? "text-teal" : ""}`}>{day.date}</div>
                </div>
                <div className="flex flex-col gap-1">
                  {visible.map((ev, i) => (
                    <div
                      key={ev.id ?? i}
                      className={`rounded-[5px] bg-bg-raised px-[6px] py-1 text-[10px] leading-[1.35] border-l-2 ${
                        ev.type === "personal" ? "border-l-teal" : "border-l-amber"
                      }`}
                    >
                      <span className="block font-mono text-[9px] text-silk-faint">{formatTimeRange(ev.time, ev.endTime)}</span>
                      {ev.label}
                    </div>
                  ))}
                  {moreCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpandedDays((prev) => new Set(prev).add(dayKey))}
                      className="cursor-pointer border-none bg-transparent px-[6px] py-0.5 text-left font-mono text-[9.5px] text-silk-dim hover:text-teal"
                    >
                      +{moreCount}개 더보기
                    </button>
                  )}
                  {owner !== "me" && isExpanded && scopedEvents.length > TEAM_CAP && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedDays((prev) => {
                          const next = new Set(prev);
                          next.delete(dayKey);
                          return next;
                        })
                      }
                      className="cursor-pointer border-none bg-transparent px-[6px] py-0.5 text-left font-mono text-[9.5px] text-silk-dim hover:text-teal"
                    >
                      접기
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <MonthView cells={currentMonth.cells} owner={owner} />
      )}
    </div>
  );
}
