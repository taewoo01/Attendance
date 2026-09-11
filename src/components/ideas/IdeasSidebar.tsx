"use client";

import type { Idea } from "@/components/ideas/IdeaCard";
import { mondayKeyOf, seoulDateKey } from "@/lib/date";
import { ideaTimestampMs } from "@/lib/ideas/format";

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
 * 파생 가능해 ideas props에서 계산한다. TASK-024 당시엔 "이번 주 새 아이디어"가
 * 원본처럼 전체 아이디어 수를 그대로 썼다(postedAt이 자유 텍스트/ISO 혼재라
 * "이번 주" 경계를 정확히 계산할 수 없었음).
 * TASK-034: `.tag-pill`(원본엔 hover 스타일만 있고 클릭 리스너 없음)을 실제
 * 클릭 필터로 연결하면서 Client Component가 됐고, "최근 활동"(원본 하드코딩
 * ACTIVE_ITEMS)도 page.tsx가 댓글/반응을 시간순으로 병합해 계산한 실제 값을
 * 받는다(댓글 postedAt/반응 idea_reactions.createdAt 도입으로 가능해짐).
 * 아이디어 페이지 상세화: postedAt이 이제 ISO로 저장되면서(TASK-034) "이번 주"
 * 경계를 실제로 계산할 수 있게 됐다 — results 페이지의 주간 필터(ResultsBoard)와
 * 동일하게 `mondayKeyOf(seoulDateKey(now))`로 이번 주 월요일 00:00(Asia/Seoul)을
 * 구해 그 이후에 posted된 아이디어만 골라낸다. 카드 제목이 "이번 주 *새* 아이디어"인
 * 만큼 댓글/리액션 합계도 전체 아이디어가 아니라 이번 주에 새로 올라온 아이디어
 * 것만 더한다(예전엔 카드 제목과 무관하게 전체 아이디어 기준으로 셌음 — 제목과
 * 숫자가 어긋나 있던 버그). postedAt이 옛 자유 텍스트 포맷이라 파싱 안 되는
 * 레거시 아이디어는 ideaTimestampMs가 0을 반환해 자동으로 "이번 주" 밖으로
 * 취급된다(안전한 기본값).
 */
export function IdeasSidebar({ ideas, activeTag, onTagClick, recentActivity }: IdeasSidebarProps) {
  const weekStartMs = new Date(`${mondayKeyOf(seoulDateKey(new Date()))}T00:00:00+09:00`).getTime();
  const thisWeekIdeas = ideas.filter((idea) => ideaTimestampMs(idea.postedAt) >= weekStartMs);
  const totalComments = thisWeekIdeas.reduce((sum, idea) => sum + idea.comments.length, 0);
  const totalReactions = thisWeekIdeas.reduce((sum, idea) => sum + idea.reactions.reduce((s, r) => s + r.count, 0), 0);
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
        <div className="font-mono text-[30px] font-bold leading-none text-teal">{thisWeekIdeas.length}건</div>
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
