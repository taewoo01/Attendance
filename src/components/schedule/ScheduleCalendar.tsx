"use client";

import { useState, type ReactNode } from "react";

type WeekEvent = { time: string; label: string; type: "personal" | "fixed"; owner: "me" | "team" };
type WeekDay = { dow: string; date: number; today?: boolean; events: WeekEvent[] };

const TEAM_CAP = 2;

/**
 * playground-design/schedule.html의 #weekView(.week-grid) 정적 데이터.
 * 원본 <script>가 이 데이터를 직접 조작하지 않고 owner에 따라 표시 여부만 토글하므로
 * local constant로 유지한다(docs/MIGRATION.md 8절).
 */
const WEEK_DAYS: WeekDay[] = [
  {
    dow: "MON",
    date: 31,
    today: true,
    events: [
      { time: "10:00", label: "박준서 · 전공수업", type: "fixed", owner: "team" },
      { time: "14:00", label: "정민재 · 병원 예약", type: "personal", owner: "team" },
      { time: "20:00", label: "최도윤 · 알바", type: "fixed", owner: "team" },
      { time: "16:00", label: "이하늘 · 스터디", type: "personal", owner: "team" },
    ],
  },
  {
    dow: "TUE",
    date: 1,
    events: [
      { time: "18:00", label: "한서준 · 알바", type: "fixed", owner: "team" },
      { time: "13:00", label: "오지훈 · 학회 미팅", type: "personal", owner: "team" },
    ],
  },
  {
    dow: "WED",
    date: 2,
    events: [
      { time: "09:00", label: "김연구 · 전공수업", type: "fixed", owner: "me" },
      { time: "19:00", label: "정민재 · 알바", type: "fixed", owner: "team" },
    ],
  },
  {
    dow: "THU",
    date: 3,
    events: [{ time: "15:00", label: "강태윤 · 투자자 미팅", type: "personal", owner: "team" }],
  },
  {
    dow: "FRI",
    date: 4,
    events: [
      { time: "10:00", label: "오지훈 · 세미나", type: "fixed", owner: "team" },
      { time: "19:00", label: "김연구 · 팀 회식", type: "personal", owner: "me" },
    ],
  },
  { dow: "SAT", date: 5, events: [] },
  {
    dow: "SUN",
    date: 6,
    events: [{ time: "14:00", label: "정민재 · 개인 공부", type: "personal", owner: "team" }],
  },
];

const RANGE_LABEL = { week: "8월 31일 – 9월 6일", month: "2026년 8월" } as const;

/**
 * playground-design/schedule.html의 .cal-toolbar(주/월 전환, 내 일정/팀 전체 필터) +
 * #weekView + #monthView를 담당한다. 원본 <script>의 view/owner state를 useState로 옮긴다.
 * MonthView는 owner 필터의 영향을 받지 않는 정적 그래픽이라(원본도 .day-events만 필터링)
 * Server Component로 남기고 children으로 전달받는다.
 */
export function ScheduleCalendar({ monthView }: { monthView: ReactNode }) {
  const [view, setView] = useState<"week" | "month">("week");
  const [owner, setOwner] = useState<"me" | "team">("me");

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
          <button type="button" className="h-6 w-6 cursor-pointer rounded-md border border-border bg-transparent text-silk-dim">
            ‹
          </button>
          <span>{RANGE_LABEL[view]}</span>
          <button type="button" className="h-6 w-6 cursor-pointer rounded-md border border-border bg-transparent text-silk-dim">
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
          {WEEK_DAYS.map((day) => {
            const visible = owner === "me" ? day.events.filter((e) => e.owner === "me") : day.events.slice(0, TEAM_CAP);
            const moreCount = owner === "team" ? Math.max(0, day.events.length - TEAM_CAP) : 0;
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
                      key={i}
                      className={`rounded-[5px] bg-bg-raised px-[6px] py-1 text-[10px] leading-[1.35] border-l-2 ${
                        ev.type === "personal" ? "border-l-teal" : "border-l-amber"
                      }`}
                    >
                      <span className="block font-mono text-[9px] text-silk-faint">{ev.time}</span>
                      {ev.label}
                    </div>
                  ))}
                  {moreCount > 0 && (
                    <div className="cursor-pointer px-[6px] py-0.5 font-mono text-[9.5px] text-silk-dim hover:text-teal">
                      +{moreCount}개 더보기
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        monthView
      )}
    </div>
  );
}
