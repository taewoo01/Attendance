"use client";

export const FILTERS = ["전체", "미완료 할 일", "이번 달"] as const;
export type FilterOption = (typeof FILTERS)[number];

type SearchFilterBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  active: FilterOption;
  onActiveChange: (value: FilterOption) => void;
};

/**
 * playground-design/meetings.html의 .search-row(검색창 + .filter-chip 3개).
 * 원본 <script>는 filter-chip끼리 배타적으로 active 클래스만 토글하고
 * 실제로 목록을 필터링하지 않았고, 검색 input도 리스너가 없는 정적
 * 요소였다. TASK-033: 실제 검색/필터링이 필요해지면서 상태를 부모
 * (MeetingsBoard)로 올리고 이 컴포넌트는 controlled input/버튼만 담당한다.
 */
export function SearchFilterBar({ query, onQueryChange, active, onActiveChange }: SearchFilterBarProps) {
  return (
    <div className="mx-auto flex max-w-[1220px] flex-wrap items-center gap-2.5 px-7 pt-[18px]">
      <div className="flex min-w-[220px] flex-1 items-center gap-[9px] rounded-input border border-border bg-bg-panel px-[14px] py-2.5">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-[15px] w-[15px] shrink-0 stroke-silk-faint">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="회의록 검색 — 제목, 안건, 참석자..."
          className="w-full border-none bg-transparent font-sans text-[13px] text-silk placeholder:text-silk-faint focus:outline-none"
        />
      </div>
      {FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onActiveChange(filter)}
          className={`cursor-pointer whitespace-nowrap rounded-button border px-[13px] py-2.5 font-mono text-[11.5px] ${
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
