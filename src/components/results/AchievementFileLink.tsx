"use client";

import { useState } from "react";
import { getAchievementFileDownloadUrl } from "@/lib/results/actions";

/**
 * files 기능의 DownloadButton과 동일한 패턴(클릭 시 60초 만료 presigned URL 발급
 * 후 새 탭으로 열기) — 여기서는 아이콘 버튼이 아니라 파일명을 텍스트로 보여줘야
 * 해서(실적 하나에 첨부파일이 여러 개일 수 있다, #8) 별도 컴포넌트로 뒀다.
 */
export function AchievementFileLink({ fileId, name }: { fileId: string; name: string }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const result = await getAchievementFileDownloadUrl(fileId);
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
