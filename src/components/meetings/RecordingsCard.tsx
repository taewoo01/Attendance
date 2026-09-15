"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteMeetingRecording } from "@/lib/meetings/recordings";

export type RecordingItem = {
  id: string;
  name: string;
  url: string | null;
  createdLabel: string;
  durationLabel: string;
  isOwner: boolean;
};

/**
 * 상단바 "● 녹음" 버튼(RecordingControl.tsx)으로 만든 녹음을 회의록 페이지
 * 사이드바에 최신순으로 보여준다. 특정 회의록에 매인 게 아니라 독립 목록이라
 * MeetingsSidebar의 "이번 달 요약"/"미완료 액션아이템"과 같은 자리에 나란히 둔다.
 */
export function RecordingsCard({ items }: { items: RecordingItem[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!window.confirm("이 녹음을 삭제할까요?")) return;
    setDeletingId(id);
    setError(null);
    const result = await deleteMeetingRecording(id);
    setDeletingId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
      <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">녹음</h4>

      {items.length === 0 ? (
        <p className="m-0 font-mono text-[11.5px] leading-[1.6] text-silk-faint">
          상단바의 “● 녹음” 버튼으로 회의를 녹음하면 여기에 저장됩니다.
        </p>
      ) : (
        items.map((item) => (
          <div key={item.id} className="mb-3 last:mb-0">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="truncate text-[12px] text-silk">{item.name}</span>
              {item.isOwner && (
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  aria-label="녹음 삭제"
                  className="shrink-0 cursor-pointer border-none bg-transparent p-0 leading-none text-silk-faint hover:text-[#e2543f] disabled:cursor-not-allowed"
                >
                  ×
                </button>
              )}
            </div>
            <div className="mb-1.5 font-mono text-[10.5px] text-silk-faint">
              {item.createdLabel} · {item.durationLabel}
            </div>
            {item.url ? (
              <audio controls preload="none" src={item.url} className="h-8 w-full" />
            ) : (
              <p className="m-0 font-mono text-[10.5px] text-silk-faint">재생 링크를 불러올 수 없습니다.</p>
            )}
          </div>
        ))
      )}

      {error && <p className="m-0 mt-2 font-mono text-[11px] text-[#e2543f]">{error}</p>}
    </div>
  );
}
