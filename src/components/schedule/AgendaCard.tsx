"use client";

import { useState } from "react";
import { formatTimeRange } from "@/lib/schedule/calendar";
import { EditPersonalEventModal, type EditablePersonalEvent } from "@/components/schedule/EditPersonalEventModal";
import type { AgendaItem } from "@/components/schedule/ScheduleSidebar";

/**
 * ScheduleSidebar의 "오늘" 아젠다 카드. 체크인/고정 일정 항목은 그대로 텍스트로만
 * 보여주고, 본인 소유 개인 일정 항목(id/eventDate/rawTitle이 채워진 경우)만 클릭해서
 * EditPersonalEventModal로 수정할 수 있다(week/month view의 편집 항목과 동일한 모달 재사용).
 */
export function AgendaCard({ todayLabel, agenda }: { todayLabel: string; agenda: AgendaItem[] }) {
  const [editingEvent, setEditingEvent] = useState<EditablePersonalEvent | null>(null);

  return (
    <div className="mb-[14px] rounded-panel border border-border bg-bg-panel px-4 pt-[15px] pb-[14px]">
      <p className="m-0 mb-2.5 text-[13px] font-semibold">오늘 · {todayLabel}</p>
      {agenda.map((item, i) => {
        const editable = item.id && item.eventDate && item.rawTitle;
        return (
          <div key={i} className="flex gap-[9px] border-b border-border py-1.5 last:border-b-0 last:pb-0">
            <span className="min-w-10 shrink-0 font-mono text-[11px] text-teal">{formatTimeRange(item.time, item.endTime)}</span>
            <div>
              {editable ? (
                <button
                  type="button"
                  onClick={() =>
                    setEditingEvent({
                      id: item.id!,
                      title: item.rawTitle!,
                      eventDate: item.eventDate!,
                      eventTime: item.time,
                      eventEndTime: item.endTime,
                    })
                  }
                  className="cursor-pointer border-none bg-transparent p-0 text-left text-xs text-silk hover:underline"
                >
                  {item.title}
                </button>
              ) : (
                <div className="text-xs text-silk">{item.title}</div>
              )}
              <div className="mt-px text-[10.5px] text-silk-faint">{item.sub}</div>
            </div>
          </div>
        );
      })}
      <EditPersonalEventModal event={editingEvent} onClose={() => setEditingEvent(null)} />
    </div>
  );
}
