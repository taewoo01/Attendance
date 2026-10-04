"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";

type FileTypeFilterProps = {
  folder: string | null;
  availableTypes: string[];
  selectedType: string | null;
  sort: string | null;
};

/** 자료실 파일 목록을 확장자별로 필터링하는 드롭다운. 현재 폴더에 실제로 존재하는 확장자만 보여준다. */
export function FileTypeFilter({ folder, availableTypes, selectedType, sort }: FileTypeFilterProps) {
  const router = useRouter();

  if (availableTypes.length === 0) return null;

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    const params = new URLSearchParams();
    if (folder) params.set("folder", folder);
    if (value !== "all") params.set("type", value);
    if (sort) params.set("sort", sort);
    const qs = params.toString();
    router.push(qs ? `/files?${qs}` : "/files");
  }

  return (
    <select
      value={selectedType ?? "all"}
      onChange={handleChange}
      aria-label="파일 형식 필터"
      className="cursor-pointer rounded-button border border-border bg-bg-panel px-2.5 py-1.5 font-mono text-[11.5px] text-silk-dim hover:border-teal-dim focus:border-teal focus:outline-none"
    >
      <option value="all">전체 형식</option>
      {availableTypes.map((ext) => (
        <option key={ext} value={ext}>
          {ext.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
