import Link from "next/link";

type FilesPaginationProps = {
  page: number;
  totalPages: number;
  folder: string | null;
  type: string | null;
  sort: string | null;
};

function hrefFor(page: number, folder: string | null, type: string | null, sort: string | null): string {
  const params = new URLSearchParams();
  if (folder) params.set("folder", folder);
  if (type) params.set("type", type);
  if (sort) params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/files?${qs}` : "/files";
}

/** 자료실 파일 목록 하단 페이지네이션. 파일이 쌓여 목록이 끝없이 길어지는 것을 막는다. */
export function FilesPagination({ page, totalPages, folder, type, sort }: FilesPaginationProps) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="flex items-center justify-center gap-1.5 border-t border-border px-[22px] py-3">
      <Link
        href={hrefFor(page - 1, folder, type, sort)}
        aria-disabled={prevDisabled}
        tabIndex={prevDisabled ? -1 : undefined}
        className={`rounded-button border border-border px-2.5 py-1 font-mono text-[11.5px] ${
          prevDisabled
            ? "pointer-events-none text-silk-faint opacity-40"
            : "text-silk-dim hover:border-teal-dim hover:text-silk"
        }`}
      >
        이전
      </Link>
      <span className="px-2 font-mono text-[11.5px] text-silk-faint">
        {page} / {totalPages}
      </span>
      <Link
        href={hrefFor(page + 1, folder, type, sort)}
        aria-disabled={nextDisabled}
        tabIndex={nextDisabled ? -1 : undefined}
        className={`rounded-button border border-border px-2.5 py-1 font-mono text-[11.5px] ${
          nextDisabled
            ? "pointer-events-none text-silk-faint opacity-40"
            : "text-silk-dim hover:border-teal-dim hover:text-silk"
        }`}
      >
        다음
      </Link>
    </div>
  );
}
