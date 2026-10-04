"use client";

type MeetingsPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

/** 회의록 목록 하단 페이지네이션. 회의록이 쌓여 목록이 끝없이 길어지는 것을 막는다. */
export function MeetingsPagination({ page, totalPages, onPageChange }: MeetingsPaginationProps) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="mt-3.5 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={prevDisabled}
        className="cursor-pointer rounded-button border border-border px-2.5 py-1 font-mono text-[11.5px] text-silk-dim hover:border-teal-dim hover:text-silk disabled:cursor-not-allowed disabled:opacity-40"
      >
        이전
      </button>
      <span className="px-2 font-mono text-[11.5px] text-silk-faint">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={nextDisabled}
        className="cursor-pointer rounded-button border border-border px-2.5 py-1 font-mono text-[11.5px] text-silk-dim hover:border-teal-dim hover:text-silk disabled:cursor-not-allowed disabled:opacity-40"
      >
        다음
      </button>
    </div>
  );
}
