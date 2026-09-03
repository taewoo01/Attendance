"use client";

import { useState } from "react";

const TABS = ["전체", "내 아이디어", "인기순"] as const;

/**
 * playground-design/ideas.html의 .feed-toolbar.
 * 원본 <script>는 `.view-toggle` 그룹 내 버튼끼리 배타적으로 active 클래스만
 * 토글하고 실제로 피드를 필터링하지 않으므로, 이 컴포넌트도 선택된 탭에
 * 따라 목록 내용을 바꾸지 않는다. `.sort-select`는 원본에 change 리스너가
 * 없어 상태 없는 정적 select로 유지한다.
 */
export function FeedToolbar() {
  const [active, setActive] = useState<(typeof TABS)[number]>("전체");

  return (
    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex overflow-hidden rounded-chip border border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={`cursor-pointer border-none px-[14px] py-[7px] font-mono text-[11.5px] font-semibold ${
              active === tab ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <select className="cursor-pointer rounded-chip border border-border bg-bg-panel px-2.5 py-[7px] font-mono text-[11.5px] text-silk-dim">
        <option>최신순</option>
        <option>리액션순</option>
        <option>댓글순</option>
      </select>
    </div>
  );
}
