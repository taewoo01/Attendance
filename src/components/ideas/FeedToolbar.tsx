"use client";

export const TABS = ["전체", "내 아이디어", "인기순"] as const;
export type FeedTab = (typeof TABS)[number];

export const SORTS = ["최신순", "리액션순", "댓글순"] as const;
export type FeedSort = (typeof SORTS)[number];

type FeedToolbarProps = {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  sort: FeedSort;
  onSortChange: (sort: FeedSort) => void;
};

/**
 * playground-design/ideas.html의 .feed-toolbar. 원본 <script>는 `.view-toggle`
 * 그룹 내 버튼끼리 배타적으로 active 클래스만 토글하고 `.sort-select`는
 * change 리스너조차 없어 둘 다 실제로 피드를 바꾸지 않았다. TASK-034: 상태를
 * IdeasBoard로 올려 실제 필터/정렬에 반영한다.
 * "인기순" 탭은 원본에선 FeedToolbar의 view-toggle 항목이지만 의미상 정렬에
 * 가깝다 — 그래도 원본 그룹 구성(탭 3개 vs 별도 정렬 select)을 그대로 보존해
 * IdeasBoard에서 "탭=인기순"과 "정렬 select=리액션순"을 각각 독립적으로 처리한다.
 */
export function FeedToolbar({ activeTab, onTabChange, sort, onSortChange }: FeedToolbarProps) {
  return (
    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex overflow-hidden rounded-chip border border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`cursor-pointer border-none px-[14px] py-[7px] font-mono text-[11.5px] font-semibold ${
              activeTab === tab ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as FeedSort)}
        className="cursor-pointer rounded-chip border border-border bg-bg-panel px-2.5 py-[7px] font-mono text-[11.5px] text-silk-dim"
      >
        {SORTS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
