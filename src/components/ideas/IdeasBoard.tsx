"use client";

import { useMemo, useRef, useState } from "react";
import { FeedToolbar, type FeedSort, type FeedTab } from "@/components/ideas/FeedToolbar";
import { IdeaCard, type Idea } from "@/components/ideas/IdeaCard";
import { IdeaComposer } from "@/components/ideas/IdeaComposer";
import { IdeasSidebar, type RecentActivityItem } from "@/components/ideas/IdeasSidebar";
import { ideaTimestampMs } from "@/lib/ideas/format";

function totalReactions(idea: Idea): number {
  return idea.reactions.reduce((sum, r) => sum + r.count, 0);
}

/**
 * page.tsx가 서버에서 계산한 ideas/recentActivity를 받아 페이지 전체(헤더의
 * "+ 아이디어 작성" 버튼, 컴포저, 피드 탭/정렬, 태그 필터, 사이드바)를 함께
 * 관리한다. 탭(전체/내 아이디어/인기순)·정렬(최신순/리액션순/댓글순)·태그
 * 필터가 서로 다른 컴포넌트(FeedToolbar/IdeasSidebar)에 걸쳐 있어야 해서
 * MeetingsBoard와 동일한 이유로 상태를 여기서 관리한다.
 * "이번 주 새 아이디어" 사이드바 요약은 이 필터와 무관하게 항상 전체
 * 아이디어 기준으로 남긴다(ScheduleCalendar owner 필터와 동일한 원칙).
 */
export function IdeasBoard({
  ideas,
  currentUserId,
  recentActivity,
}: {
  ideas: Idea[];
  currentUserId: string | null;
  recentActivity: RecentActivityItem[];
}) {
  const [tab, setTab] = useState<FeedTab>("전체");
  const [sort, setSort] = useState<FeedSort>("최신순");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  const visibleIdeas = useMemo(() => {
    let list = ideas;
    if (tab === "내 아이디어") {
      list = list.filter((idea) => currentUserId !== null && idea.userId === currentUserId);
    }
    if (activeTag) {
      list = list.filter((idea) => idea.tags.includes(activeTag));
    }

    const effectiveSort: FeedSort = tab === "인기순" ? "리액션순" : sort;
    const sorted = [...list];
    if (effectiveSort === "최신순") {
      sorted.sort((a, b) => ideaTimestampMs(b.postedAt) - ideaTimestampMs(a.postedAt));
    } else if (effectiveSort === "리액션순") {
      sorted.sort((a, b) => totalReactions(b) - totalReactions(a));
    } else {
      sorted.sort((a, b) => b.comments.length - a.comments.length);
    }
    return sorted;
  }, [ideas, tab, sort, activeTag, currentUserId]);

  return (
    <>
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">아이디어 모음집</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">아이디어 모음집</h1>
        </div>
        <button
          type="button"
          onClick={() => composerRef.current?.focus()}
          className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-4 py-2.5 text-[13px] font-semibold text-[#04231b]"
        >
          + 아이디어 작성
        </button>
      </div>

      <div className="mx-auto grid max-w-[1220px] grid-cols-[1fr_300px] items-start gap-[22px] px-7 pt-[22px] pb-[90px] max-[960px]:grid-cols-1">
        <div>
          <IdeaComposer textareaRef={composerRef} />
          <FeedToolbar activeTab={tab} onTabChange={setTab} sort={sort} onSortChange={setSort} />
          {visibleIdeas.length === 0 ? (
            <p className="m-0 rounded-card border border-border bg-bg-panel px-5 py-9 text-center text-[13px] text-silk-faint">
              조건에 맞는 아이디어가 없습니다.
            </p>
          ) : (
            visibleIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} currentUserId={currentUserId} />)
          )}
        </div>
        <IdeasSidebar ideas={ideas} activeTag={activeTag} onTagClick={setActiveTag} recentActivity={recentActivity} />
      </div>
    </>
  );
}
