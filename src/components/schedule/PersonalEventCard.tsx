"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePersonalEvent } from "@/lib/schedule/actions";
import { EditPersonalEventModal, type EditablePersonalEvent } from "@/components/schedule/EditPersonalEventModal";
import type { PersonalEventItem } from "@/components/schedule/ScheduleSidebar";

/**
 * ScheduleSidebar의 "개인 일정" 카드 — 본인 소유 personal_events 전체를 목록으로
 * 보여주고 여기서 바로 수정/삭제한다. 캘린더(week/month view) 안에는 더 이상 삭제
 * 버튼을 두지 않는다 — 좁은 칸 안 × 버튼이 오누름/오조작을 유발해서, 삭제 경로를
 * 이 카드와 EditPersonalEventModal의 "삭제" 버튼으로 모았다(FixedScheduleCard와
 * 동일한 리스트 + × 버튼 패턴).
 */
export function PersonalEventCard({ items }: { items: PersonalEventItem[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditablePersonalEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    const result = await deletePersonalEvent(id);
    setDeletingId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mb-[14px] rounded-panel border border-border bg-bg-panel px-4 pt-[15px] pb-[14px]">
      <p className="m-0 mb-2.5 text-[13px] font-semibold">개인 일정</p>

      {items.length === 0 && (
        <p className="m-0 py-1.5 text-[11.5px] text-silk-faint">등록된 개인 일정이 없습니다.</p>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-baseline justify-between gap-2 border-b border-border py-1.5 text-xs last:border-b-0 last:pb-0"
        >
          <span className="w-[42px] shrink-0 font-mono text-[10.5px] text-amber">{item.dateLabel}</span>
          <button
            type="button"
            onClick={() =>
              setEditing({
                id: item.id,
                title: item.title,
                eventDate: item.eventDate,
                eventTime: item.eventTime,
                eventEndTime: item.eventEndTime,
              })
            }
            className="mx-2 flex-1 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap border-none bg-transparent p-0 text-left text-xs text-silk hover:underline"
          >
            {item.title}
          </button>
          <span className="shrink-0 font-mono text-[10px] text-silk-faint">{item.time}</span>
          <button
            type="button"
            onClick={() => handleDelete(item.id)}
            disabled={deletingId === item.id}
            aria-label="개인 일정 삭제"
            className="shrink-0 cursor-pointer border-none bg-transparent p-0 leading-none text-silk-faint hover:text-[#e2543f] disabled:cursor-not-allowed"
          >
            ×
          </button>
        </div>
      ))}
      {error && <p className="m-0 mt-2 font-mono text-[10.5px] text-[#e2543f]">{error}</p>}
      <EditPersonalEventModal event={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
