"use client";

import { useEffect, useState } from "react";
import { getIdeaFileDownloadUrl } from "@/lib/ideas/actions";
import { openDownloadUrl, triggerFileDownload } from "@/lib/files/open-download";

/**
 * 이미지는 썸네일 표시용으로 마운트 시 한 번 presigned URL을 받아온다(기존과 동일).
 * "크게 보기"/"다운로드"는 그 썸네일 URL(60초 만료)을 그대로 재사용하지 않고 클릭
 * 시점에 새로 발급받는다 — 카드가 화면에 오래 떠 있다가(피드를 읽는 동안) 클릭하면
 * 썸네일 URL이 이미 만료돼 있을 수 있어서다. "크게 보기"는 다른 파일들과 동일하게
 * /preview(사이트 내 뷰어)로 열고, "다운로드"는 Content-Disposition: attachment로
 * 발급받은 URL로 바로 저장 대화상자를 띄운다(DownloadButton과 동일한 패턴).
 */
export function IdeaImagePreview({ fileId, name }: { fileId: string; name: string }) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [pending, setPending] = useState<"view" | "download" | null>(null);

  useEffect(() => {
    let cancelled = false;
    getIdeaFileDownloadUrl(fileId).then((result) => {
      if (!cancelled && result.url) setThumbUrl(result.url);
    });
    return () => {
      cancelled = true;
    };
  }, [fileId]);

  async function handleView() {
    setPending("view");
    const result = await getIdeaFileDownloadUrl(fileId);
    setPending(null);
    if (result.url) openDownloadUrl(result.url, name);
  }

  async function handleDownload() {
    setPending("download");
    const result = await getIdeaFileDownloadUrl(fileId, true);
    if (result.url) await triggerFileDownload(result.url, name);
    setPending(null);
  }

  if (!thumbUrl) return null;

  return (
    <div className="relative">
      <button type="button" onClick={handleView} disabled={pending !== null} className="block w-full cursor-pointer">
        {/* eslint-disable-next-line @next/next/no-img-element -- presigned Storage URL, next/image 최적화 대상이 아니다 */}
        <img
          src={thumbUrl}
          alt={name}
          className="max-h-[320px] w-full rounded-input border border-border bg-bg-raised object-contain"
        />
      </button>
      <button
        type="button"
        onClick={handleDownload}
        disabled={pending !== null}
        aria-label="이미지 다운로드"
        title="다운로드"
        className="absolute right-2.5 top-2.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-chip border border-border bg-[rgba(8,13,11,0.75)] text-silk-dim hover:text-teal disabled:cursor-not-allowed"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-3.5 w-3.5 stroke-current">
          <path d="M12 4v12m0 0l-4-4m4 4l4-4" />
          <path d="M4 18v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
        </svg>
      </button>
    </div>
  );
}
