"use client";

import { useState } from "react";
import { getIdeaFileDownloadUrl } from "@/lib/ideas/actions";

/**
 * AchievementFileLink(src/components/results/AchievementFileLink.tsx)와 동일한
 * 패턴 — 클릭 시 60초 만료 presigned URL을 발급받아 새 탭으로 연다.
 */
export function IdeaFileLink({ fileId, name }: { fileId: string; name: string }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const result = await getIdeaFileDownloadUrl(fileId);
    setPending(false);
    if (result.url) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-[5px] border-none bg-transparent p-0 font-mono text-[11px] text-silk-faint hover:text-teal disabled:cursor-not-allowed"
    >
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[11px] w-[11px] stroke-silk-faint">
        <path d="M4 4h11l5 5v11H4z" />
        <path d="M15 4v5h5" />
      </svg>
      {name}
    </button>
  );
}
