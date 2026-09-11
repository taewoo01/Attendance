"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { addIdeaComment, deleteIdea, deleteIdeaComment, toggleIdeaReaction, updateIdeaComment } from "@/lib/ideas/actions";
import { formatIdeaTimestamp } from "@/lib/ideas/format";
import { EditIdeaModal } from "@/components/ideas/EditIdeaModal";
import { IdeaFileLink } from "@/components/ideas/IdeaFileLink";
import { IdeaImagePreview } from "@/components/ideas/IdeaImagePreview";
import { isImageExtension } from "@/lib/files/upload-shared";
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
  links: string[];
  files: { id: string; name: string }[];
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
 * 아이디어 페이지 상세화: 리액션 버튼 3개가 항상 나란히 펼쳐져 있던 걸 트리거
 * 버튼 1개로 합쳤다 — 클릭하거나(터치) 마우스를 올리면(호버) 팝오버로 3개
 * 옵션이 펼쳐진다(Facebook류 리액션 피커와 동일한 패턴). 팝오버 바깥을
 * 클릭하면 닫히도록 pointerdown 리스너를 둔다. 댓글 쪽은 원래 "댓글 N"
 * 버튼 하나가 개수 표시와 작성폼 토글을 겸했다 — 카카오톡류처럼 개수는
 * 말풍선 아이콘+숫자만 있는 순수 표시(`<span>`, 클릭 불가)로 분리하고,
 * "댓글작성"은 별도의 명확한 pill 버튼(reactBtnClass, commenting 상태를
 * active 표시로 재사용)으로 나눴다. 댓글 작성자 본인이면(`c.userId === currentUserId`,
 * `id`/`userId`가 없는 레거시 댓글은 항상 제외) 댓글 오른쪽에 수정/삭제가 뜬다 —
 * 아이디어 본문 수정과 달리 모달을 새로 열지 않고 그 댓글 자리에서 바로
 * 인라인으로 편집한다(댓글 하나 고치자고 모달을 띄우는 건 과함).
 */
