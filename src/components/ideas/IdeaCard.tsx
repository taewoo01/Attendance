"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { addIdeaComment, deleteIdea, toggleIdeaReaction } from "@/lib/ideas/actions";
import { formatIdeaTimestamp } from "@/lib/ideas/format";
import { EditIdeaModal } from "@/components/ideas/EditIdeaModal";
import type { IdeaCommentRow } from "@/db/schema";

export type IdeaComment = IdeaCommentRow;
export type IdeaReaction = { count: number; active: boolean };

/** TASK-024 DB 조회 결과(→page.tsx)와 IdeasSidebar가 공유하는 도메인 타입. */
export type Idea = {
  id: string;
  userId: string | null;
  avatar: string;
  who: string;
  postedAt: string;
  title: string;
  body: string;
  tags: string[];
  reactions: [IdeaReaction, IdeaReaction, IdeaReaction];
  comments: IdeaComment[];
};

/**
 * playground-design/ideas.html의 .idea-card.
 * TASK-024 당시 `.react-btn`은 클릭 시 로컬 active만 토글하고 서버에 반영되지
 * 않았다. TASK-034: 실제 toggleIdeaReaction 호출로 바꿨고(다른 팀원의 반응도
 * 함께 보이도록 새로고침), 작성자 본인이면 수정/삭제, 댓글 작성 폼도 추가했다.
 * 3번째 리액션만 원본 텍스트에 "💡 " 접두사가 있고 나머지 둘은 없는 비대칭은
 * 그대로 보존한다.
 */
export function IdeaCard({ idea, currentUserId }: { idea: Idea; currentUserId: string | null }) {
  const router = useRouter();
  const [reactingIndex, setReactingIndex] = useState<0 | 1 | 2 | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [commentPending, setCommentPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = currentUserId !== null && idea.userId === currentUserId;

  async function handleToggleReaction(i: 0 | 1 | 2) {
    setReactingIndex(i);
    setError(null);
    const result = await toggleIdeaReaction(idea.id, i);
    setReactingIndex(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm("이 아이디어를 삭제할까요?")) return;
    setDeleting(true);
    setError(null);
    const result = await deleteIdea(idea.id);
    setDeleting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleAddComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setCommentPending(true);
    setError(null);
    const result = await addIdeaComment(idea.id, new FormData(form));
    setCommentPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    form.reset();
    setCommenting(false);
    router.refresh();
  }

  const reactBtnClass = (isActive: boolean) =>
    `inline-flex cursor-pointer items-center gap-[6px] rounded-pill border px-3 py-1.5 font-mono text-xs disabled:cursor-not-allowed disabled:opacity-60 ${
      isActive ? "border-teal-dim bg-teal-dim text-teal" : "border-border bg-bg-raised text-silk-dim"
    }`;

  return (
    <div className="mb-4 rounded-card border border-border bg-bg-panel px-5 pt-[18px] pb-4">
      <div className="mb-[11px] flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(72,217,176,0.14)] font-mono text-xs font-bold text-teal">
            {idea.avatar}
          </div>
          <div>
            <div className="text-[13px] font-semibold text-silk">{idea.who}</div>
            <div className="mt-px font-mono text-[11px] text-silk-faint">{formatIdeaTimestamp(idea.postedAt)}</div>
          </div>
        </div>
        {isOwner && (
          <div className="flex items-center gap-2.5 font-mono text-[11px] text-silk-faint">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="cursor-pointer border-none bg-transparent p-0 text-teal hover:underline"
            >
              수정
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="cursor-pointer border-none bg-transparent p-0 hover:text-[#e2543f] disabled:cursor-not-allowed"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {idea.title && <h4 className="m-0 mb-[7px] text-[15px] font-semibold text-silk">{idea.title}</h4>}
      <p className="m-0 mb-[13px] max-w-[70ch] whitespace-pre-wrap text-[13px] leading-[1.65] text-silk-dim">{idea.body}</p>

      {idea.tags.length > 0 && (
        <div className="mb-[14px] flex flex-wrap gap-[6px]">
          {idea.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-pill border border-border bg-bg-raised px-[9px] py-[3px] font-mono text-[10px] font-semibold text-silk-dim"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-[6px] border-t border-border pt-3">
        <button
          type="button"
          onClick={() => handleToggleReaction(0)}
          disabled={reactingIndex === 0}
          className={reactBtnClass(idea.reactions[0].active)}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="h-[13px] w-[13px]">
            <path d="M14 9V5a3 3 0 00-6 0v4H4l1 10a2 2 0 002 2h10a2 2 0 002-2l1-10h-6z" />
          </svg>
          {idea.reactions[0].count}
        </button>
        <button
          type="button"
          onClick={() => handleToggleReaction(1)}
          disabled={reactingIndex === 1}
          className={reactBtnClass(idea.reactions[1].active)}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="h-[13px] w-[13px]">
            <path d="M12 21s-7-4.5-9.5-9C.7 8 2 4 6 4c2 0 3.5 1.2 4 2 .5-.8 2-2 4-2 4 0 5.3 4 3.5 8-2.5 4.5-9.5 9-9.5 9z" />
          </svg>
          {idea.reactions[1].count}
        </button>
        <button
          type="button"
          onClick={() => handleToggleReaction(2)}
          disabled={reactingIndex === 2}
          className={reactBtnClass(idea.reactions[2].active)}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="h-[13px] w-[13px]">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 13s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
          </svg>
          💡 {idea.reactions[2].count}
        </button>
        <button
          type="button"
          onClick={() => setCommenting((v) => !v)}
          className="ml-auto inline-flex cursor-pointer items-center gap-[6px] border-none bg-transparent font-mono text-xs text-silk-faint"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[14px] w-[14px] stroke-silk-faint">
            <path d="M21 11.5a8.4 8.4 0 01-8.9 8.4A9 9 0 013 12.6 8.4 8.4 0 0111.4 4a8.5 8.5 0 019.6 7.5z" />
          </svg>
          댓글 {idea.comments.length}
        </button>
      </div>

      {error && <p className="m-0 mt-3 font-mono text-[11px] text-[#e2543f]">{error}</p>}

      {idea.comments.length > 0 && (
        <div className="mt-[14px] border-t border-border pt-[14px]">
          {idea.comments.map((c, i) => (
            <div key={i} className="mb-[11px] flex gap-[9px] last:mb-0">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-dim font-mono text-[10px] font-bold text-amber">
                {c.avatar}
              </div>
              <div className="flex-1 rounded-input bg-bg-raised px-3 py-[9px]">
                <span className="text-[11.5px] font-semibold text-silk">{c.who}</span>
                {c.postedAt && (
                  <span className="ml-2 font-mono text-[10px] text-silk-faint">{formatIdeaTimestamp(c.postedAt)}</span>
                )}
                <div className="mt-0.5 text-[12.5px] leading-[1.5] text-silk-dim">{c.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {commenting && (
        <form onSubmit={handleAddComment} className="mt-[14px] flex items-center gap-2 border-t border-border pt-[14px]">
          <input
            name="text"
            type="text"
            required
            placeholder="댓글을 입력하세요..."
            className="flex-1 rounded-input border border-border bg-bg-raised px-3 py-2 font-sans text-[12.5px] text-silk focus:border-teal-dim focus:outline-none"
          />
          <button
            type="submit"
            disabled={commentPending}
            className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-3 py-2 text-xs font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {commentPending ? "등록 중..." : "등록"}
          </button>
        </form>
      )}

      {editing && <EditIdeaModal idea={idea} onClose={() => setEditing(false)} />}
    </div>
  );
}
