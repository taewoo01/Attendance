"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteFolder } from "@/lib/files/actions";

/**
 * 본인이 만든 폴더에만 노출되는 삭제 버튼(FolderGrid가 folder.isOwner로 렌더 여부를
 * 결정). DeleteFileButton과 동일한 확인/삭제/새로고침 패턴이다.
 */
export function DeleteFolderButton({ folderId }: { folderId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!window.confirm("이 폴더를 삭제할까요?")) return;
    setPending(true);
    const result = await deleteFolder(folderId);
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
      aria-label="폴더 삭제"
      className="absolute top-2.5 right-2.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-chip border border-border bg-bg-panel text-silk-faint hover:border-[#e2543f] hover:text-[#e2543f] disabled:cursor-not-allowed"
    >
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-3 w-3 stroke-current">
        <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
      </svg>
    </button>
  );
}
