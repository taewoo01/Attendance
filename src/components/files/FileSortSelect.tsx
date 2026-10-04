"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";

export type FileSortOrder = "newest" | "oldest";

type FileSortSelectProps = {
  folder: string | null;
  type: string | null;
  sort: FileSortOrder;
};

/** 자료실 파일 목록을 업로드일 기준 최신순/오래된순으로 정렬하는 드롭다운. */
export function FileSortSelect({ folder, type, sort }: FileSortSelectProps) {
  const router = useRouter();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as FileSortOrder;
    const params = new URLSearchParams();
    if (folder) params.set("folder", folder);
    if (type) params.set("type", type);
    if (value !== "newest") params.set("sort", value);
    const qs = params.toString();
    router.push(qs ? `/files?${qs}` : "/files");
  }

  return (
    <select
      value={sort}
      onChange={handleChange}
      aria-label="파일 정렬"
      className="cursor-pointer rounded-button border border-border bg-bg-panel px-2.5 py-1.5 font-mono text-[11.5px] text-silk-dim hover:border-teal-dim focus:border-teal focus:outline-none"
    >
      <option value="newest">최신순</option>
      <option value="oldest">오래된순</option>
    </select>
  );
}
