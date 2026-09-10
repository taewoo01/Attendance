"use client";

import { useEffect, useState } from "react";
import { getAchievementFileDownloadUrl } from "@/lib/results/actions";

/**
 * 실적 상세 페이지에서 이미지 첨부파일을 AchievementFileLink(클릭해야 여는 다운로드
 * 링크)와 별개로 바로 보여준다 — private 버킷이라 <img src>에 storagePath를 그대로
 * 쓸 수 없어서, 마운트되자마자(클릭을 기다리지 않고) getAchievementFileDownloadUrl로
 * presigned URL을 미리 받아온다. 발급까지의 짧은 순간에는 아무것도 그리지 않는다
 * (레이아웃 시프트보다야 낫다 — 첨부 이미지는 보통 크기가 커서 스켈레톤을 굳이
 * 만들 만큼 자주 깜빡이지 않는다).
 */
export function AchievementImagePreview({ fileId, name }: { fileId: string; name: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAchievementFileDownloadUrl(fileId).then((result) => {
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
        className="max-h-[420px] w-full rounded-input border border-border bg-bg-raised object-contain"
      />
    </a>
  );
}
