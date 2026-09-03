"use client";

import { useState } from "react";

export type IdeaComment = { avatar: string; who: string; text: string };
export type IdeaReaction = { count: number; active: boolean };

/**
 * playground-design/ideas.html의 .idea-card.
 * `.react-btn` 3개는 원본 <script>에서 클릭 시 각자 독립적으로 active
 * 클래스만 toggle하고 숫자는 전혀 바꾸지 않으므로, 그 동작을 그대로
 * 재현한다(클릭해도 count는 고정값 유지). 3번째 리액션만 원본 텍스트에
 * "💡 " 접두사가 있고 나머지 둘은 없는 비대칭도 그대로 보존한다.
 * `.comment-btn`, 첨부/게시 버튼과 달리 `.react-btn`만 실제 리스너가
 * 있으므로 이 컴포넌트만 Client Component로 분리한다.
 */
export function IdeaCard({
  avatar,
  who,
  when,
  title,
  body,
  tags,
  reactions,
  commentLabel,
  comments,
}: {
  avatar: string;
  who: string;
  when: string;
  title: string;
  body: string;
  tags: string[];
  reactions: [IdeaReaction, IdeaReaction, IdeaReaction];
  commentLabel: string;
  comments?: IdeaComment[];
}) {
  const [active, setActive] = useState<[boolean, boolean, boolean]>([
    reactions[0].active,
    reactions[1].active,
    reactions[2].active,
  ]);

  function toggle(i: 0 | 1 | 2) {
    setActive((a) => {
      const next = [...a] as [boolean, boolean, boolean];
      next[i] = !next[i];
      return next;
    });
  }

  const reactBtnClass = (isActive: boolean) =>
    `inline-flex cursor-pointer items-center gap-[6px] rounded-pill border px-3 py-1.5 font-mono text-xs ${
      isActive ? "border-teal-dim bg-teal-dim text-teal" : "border-border bg-bg-raised text-silk-dim"
    }`;

  return (
    <div className="mb-4 rounded-card border border-border bg-bg-panel px-5 pt-[18px] pb-4">
      <div className="mb-[11px] flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(72,217,176,0.14)] font-mono text-xs font-bold text-teal">
          {avatar}
        </div>
        <div>
          <div className="text-[13px] font-semibold text-silk">{who}</div>
          <div className="mt-px font-mono text-[11px] text-silk-faint">{when}</div>
        </div>
      </div>

      <h4 className="m-0 mb-[7px] text-[15px] font-semibold text-silk">{title}</h4>
      <p className="m-0 mb-[13px] max-w-[70ch] text-[13px] leading-[1.65] text-silk-dim">{body}</p>

      <div className="mb-[14px] flex flex-wrap gap-[6px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-pill border border-border bg-bg-raised px-[9px] py-[3px] font-mono text-[10px] font-semibold text-silk-dim"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-[6px] border-t border-border pt-3">
        <button type="button" onClick={() => toggle(0)} className={reactBtnClass(active[0])}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="h-[13px] w-[13px]">
            <path d="M14 9V5a3 3 0 00-6 0v4H4l1 10a2 2 0 002 2h10a2 2 0 002-2l1-10h-6z" />
          </svg>
          {reactions[0].count}
        </button>
        <button type="button" onClick={() => toggle(1)} className={reactBtnClass(active[1])}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="h-[13px] w-[13px]">
            <path d="M12 21s-7-4.5-9.5-9C.7 8 2 4 6 4c2 0 3.5 1.2 4 2 .5-.8 2-2 4-2 4 0 5.3 4 3.5 8-2.5 4.5-9.5 9-9.5 9z" />
          </svg>
          {reactions[1].count}
        </button>
        <button type="button" onClick={() => toggle(2)} className={reactBtnClass(active[2])}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="h-[13px] w-[13px]">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 13s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
          </svg>
          💡 {reactions[2].count}
        </button>
        <button
          type="button"
          className="ml-auto inline-flex cursor-pointer items-center gap-[6px] border-none bg-transparent font-mono text-xs text-silk-faint"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[14px] w-[14px] stroke-silk-faint">
            <path d="M21 11.5a8.4 8.4 0 01-8.9 8.4A9 9 0 013 12.6 8.4 8.4 0 0111.4 4a8.5 8.5 0 019.6 7.5z" />
          </svg>
          {commentLabel}
        </button>
      </div>

      {comments && comments.length > 0 && (
        <div className="mt-[14px] border-t border-border pt-[14px]">
          {comments.map((c, i) => (
            <div key={i} className="mb-[11px] flex gap-[9px] last:mb-0">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-dim font-mono text-[10px] font-bold text-amber">
                {c.avatar}
              </div>
              <div className="flex-1 rounded-input bg-bg-raised px-3 py-[9px]">
                <span className="text-[11.5px] font-semibold text-silk">{c.who}</span>
                <div className="mt-0.5 text-[12.5px] leading-[1.5] text-silk-dim">{c.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
