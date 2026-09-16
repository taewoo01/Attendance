"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePersonalEvent } from "@/lib/schedule/actions";
import { DOW_KO, weekdayIndex } from "@/lib/date";
import { EditPersonalEventModal, type EditablePersonalEvent } from "@/components/schedule/EditPersonalEventModal";
import type { PersonalEventItem } from "@/components/schedule/ScheduleSidebar";

const DAY_ORDER = ["월", "화", "수", "목", "금", "토", "일"];

/**
 * ScheduleSidebar의 "팀 미고정 일정" 카드. PersonalEventCard와 동일한 요일별 그룹 +
 * 목록 패턴이지만, 두 가지가 다르다: (1) 본인 것만이 아니라 team=true인 personal_events
 * 전체를 보여준다 (2) 등록자와 무관하게 팀원 누구나 수정/삭제할 수 있어 소유권으로
 * 버튼을 숨기지 않는다 — 서버 액션(updatePersonalEvent/deletePersonalEvent)이 team=true
 * 행은 어차피 아무나 수정/삭제하도록 허용하므로 UI에서도 그대로 노출한다.
 * 누가 등록했는지 알 수 있게 FixedScheduleCard의 "전체" 탭과 동일하게 이름을 같이 보여준다.
 */
export function TeamEventCard({ items }: { items: PersonalEventItem[] }) {
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
      <p className="m-0 mb-2.5 text-[13px] font-semibold">팀 미고정 일정</p>

      {groups.length === 0 && <p className="m-0 py-1.5 text-[11.5px] text-silk-faint">등록된 팀 미고정 일정이 없습니다.</p>}

      {groups.map(({ day, items: dayItems }) => {
        const isCollapsed = collapsedDays.has(day);
        return (
          <div key={day} className="border-b border-border last:border-b-0">
            <button
              type="button"
              onClick={() => toggleDay(day)}
              className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent py-1.5 text-left"
            >
              <span className="font-mono text-[10.5px] font-semibold text-[#4a9eff]">
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
                      {item.name ? `${item.name} · ${item.title}` : item.title}
                    </button>
                    <span className="shrink-0 font-mono text-[10px] text-silk-faint">{item.time}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      aria-label="팀 미고정 일정 삭제"
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
      <EditPersonalEventModal event={editing} heading="팀 미고정 일정 수정" onClose={() => setEditing(null)} />
    </div>
  );
}
