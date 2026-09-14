"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteFile } from "@/lib/files/actions";

/**
 * 본인이 올린 파일에만 노출되는 삭제 버튼(FileList가 file.isOwner로 렌더 여부를 결정).
 * 확인/삭제 후 새로고침 흐름은 IdeaCard.tsx의 handleDelete와 동일한 패턴이다.
 */
export function DeleteFileButton({ fileId }: { fileId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!window.confirm("이 파일을 삭제할까요?")) return;
    setPending(true);
    const result = await deleteFile(fileId);
    setPending(false);
    if (result.error) {
      window.alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label="파일 삭제"
      className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-chip border border-border bg-transparent text-silk-dim hover:border-[#e2543f] hover:text-[#e2543f] disabled:cursor-not-allowed"
    >
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-[14px] w-[14px] stroke-current">
        <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
      </svg>
    </button>
  );
}
