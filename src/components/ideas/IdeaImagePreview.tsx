"use client";

import { useEffect, useState } from "react";
import { getIdeaFileDownloadUrl } from "@/lib/ideas/actions";

/**
 * AchievementImagePreview(src/components/results/AchievementImagePreview.tsx)와
 * 동일한 패턴 — private 버킷이라 <img src>에 storagePath를 그대로 쓸 수 없어서,
 * 마운트되자마자 presigned URL을 미리 받아온다.
 */
export function IdeaImagePreview({ fileId, name }: { fileId: string; name: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getIdeaFileDownloadUrl(fileId).then((result) => {
      if (!cancelled && result.url) setUrl(result.url);
    });
    return () => {
      cancelled = true;
    };
  }, [fileId]);

  if (!url) return null;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      {/* eslint-disable-next-line @next/next/no-img-element -- presigned Storage URL, next/image 최적화 대상이 아니다 */}
      <img
        src={url}
        alt={name}
        className="max-h-[320px] w-full rounded-input border border-border bg-bg-raised object-contain"
      />
    </a>
  );
}
