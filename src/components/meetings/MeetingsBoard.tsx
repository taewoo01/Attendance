"use client";

import { useMemo, useState, type ReactNode } from "react";
import { MeetingCard, type Meeting } from "@/components/meetings/MeetingCard";
import { SearchFilterBar, type FilterOption } from "@/components/meetings/SearchFilterBar";

/** Asia/Seoul 기준 이번 달을 원본 표기("9월")로. meetingDate가 이 접두어로 시작하는지만 본다. */
function currentMonthPrefixKo(): string {
  const month = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", month: "numeric" }).format(new Date()));
  return `${month}월`;
}

/**
 * playground-design/meetings.html의 .search-row + 회의록 목록을 함께 담당한다.
 * 검색(query)/필터(filter) state를 공유해야 해서 SearchFilterBar와 목록을 하나의
 * Client Component에서 관리한다(RegisterEventModal 계열과 달리, 여기선 상태가
 * 두 형제 컴포넌트에 걸쳐 있어야 해서 부모로 올렸다).
 * "이번 달 요약"/"미완료 액션아이템" 사이드바는 이 검색/필터와 무관하게 항상
 * 전체 회의록 기준으로 계산되므로(ScheduleCalendar의 owner 필터가 MonthView에
 * 영향을 주지 않는 것과 동일한 원칙) sidebar는 그대로 Server Component로 받아
 * children처럼 전달받는다.
 */
export function MeetingsBoard({ meetings, sidebar }: { meetings: Meeting[]; sidebar: ReactNode }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterOption>("전체");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const monthPrefix = currentMonthPrefixKo();
    return meetings.filter((meeting) => {
      if (q) {
        const haystack = [meeting.title, ...meeting.agenda, ...meeting.attendees].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filter === "미완료 액션아이템" && !meeting.actions.some((action) => !action.done)) return false;
      if (filter === "이번 달" && !meeting.meetingDate.startsWith(monthPrefix)) return false;
      return true;
    });
  }, [meetings, query, filter]);

  return (
    <>
      <SearchFilterBar query={query} onQueryChange={setQuery} active={filter} onActiveChange={setFilter} />

      <div className="mx-auto grid max-w-[1220px] grid-cols-[1fr_300px] items-start gap-[22px] px-7 pt-5 pb-[90px] max-[960px]:grid-cols-1">
        <div>
          {filtered.length === 0 ? (
            <p className="m-0 rounded-card border border-border bg-bg-panel px-[22px] py-9 text-center text-[13px] text-silk-faint">
              조건에 맞는 회의록이 없습니다.
            </p>
          ) : (
            filtered.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)
          )}
        </div>
        {sidebar}
      </div>
    </>
  );
}
