"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toggleMeetingAction } from "@/lib/meetings/actions";

export type OpenActionItem = { meetingId: string; actionIndex: number; title: string; meta: string };

/**
 * MeetingsSidebar의 "미완료 액션아이템" 카드. 원본의 `.chk`는 클릭 리스너가
 * 없는 장식용 체크박스였다(MeetingsSidebar 옛 주석 참고) — TASK-033에서
 * MeetingCard의 액션 아이템 체크박스와 동일한 toggleMeetingAction을 호출하도록
 * 바꿔서 카드/사이드바 어느 쪽에서 체크해도 같은 상태로 동기화된다.
 */
export function OpenActionsCard({ items }: { items: OpenActionItem[] }) {
  const router = useRouter();
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle(item: OpenActionItem) {
    const key = `${item.meetingId}-${item.actionIndex}`;
    setTogglingKey(key);
    setError(null);
    const result = await toggleMeetingAction(item.meetingId, item.actionIndex);
    setTogglingKey(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
      <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">미완료 할 일</h4>
      {items.map((item) => {
        const key = `${item.meetingId}-${item.actionIndex}`;
        return (
          <div key={key} className="flex items-start gap-[9px] border-b border-border py-2 last:border-b-0 last:pb-0">
            <input
              type="checkbox"
              disabled={togglingKey === key}
              onChange={() => handleToggle(item)}
              aria-label="할 일 완료 토글"
              className="mt-0.5 h-[14px] w-[14px] shrink-0 cursor-pointer rounded-[4px] disabled:cursor-not-allowed"
            />
            <div className="flex-1">
              <div className="text-xs leading-[1.4] text-silk">{item.title}</div>
              <div className="mt-[3px] font-mono text-[10px] text-silk-faint">{item.meta}</div>
            </div>
          </div>
        );
      })}
      {error && <p className="m-0 mt-2 font-mono text-[10.5px] text-[#e2543f]">{error}</p>}
    </div>
  );
}
