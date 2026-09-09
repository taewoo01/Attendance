"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAchievement } from "@/lib/results/actions";

/**
 * ResultList/실적 상세 페이지에서 본인 소유 실적일 때만 렌더링되는 삭제 버튼
 * (r.userId === currentUserId로 걸러서 넣는다). schedule 기능의 인라인 × 버튼과
 * 동일한 패턴 — 별도 확인 모달 없이 즉시 삭제한다. 목록에서는 삭제 후 그 자리에서
 * 새로고침(router.refresh)하면 되지만, 상세 페이지는 그 실적 자체가 없어지므로
 * `redirectTo`가 있으면 그쪽으로 이동한다.
 */
export function ResultDeleteButton({ id, redirectTo }: { id: string; redirectTo?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    const result = await deleteAchievement(id);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.refresh();
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-label="실적 삭제"
        className="cursor-pointer border-none bg-transparent p-0 leading-none text-silk-faint hover:text-[#e2543f] disabled:cursor-not-allowed"
      >
        ×
      </button>
      {error && <span className="font-mono text-[10px] text-[#e2543f]">{error}</span>}
    </span>
  );
}
