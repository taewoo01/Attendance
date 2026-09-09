"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePersonalEvent } from "@/lib/schedule/actions";
import { EditPersonalEventModal, type EditablePersonalEvent } from "@/components/schedule/EditPersonalEventModal";
import { MonthView, type MonthData } from "@/components/schedule/MonthView";

export type WeekEvent = {
  id?: string;
  time: string;
  label: string;
  type: "personal" | "fixed";
  owner: "me" | "team";
  /** personal 타입 + owner "me"일 때만 존재 — 수정 모달을 채우는 데 쓴다. */
  eventDate?: string;
  title?: string;
};
export type WeekDay = { dow: string; date: number; today?: boolean; events: WeekEvent[] };
export type WeekData = { mondayKey: string; weekDays: WeekDay[]; rangeLabel: string };

const TEAM_CAP = 2;

type ScheduleCalendarProps = {
  weeks: WeekData[];
  initialWeekIndex: number;
  months: MonthData[];
  initialMonthIndex: number;
};

/**
 * playground-design/schedule.html의 .cal-toolbar(주/월 전환, 내 일정/팀 전체 필터) +
 * #weekView + #monthView를 담당한다. 원본 <script>의 view/owner state를 useState로 옮긴다.
 * TASK-028: 하드코딩된 WEEK_DAYS/RANGE_LABEL.week 대신 page.tsx가 실제 이번 주
 * personal_events/fixed_schedules를 계산한 결과를 props로 받는다.
 * 주간/월간 이전·다음(cal-nav ‹›) 네비게이션: page.tsx가 personal_events가 존재하는
 * 모든 주/달(+ 이번 주/달)을 미리 계산해 `weeks`/`months` 배열로 내려주면, 여기서는
 * DailyBoard의 feedIndex와 동일한 패턴으로 배열 인덱스만 client state로 옮겨 다닌다
 * (새 서버 요청/URL 파라미터 없음). TASK-032부터 MonthView도 실데이터 기반이라
 * (이전에는 정적 목업이라 Server Component로 children 주입) 이제 monthIndex에 따라
 * 직접 렌더링한다.
 */
export function ScheduleCalendar({ weeks, initialWeekIndex, months, initialMonthIndex }: ScheduleCalendarProps) {
  const router = useRouter();
  const [view, setView] = useState<"week" | "month">("week");
  const [owner, setOwner] = useState<"me" | "team">("me");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EditablePersonalEvent | null>(null);
  const [weekIndex, setWeekIndex] = useState(initialWeekIndex);
  const [monthIndex, setMonthIndex] = useState(initialMonthIndex);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const clampWeek = (i: number) => Math.max(0, Math.min(weeks.length - 1, i));
  const clampMonth = (i: number) => Math.max(0, Math.min(months.length - 1, i));
  const currentWeek = weeks[weekIndex];
  const currentMonth = months[monthIndex];

  async function handleDelete(id: string) {
    setDeletingId(id);
    setDeleteError(null);
    const result = await deletePersonalEvent(id);
    setDeletingId(null);
    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    router.refresh();
  }

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
              if (view === "week") setWeekIndex((i) => clampWeek(i + 1));
              else setMonthIndex((i) => clampMonth(i + 1));
            }}
            className="h-6 w-6 cursor-pointer rounded-md border border-border bg-transparent text-silk-dim"
          >
            ‹
          </button>
          <span>{view === "week" ? currentWeek.rangeLabel : currentMonth.rangeLabel}</span>
          <button
            type="button"
            onClick={() => {
              if (view === "week") setWeekIndex((i) => clampWeek(i - 1));
              else setMonthIndex((i) => clampMonth(i - 1));
            }}
            className="h-6 w-6 cursor-pointer rounded-md border border-border bg-transparent text-silk-dim"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mb-2.5 flex items-center justify-between font-mono text-xs text-silk-dim">
        <div className="flex overflow-hidden rounded-chip border border-border">
          <button
            type="button"
            onClick={() => setOwner("me")}
            className={`cursor-pointer border-none px-[14px] py-1.5 font-mono text-[11.5px] font-semibold ${
              owner === "me" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
            }`}
          >
            내 일정
          </button>
          <button
            type="button"
            onClick={() => setOwner("team")}
            className={`cursor-pointer border-none px-[14px] py-1.5 font-mono text-[11.5px] font-semibold ${
              owner === "team" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
            }`}
          >
            팀 전체
          </button>
        </div>
        <span className="text-silk-faint">보기 기준</span>
      </div>

      {view === "week" ? (
        <div className="grid grid-cols-7 overflow-hidden rounded-panel border border-border bg-bg-panel max-[640px]:flex max-[640px]:overflow-x-auto">
          {currentWeek.weekDays.map((day) => {
            const dayKey = `${currentWeek.mondayKey}-${day.dow}`;
            const isExpanded = expandedDays.has(dayKey);
            const visible =
              owner === "me" ? day.events.filter((e) => e.owner === "me") : isExpanded ? day.events : day.events.slice(0, TEAM_CAP);
            const moreCount = owner === "team" && !isExpanded ? Math.max(0, day.events.length - TEAM_CAP) : 0;
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
                  {visible.map((ev, i) => {
                    const editable = ev.owner === "me" && ev.type === "personal" && ev.id && ev.eventDate && ev.title;
                    return (
                      <div
                        key={ev.id ?? i}
                        className={`rounded-[5px] bg-bg-raised px-[6px] py-1 text-[10px] leading-[1.35] border-l-2 ${
                          ev.type === "personal" ? "border-l-teal" : "border-l-amber"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="block font-mono text-[9px] text-silk-faint">{ev.time}</span>
                          {ev.owner === "me" && ev.id && (
                            <button
                              type="button"
                              onClick={() => handleDelete(ev.id!)}
                              disabled={deletingId === ev.id}
                              aria-label="일정 삭제"
                              className="cursor-pointer border-none bg-transparent p-0 leading-none text-silk-faint hover:text-[#e2543f] disabled:cursor-not-allowed"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        {editable ? (
                          <button
                            type="button"
                            onClick={() => setEditingEvent({ id: ev.id!, title: ev.title!, eventDate: ev.eventDate!, eventTime: ev.time })}
                            className="cursor-pointer border-none bg-transparent p-0 text-left text-[10px] leading-[1.35] text-silk hover:underline"
                          >
                            {ev.label}
                          </button>
                        ) : (
                          ev.label
                        )}
                      </div>
                    );
                  })}
                  {moreCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpandedDays((prev) => new Set(prev).add(dayKey))}
                      className="cursor-pointer border-none bg-transparent px-[6px] py-0.5 text-left font-mono text-[9.5px] text-silk-dim hover:text-teal"
                    >
                      +{moreCount}개 더보기
                    </button>
                  )}
                  {owner === "team" && isExpanded && day.events.length > TEAM_CAP && (
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
        <MonthView cells={currentMonth.cells} />
      )}

      {deleteError && <p className="mt-2 font-mono text-[11px] text-[#e2543f]">{deleteError}</p>}

      <EditPersonalEventModal event={editingEvent} onClose={() => setEditingEvent(null)} />
    </div>
  );
}
