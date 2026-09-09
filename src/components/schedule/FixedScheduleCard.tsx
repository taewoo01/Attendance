"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteFixedSchedule } from "@/lib/schedule/actions";
import { EditFixedScheduleModal, type EditableFixedSchedule } from "@/components/schedule/EditFixedScheduleModal";
import type { FixedScheduleItem } from "@/components/schedule/ScheduleSidebar";

const DAY_ORDER = ["월", "화", "수", "목", "금", "토", "일"];

/**
 * ScheduleSidebar의 "고정 시간표" 카드. "내 고정 시간표"(본인 것만)와 "전체 고정
 * 시간표"(팀 전체, 예: 다른 팀원의 알바 시간표)는 서로 다른 데이터라 하나로 합치지
 * 않고 탭으로 나눠 보여준다. "전체" 탭에서도 본인 소유 항목만 수정/삭제 가능하다
 * (다른 사람 것은 읽기 전용) — deleteFixedSchedule/updateFixedSchedule 자체가 서버에서
 * userId를 검사해 막아주지만, UI에서도 애초에 버튼을 보여주지 않는다.
 * 일정이 쌓이면 카드가 한없이 길어지는 문제가 있어, 요일별로 그룹을 나누고
 * 그룹 헤더를 눌러 접고 펼 수 있게 했다(PersonalEventCard와 동일한 패턴).
 * 기본값은 전부 펼친 상태(collapsedDays가 빈 Set)라 기존처럼 항목이 적을 때는
 * 동작이 그대로고, 요일별로 늘어날 때만 필요한 요일을 접어서 줄일 수 있다.
 */
export function FixedScheduleCard({
  items,
  allItems,
  userId,
}: {
  items: FixedScheduleItem[];
  allItems: FixedScheduleItem[];
  userId?: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"mine" | "all">("mine");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditableFixedSchedule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());

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

  function toggleDay(day: string) {
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  const visibleItems =
    tab === "mine" ? items : [...allItems].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));

  const groups = DAY_ORDER.map((day) => ({ day, items: visibleItems.filter((item) => item.day === day) })).filter(
    (g) => g.items.length > 0,
  );

  return (
    <div className="mb-[14px] rounded-panel border border-border bg-bg-panel px-4 pt-[15px] pb-[14px]">
      <div className="mb-2.5 flex w-fit overflow-hidden rounded-chip border border-border">
        <button
          type="button"
          onClick={() => setTab("mine")}
          className={`cursor-pointer border-none px-3 py-1 font-mono text-[10px] font-semibold ${
            tab === "mine" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
          }`}
        >
          내 고정 시간표
        </button>
        <button
          type="button"
          onClick={() => setTab("all")}
          className={`cursor-pointer border-none px-3 py-1 font-mono text-[10px] font-semibold ${
            tab === "all" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
          }`}
        >
          전체 고정 시간표
        </button>
      </div>

      {groups.length === 0 && (
        <p className="m-0 py-1.5 text-[11.5px] text-silk-faint">등록된 고정 시간표가 없습니다.</p>
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
                {dayItems.map((item) => {
                  const editable = tab === "mine" || item.userId === userId;
                  const label = tab === "all" ? `${item.name ?? ""} · ${item.title}` : item.title;
                  return (
                    <div key={item.id} className="flex items-baseline justify-between gap-2 py-1 text-xs">
                      {editable ? (
                        <button
                          type="button"
                          onClick={() =>
                            setEditing({
                              id: item.id,
                              title: item.title,
                              dayOfWeek: item.day,
                              startTime: item.startTime,
                              endTime: item.endTime,
                            })
                          }
                          className="flex-1 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap border-none bg-transparent p-0 text-left text-xs text-silk hover:underline"
                        >
                          {label}
                        </button>
                      ) : (
                        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-silk-dim">
                          {label}
                        </span>
                      )}
                      <span className="shrink-0 font-mono text-[10px] text-silk-faint">{item.time}</span>
                      {editable && (
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          aria-label="고정 시간표 삭제"
                          className="shrink-0 cursor-pointer border-none bg-transparent p-0 leading-none text-silk-faint hover:text-[#e2543f] disabled:cursor-not-allowed"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {error && <p className="m-0 mt-2 font-mono text-[10.5px] text-[#e2543f]">{error}</p>}
      <EditFixedScheduleModal item={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
