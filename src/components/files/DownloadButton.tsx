"use client";

import { useState } from "react";
import { getFileDownloadUrl } from "@/lib/files/actions";

/**
 * playground-design/files.html의 .file-dl 다운로드 버튼(원본은 리스너 없는 정적 버튼).
 * TASK-029: 클릭 시 서버에서 60초 만료 presigned URL을 발급받아 새 탭으로 연다
 * (docs/MIGRATION.md 11절 — 클라이언트가 Storage 경로를 직접 조합하지 않음).
 * svg에 stroke 색상 클래스가 없는 것은 원본 quirk를 그대로 보존한 것이다
 * (FileList.tsx 기존 주석 참고 — 임의로 색을 추가하지 않는다).
 */
export function DownloadButton({ fileId }: { fileId: string }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const result = await getFileDownloadUrl(fileId);
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
      className="ml-auto flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-chip border border-border bg-transparent text-silk-dim hover:border-teal-dim hover:text-teal disabled:cursor-not-allowed"
    >
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-[14px] w-[14px]">
        <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
      </svg>
    </button>
  );
}
