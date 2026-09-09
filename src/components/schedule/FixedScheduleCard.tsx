"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteFixedSchedule } from "@/lib/schedule/actions";
import { EditFixedScheduleModal, type EditableFixedSchedule } from "@/components/schedule/EditFixedScheduleModal";
import type { FixedScheduleItem } from "@/components/schedule/ScheduleSidebar";

/**
 * ScheduleSidebar의 "내 고정 시간표" 카드. 목록 자체는 원본 side-card 구조를
 * 그대로 쓰지만, TASK-032에서 항목별 삭제/수정 버튼이 추가되어(0016_fixed_schedules_rls.sql
 * 로 본인 소유 쓰기 RLS가 생긴 뒤) 이 부분만 Client Component로 분리했다.
 * "오늘" 아젠다 카드는 이 상태와 무관해 ScheduleSidebar에 Server Component로 남는다.
 */
export function FixedScheduleCard({ items }: { items: FixedScheduleItem[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditableFixedSchedule | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    const result = await deleteFixedSchedule(id);
    setDeletingId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mb-[14px] rounded-panel border border-border bg-bg-panel px-4 pt-[15px] pb-[14px]">
      <p className="m-0 mb-2.5 text-[13px] font-semibold">내 고정 시간표</p>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-baseline justify-between gap-2 border-b border-border py-1.5 text-xs last:border-b-0 last:pb-0"
        >
          <span className="w-5 shrink-0 font-mono text-[10.5px] text-amber">{item.day}</span>
          <button
            type="button"
            onClick={() => setEditing({ id: item.id, title: item.title, dayOfWeek: item.day, timeRange: item.time })}
            className="mx-2 flex-1 cursor-pointer border-none bg-transparent p-0 text-left text-xs text-silk hover:underline"
          >
            {item.title}
          </button>
          <span className="font-mono text-[10px] text-silk-faint">{item.time}</span>
          <button
            type="button"
            onClick={() => handleDelete(item.id)}
            disabled={deletingId === item.id}
            aria-label="고정 시간표 삭제"
            className="cursor-pointer border-none bg-transparent p-0 leading-none text-silk-faint hover:text-[#e2543f] disabled:cursor-not-allowed"
          >
            ×
          </button>
        </div>
      ))}
      {error && <p className="m-0 mt-2 font-mono text-[10.5px] text-[#e2543f]">{error}</p>}
      <EditFixedScheduleModal item={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
