/**
 * playground-design/ideas.html의 .composer(아이디어 작성 박스).
 * textarea, 첨부 버튼 2개, "게시" 버튼 전부 원본 <script>에 이벤트 리스너가
 * 없는 순수 장식 요소라 상태 없이 Server Component로 유지한다.
 */
export function IdeaComposer() {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-card border border-border bg-bg-panel px-[18px] py-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(155deg,var(--teal),#157a5f)] font-mono text-xs font-bold text-[#04231b]">
        연
      </span>
      <div className="flex-1">
        <textarea
          rows={1}
          placeholder="떠오른 아이디어를 자유롭게 적어보세요..."
          className="min-h-[22px] w-full resize-none border-none bg-transparent py-1.5 font-sans text-[13.5px] text-silk placeholder:text-silk-faint focus:outline-none"
        />
        <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2.5">
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
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-3 py-[7px] text-xs font-semibold text-[#04231b]"
          >
            게시
          </button>
        </div>
      </div>
    </div>
  );
}
