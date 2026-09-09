"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePersonalEvent } from "@/lib/schedule/actions";
import { DOW_KO, weekdayIndex } from "@/lib/date";
import { EditPersonalEventModal, type EditablePersonalEvent } from "@/components/schedule/EditPersonalEventModal";
import type { PersonalEventItem } from "@/components/schedule/ScheduleSidebar";

const DAY_ORDER = ["월", "화", "수", "목", "금", "토", "일"];

/**
 * ScheduleSidebar의 "개인 일정" 카드 — 본인 소유 personal_events 전체를 목록으로
 * 보여주고 여기서 바로 수정/삭제한다. 캘린더(week/month view) 안에는 더 이상 삭제
 * 버튼을 두지 않는다 — 좁은 칸 안 × 버튼이 오누름/오조작을 유발해서, 삭제 경로를
 * 이 카드와 EditPersonalEventModal의 "삭제" 버튼으로 모았다(FixedScheduleCard와
 * 동일한 리스트 + × 버튼 패턴).
 * 개인 일정도 계속 쌓이면 카드가 한없이 길어져서, FixedScheduleCard와 동일하게
 * eventDate의 요일(weekdayIndex)로 그룹을 나누고 그룹 헤더를 눌러 접고 펼 수
 * 있게 했다. 기본값은 전부 펼친 상태라 항목이 적을 때는 기존과 동일하게 보인다.
 */
export function PersonalEventCard({ items }: { items: PersonalEventItem[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditablePersonalEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());

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

  function toggleDay(day: string) {
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  const groups = DAY_ORDER.map((day) => ({
    day,
    items: items.filter((item) => DOW_KO[weekdayIndex(item.eventDate)] === day),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="mb-[14px] rounded-panel border border-border bg-bg-panel px-4 pt-[15px] pb-[14px]">
      <p className="m-0 mb-2.5 text-[13px] font-semibold">개인 일정</p>

      {groups.length === 0 && (
        <p className="m-0 py-1.5 text-[11.5px] text-silk-faint">등록된 개인 일정이 없습니다.</p>
      )}

      {groups.map(({ day, items: dayItems }) => {
        const isCollapsed = collapsedDays.has(day);
        return (
          <div key={day} className="border-b border-border last:border-b-0">
            <button
              type="button"
              onClick={() => toggleDay(day)}
              className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent py-1.5 text-left"
            >
              <span className="font-mono text-[10.5px] font-semibold text-amber">
                {day}요일 <span className="text-silk-faint">· {dayItems.length}건</span>
              </span>
              <span className="text-[9px] text-silk-faint">{isCollapsed ? "▸" : "▾"}</span>
            </button>
            {!isCollapsed && (
              <div className="pb-1.5">
                {dayItems.map((item) => (
                  <div key={item.id} className="flex items-baseline justify-between gap-2 py-1 text-xs">
                    <span className="w-9 shrink-0 font-mono text-[10px] text-silk-faint">{item.dateLabel}</span>
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
                      className="flex-1 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap border-none bg-transparent p-0 text-left text-xs text-silk hover:underline"
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
              </div>
            )}
          </div>
        );
      })}
      {error && <p className="m-0 mt-2 font-mono text-[10.5px] text-[#e2543f]">{error}</p>}
      <EditPersonalEventModal event={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