export function IdeaCard({ idea, currentUserId }: { idea: Idea; currentUserId: string | null }) {
  const router = useRouter();
  const [reactingIndex, setReactingIndex] = useState<0 | 1 | 2 | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [commentPending, setCommentPending] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [commentActionPending, setCommentActionPending] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUserId !== null && idea.userId === currentUserId;
  const totalReactionCount = idea.reactions[0].count + idea.reactions[1].count + idea.reactions[2].count;
  const anyReactionActive = idea.reactions.some((r) => r.active);

  useEffect(() => {
    if (!pickerOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [pickerOpen]);

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

  async function handleUpdateComment(e: FormEvent<HTMLFormElement>, commentId: string) {
    e.preventDefault();
    setCommentActionPending(true);
    setError(null);
    const result = await updateIdeaComment(idea.id, commentId, new FormData(e.currentTarget));
    setCommentActionPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditingCommentId(null);
    router.refresh();
  }

  async function handleDeleteComment(commentId: string) {
    if (!window.confirm("이 댓글을 삭제할까요?")) return;
    setCommentActionPending(true);
    setError(null);
    const result = await deleteIdeaComment(idea.id, commentId);
    setCommentActionPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
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

      {(() => {
        const imageFiles = idea.files.filter((f) => isImageExtension(f.name));
        const nonImageFiles = idea.files.filter((f) => !isImageExtension(f.name));
        if (imageFiles.length === 0 && nonImageFiles.length === 0 && idea.links.length === 0) return null;
        return (
          <div className="mb-[14px] flex flex-col gap-2">
            {imageFiles.length > 0 && (
              <div className="flex flex-col gap-2">
                {imageFiles.map((f) => (
                  <IdeaImagePreview key={f.id} fileId={f.id} name={f.name} />
                ))}
              </div>
            )}
            {(nonImageFiles.length > 0 || idea.links.length > 0) && (
              <div className="flex flex-wrap items-center gap-[14px]">
                {nonImageFiles.map((f) => (
                  <IdeaFileLink key={f.id} fileId={f.id} name={f.name} />
                ))}
                {idea.links.map((link, i) => (
                  <a
                    key={link + i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-[5px] font-mono text-[11px] text-teal hover:underline"
                  >
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[11px] w-[11px] stroke-teal">
                      <path d="M9 15l6-6M11 6h5a2 2 0 012 2v5M13 18H8a2 2 0 01-2-2v-5" />
                    </svg>
                    링크{idea.links.length > 1 ? ` ${i + 1}` : ""}
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      <div className="flex items-center gap-[6px] border-t border-border pt-3">
        <div
          ref={pickerRef}
          className="relative"
          onMouseEnter={() => setPickerOpen(true)}
          onMouseLeave={() => setPickerOpen(false)}
        >
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className={reactBtnClass(anyReactionActive)}
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="h-[13px] w-[13px] stroke-current">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            {totalReactionCount}
          </button>

          {pickerOpen && (
            // bottom-full로 트리거 바로 위(간격 0)에 붙이고, 보여줄 간격은 margin이
            // 아니라 이 브리지 div의 pb-2(패딩)로 만든다 — margin(mb-2)이었을 때는
            // 트리거와 팝오버 사이의 그 8px 구간이 어느 요소의 박스에도 속하지 않는
            // "빈 공간"이라 마우스가 그 위를 지나가는 순간 래퍼의 onMouseLeave가
            // 먼저 발동해 버튼을 누르기도 전에 팝오버가 사라졌다. 패딩은 이 div의
            // 박스에 포함되므로(마우스오버 판정에 들어감) 트리거→팝오버로 이동하는
            // 동안 계속 래퍼 안에 있는 것으로 인식된다.
            <div className="absolute bottom-full left-0 z-20 pb-2">
              <div className="flex items-center gap-[6px] whitespace-nowrap rounded-pill border border-border bg-bg-panel p-1.5 shadow-[0_8px_20px_rgba(4,10,8,0.35)]">
                <button
                  type="button"
                  onClick={() => handleToggleReaction(0)}
                  disabled={reactingIndex === 0}
                  className={reactBtnClass(idea.reactions[0].active)}
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="h-[13px] w-[13px] stroke-current">
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
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="h-[13px] w-[13px] stroke-current">
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
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="h-[13px] w-[13px] stroke-current">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 13s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
                  </svg>
                  💡 {idea.reactions[2].count}
                </button>
              </div>
            </div>
          )}
        </div>

        <button type="button" onClick={() => setCommenting((v) => !v)} className={reactBtnClass(commenting)}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[13px] w-[13px] stroke-current">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          댓글작성
        </button>

        <span className="ml-auto inline-flex items-center gap-[5px] font-mono text-xs text-silk-faint">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[13px] w-[13px] stroke-current">
            <path d="M21 11.5a8.4 8.4 0 01-8.9 8.4A9 9 0 013 12.6 8.4 8.4 0 0111.4 4a8.5 8.5 0 019.6 7.5z" />
          </svg>
          {idea.comments.length}
        </span>
      </div>

      {error && <p className="m-0 mt-3 font-mono text-[11px] text-[#e2543f]">{error}</p>}

      {idea.comments.length > 0 && (
        <div className="mt-[14px] border-t border-border pt-[14px]">
          {idea.comments.map((c, i) => {
            const isCommentOwner = !!c.id && currentUserId !== null && c.userId === currentUserId;
            const isEditingThis = !!c.id && editingCommentId === c.id;

            return (
              <div key={c.id ?? i} className="mb-[11px] flex gap-[9px] last:mb-0">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-dim font-mono text-[10px] font-bold text-amber">
                  {c.avatar}
                </div>
                <div className="flex-1 rounded-input bg-bg-raised px-3 py-[9px]">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11.5px] font-semibold text-silk">{c.who}</span>
                      {c.postedAt && (
                        <span className="ml-2 font-mono text-[10px] text-silk-faint">
                          {formatIdeaTimestamp(c.postedAt)}
                        </span>
                      )}
                    </div>
                    {isCommentOwner && !isEditingThis && (
                      <div className="flex shrink-0 items-center gap-2 font-mono text-[10px] text-silk-faint">
                        <button
                          type="button"
                          onClick={() => setEditingCommentId(c.id!)}
                          className="cursor-pointer border-none bg-transparent p-0 text-teal hover:underline"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id!)}
                          disabled={commentActionPending}
                          className="cursor-pointer border-none bg-transparent p-0 hover:text-[#e2543f] disabled:cursor-not-allowed"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditingThis ? (
                    <form
                      onSubmit={(e) => handleUpdateComment(e, c.id!)}
                      className="mt-1.5 flex items-center gap-1.5"
                    >
                      <input
                        name="text"
                        type="text"
                        required
                        defaultValue={c.text}
                        autoFocus
                        className="flex-1 rounded-input border border-border bg-bg-panel px-2.5 py-[5px] font-sans text-[12.5px] text-silk focus:border-teal-dim focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={commentActionPending}
                        className="shrink-0 cursor-pointer rounded-button border border-teal bg-teal px-2.5 py-[5px] font-mono text-[11px] font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCommentId(null)}
                        className="shrink-0 cursor-pointer rounded-button border border-border bg-transparent px-2.5 py-[5px] font-mono text-[11px] text-silk-dim"
                      >
                        취소
                      </button>
                    </form>
                  ) : (
                    <div className="mt-0.5 text-[12.5px] leading-[1.5] text-silk-dim">{c.text}</div>
                  )}
                </div>
              </div>
            );
          })}
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
