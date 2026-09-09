"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type RefObject } from "react";
import { createIdea } from "@/lib/ideas/actions";

/**
 * playground-design/ideas.html의 .composer(아이디어 작성 박스). 원본은
 * textarea 하나만 있고 제목/태그 입력이 없다 — TASK-034에서 실제 작성
 * 기능을 붙이면서 "제목(선택)"/"태그(선택)" 입력을 최소한으로 추가했다
 * (원본 title/tags 필드가 실데이터에 존재하는데 입력할 방법이 없었음).
 * 첨부(이미지/링크) 버튼은 원본처럼 여전히 장식 요소로 남긴다(실제 업로드는
 * 이번 범위 밖).
 */
export function IdeaComposer({ textareaRef }: { textareaRef: RefObject<HTMLTextAreaElement | null> }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setPending(true);
    setError(null);

    const result = await createIdea(new FormData(form));

    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    form.reset();
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-5 flex items-start gap-3 rounded-card border border-border bg-bg-panel px-[18px] py-4"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(155deg,var(--teal),#157a5f)] font-mono text-xs font-bold text-[#04231b]">
        +
      </span>
      <div className="flex-1">
        <input
          name="title"
          type="text"
          placeholder="제목 (선택)"
          className="mb-1.5 w-full border-none bg-transparent font-sans text-[13.5px] font-semibold text-silk placeholder:font-normal placeholder:text-silk-faint focus:outline-none"
        />
        <textarea
          ref={textareaRef}
          name="body"
          required
          rows={1}
          placeholder="떠오른 아이디어를 자유롭게 적어보세요..."
          className="min-h-[22px] w-full resize-none border-none bg-transparent py-1.5 font-sans text-[13.5px] text-silk placeholder:text-silk-faint focus:outline-none"
        />
        <input
          name="tags"
          type="text"
          placeholder="태그 (쉼표로 구분, 선택)"
          className="mb-2.5 w-full border-none bg-transparent font-mono text-[11.5px] text-silk-dim placeholder:text-silk-faint focus:outline-none"
        />
        <div className="flex items-center justify-between border-t border-border pt-2.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                title="이미지 첨부"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-chip border border-border bg-transparent text-silk-faint"
              >
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[14px] w-[14px] stroke-current">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </button>
              <button
                type="button"
                title="링크 첨부"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-chip border border-border bg-transparent text-silk-faint"
              >
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[14px] w-[14px] stroke-current">
                  <path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" />
                  <path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" />
                </svg>
              </button>
            </div>
            {error && <span className="font-mono text-[11px] text-[#e2543f]">{error}</span>}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-3 py-[7px] text-xs font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "게시 중..." : "게시"}
          </button>
        </div>
      </div>
    </form>
  );
}
