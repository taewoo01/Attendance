"use client";

import type { Idea } from "@/components/ideas/IdeaCard";

export type RecentActivityItem = { avatar: string; who: string; action: string };

type IdeasSidebarProps = {
  ideas: Idea[];
  activeTag: string | null;
  onTagClick: (tag: string | null) => void;
  recentActivity: RecentActivityItem[];
};

/**
 * playground-design/ideas.html의 <aside> 격 3개 .side-card
 * (이번 주 새 아이디어 / 태그 / 최근 활동).
 * TASK-024: 요약 수치/태그 목록은 같은 페이지의 실제 아이디어 목록에서
 * 파생 가능해 ideas props에서 계산한다. "이번 주 새 아이디어"는 원본처럼
 * 전체 아이디어 수를 그대로 쓴다(postedAt이 자유 텍스트/ISO 혼재라 "이번 주"
 * 경계를 정확히 계산하지 않음 — 이번 TASK 범위 밖, 기존 동작 유지).
 * TASK-034: `.tag-pill`(원본엔 hover 스타일만 있고 클릭 리스너 없음)을 실제
 * 클릭 필터로 연결하면서 Client Component가 됐고, "최근 활동"(원본 하드코딩
 * ACTIVE_ITEMS)도 page.tsx가 댓글/반응을 시간순으로 병합해 계산한 실제 값을
 * 받는다(댓글 postedAt/반응 idea_reactions.createdAt 도입으로 가능해짐).
 */
export function IdeasSidebar({ ideas, activeTag, onTagClick, recentActivity }: IdeasSidebarProps) {
  const totalComments = ideas.reduce((sum, idea) => sum + idea.comments.length, 0);
  const totalReactions = ideas.reduce((sum, idea) => sum + idea.reactions.reduce((s, r) => s + r.count, 0), 0);
  const tagCounts = new Map<string, number>();
  for (const idea of ideas) {
    for (const tag of idea.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const tags = Array.from(tagCounts, ([name, n]) => ({ name, n }));

  return (
    <div>
      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">이번 주 새 아이디어</h4>
        <div className="font-mono text-[30px] font-bold leading-none text-teal">{ideas.length}건</div>
        <div className="mt-1.5 text-[11.5px] text-silk-faint">
          댓글 {totalComments} · 리액션 {totalReactions}
        </div>
      </div>

      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">태그</h4>
        <div className="flex flex-wrap gap-[7px]">
          {tags.map((tag) => (
            <button
              key={tag.name}
              type="button"
              onClick={() => onTagClick(activeTag === tag.name ? null : tag.name)}
              className={`cursor-pointer rounded-pill border px-[11px] py-1.5 font-mono text-[11px] ${
                activeTag === tag.name
                  ? "border-teal-dim bg-teal-dim text-teal"
                  : "border-border bg-bg-raised text-silk-dim hover:border-teal-dim hover:text-teal"
              }`}
            >
              {tag.name}
              <span className="ml-1 text-silk-faint">{tag.n}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">최근 활동</h4>
        {recentActivity.length === 0 ? (
          <p className="m-0 text-[11.5px] text-silk-faint">아직 활동이 없어요.</p>
        ) : (
          recentActivity.map((item, i) => (
            <div key={i} className="flex items-center gap-[9px] border-b border-border py-[7px] last:border-b-0 last:pb-0">
              <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[rgba(72,217,176,0.14)] font-mono text-[9.5px] font-bold text-teal">
                {item.avatar}
              </div>
              <span className="text-[11.5px] text-silk-dim">
                <b className="font-semibold text-silk">{item.who}</b>
                {item.action}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
