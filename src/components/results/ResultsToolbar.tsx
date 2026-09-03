"use client";

import { useState } from "react";

const RANGE_LABEL = { week: "8월 25일 – 8월 31일", month: "2026년 8월" } as const;

/**
 * playground-design/results.html의 .cal-toolbar(주간/월간 뷰 전환 + 정렬 select).
 * 원본 <script>는 활성 클래스와 rangeLabel 텍스트만 바꾸고 목록 내용은 건드리지
 * 않으므로 이 컴포넌트도 뷰 전환에 따라 다른 콘텐츠를 렌더링하지 않는다.
 * sort-select는 원본에 change 리스너가 없어 상태 없이 정적 select로 유지한다.
 */
export function ResultsToolbar() {
  const [view, setView] = useState<"week" | "month">("week");

  return (
    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5 font-mono text-xs text-silk-dim">
      <div className="flex items-center gap-2.5">
        <div className="flex overflow-hidden rounded-chip border border-border">
          <button
            type="button"
            onClick={() => setView("week")}
            className={`cursor-pointer border-none px-[14px] py-[7px] font-mono text-[11.5px] font-semibold ${
              view === "week" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
            }`}
          >
            주간
          </button>
          <button
            type="button"
            onClick={() => setView("month")}
            className={`cursor-pointer border-none px-[14px] py-[7px] font-mono text-[11.5px] font-semibold ${
              view === "month" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
            }`}
          >
            월간
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
      <select className="cursor-pointer rounded-chip border border-border bg-bg-panel px-2.5 py-[7px] font-mono text-[11.5px] text-silk-dim">
        <option>최신순</option>
        <option>담당자순</option>
        <option>수치 지표순</option>
      </select>
    </div>
  );
}
