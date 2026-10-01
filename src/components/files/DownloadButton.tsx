"use client";

import { useState } from "react";
import { getFileDownloadUrl } from "@/lib/files/actions";
import { openDownloadUrl, triggerFileDownload, type PreviewSibling } from "@/lib/files/open-download";

/**
 * playground-design/files.html의 .file-dl 다운로드 버튼(원본은 리스너 없는 정적 버튼).
 * TASK-029: 클릭 시 서버에서 60초 만료 presigned URL을 발급받아 새 탭으로 연다
 * (docs/MIGRATION.md 11절 — 클라이언트가 Storage 경로를 직접 조합하지 않음).
 * 버튼 하나가 "열기"와 "다운로드"를 겸하고 있어 실제로는 다운로드가 안 된다는
 * 오해가 있어 보기/다운로드 버튼을 분리했다 — "보기"는 항상 /preview(사이트 내
 * 뷰어)로 열리고, "다운로드"는 항상 Content-Disposition: attachment로 발급받아
 * (getFileDownloadUrl의 forceDownload) 실제 파일 저장을 보장한다.
 * siblings/index는 FileList가 넘기는 같은 목록의 전체 파일 id/name — /preview에서
 * 이전/다음 버튼으로 넘겨볼 수 있게 openDownloadUrl에 그대로 전달한다.
 */
export function DownloadButton({
  fileId,
  name,
  siblings,
  index,
}: {
  fileId: string;
  name: string;
  siblings: PreviewSibling[];
  index: number;
}) {
  const [pending, setPending] = useState<"view" | "download" | null>(null);

  async function handleView() {
    setPending("view");
    const result = await getFileDownloadUrl(fileId);
    setPending(null);
    if (result.url) {
      openDownloadUrl(result.url, name, { list: siblings, index });
    }
  }

  async function handleDownload() {
    setPending("download");
    const result = await getFileDownloadUrl(fileId, true);
    setPending(null);
    if (result.url) {
      triggerFileDownload(result.url);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleView}
        disabled={pending !== null}
        title="보기"
        aria-label="보기"
        className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-chip border border-border bg-transparent text-silk-dim hover:border-teal-dim hover:text-teal disabled:cursor-not-allowed"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-[14px] w-[14px] stroke-current">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <button
        type="button"
        onClick={handleDownload}
        disabled={pending !== null}
        title="다운로드"
        aria-label="다운로드"
        className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-chip border border-border bg-transparent text-silk-dim hover:border-teal-dim hover:text-teal disabled:cursor-not-allowed"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-[14px] w-[14px] stroke-current">
          <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
        </svg>
      </button>
    </>
  );
}
