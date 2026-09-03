"use client";

import { useState } from "react";

const FILTERS = ["전체 8", "BMS", "Firmware", "Data", "PM"] as const;

/**
 * playground-design/team.html의 .filter-row.
 * 원본 <script>는 .filter-chip끼리 배타적으로 active 클래스만 토글하고
 * 실제로 team-grid를 필터링하지 않으므로(meetings.html과 동일 패턴) 이 컴포넌트도
 * 선택된 칩에 따라 카드 목록을 바꾸지 않는다.
 */
export function FilterRow() {
  const [active, setActive] = useState<(typeof FILTERS)[number]>("전체 8");

  return (
    <div className="mx-auto flex max-w-[1220px] flex-wrap gap-2 px-7 pt-5">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => setActive(filter)}
          className={`cursor-pointer rounded-pill border px-[14px] py-2 font-mono text-[11.5px] ${
            active === filter
              ? "border-teal-dim bg-teal-dim text-teal"
              : "border-border bg-bg-panel text-silk-dim"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
