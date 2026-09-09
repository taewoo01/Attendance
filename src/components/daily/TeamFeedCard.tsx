"use client";

import type { RefObject } from "react";
import type { DailyLogChecklistItem } from "@/db/schema";

export type FeedEntry = {
  id: string;
  userId: string;
  mine?: boolean;
  name: string;
  avatar: string;
  time: string;
  desc: string;
  check: string;
  pct: number;
  /** 수정 모달을 채우는 데 쓰는 원본 데이터(desc/checklist는 표시용 파생값과 별개). */
  checklist: DailyLogChecklistItem[];
};

export type RosterMember = { userId: string; name: string };

/**
 * playground-design/daily.html의 #feedRows를 감싸는 .list-card("팀 기록").
 * feedDateLabel/feedRatio span은 CSS 캐스케이드상 `.list-head span`(font-size
 * 11.5px/color silk-faint)이 `.date-nav`의 자체 선언(12px/silk-dim)보다
 * 실제로 우선 적용되므로(직접 매칭 규칙이 상속값을 항상 이긴다) 그 결과값을
 * 그대로 재현한다 — `.date-nav`의 typography 선언은 자식에 실제로 반영되지
 * 않는 죽은 값이지만 구조 보존을 위해 컨테이너에도 그대로 남겨둔다.
 */
export function TeamFeedCard({
  label,
  ratio,
  entries,
  emptyNote,
  onPrev,
  onNext,
  onEditMine,
  containerRef,
  roster,
  selectedUserId,
  onSelectUser,
  onToggleItem,
}: {
  label: string;
  ratio: string;
  entries: FeedEntry[];
  emptyNote: string;
  onPrev: () => void;
  onNext: () => void;
  onEditMine: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
  roster: RosterMember[];
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
  onToggleItem: (index: number) => void;
}) {
  return (
    <div ref={containerRef} className="mb-[22px] overflow-hidden rounded-card border border-border bg-bg-panel">
      <div className="flex flex-wrap items-center justify-between gap-[10px] border-b border-border px-[22px] py-[18px]">
        <div className="flex items-center gap-[10px]">
          <h3 className="m-0 text-[14.5px] font-semibold">팀 기록</h3>
          <select
            value={selectedUserId}
            onChange={(e) => onSelectUser(e.target.value)}
            className="cursor-pointer rounded-chip border border-border bg-bg-panel px-2.5 py-[5px] font-mono text-[11px] text-silk-dim"
          >
            <option value="all">전체</option>
            {roster.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-[14px]">
          <span className="font-mono text-[11.5px] text-silk-faint">{ratio}</span>
          <div className="flex items-center gap-2 font-mono text-xs text-silk-dim">
            <button
              type="button"
              onClick={onPrev}
              className="h-[22px] w-[22px] cursor-pointer rounded-md border border-border bg-transparent text-silk-dim"
            >
              ‹
            </button>
            <span className="font-mono text-[11.5px] text-silk-faint">{label}</span>
            <button
              type="button"
              onClick={onNext}
              className="h-[22px] w-[22px] cursor-pointer rounded-md border border-border bg-transparent text-silk-dim"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div>
        {entries.map((e) => (
          <div
            key={e.id}
            className={`border-b border-border px-[22px] py-[17px] last:border-b-0 ${
              e.mine ? "bg-[rgba(72,217,176,0.035)]" : ""
            }`}
          >
            <div className="mb-[7px] flex flex-wrap items-center justify-between gap-[10px]">
              <span className="flex items-center gap-[7px] text-[12.5px] font-semibold text-silk">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(155deg,var(--teal),#157a5f)] text-[9.5px] font-bold text-[#04231b]">
                  {e.avatar}
                </span>
                {e.name}
                <span className="font-normal text-silk-faint"> · {e.time}</span>
              </span>
              {e.mine && (
                <button
                  type="button"
                  onClick={onEditMine}
                  className="cursor-pointer border-none bg-transparent p-0 font-mono text-[11px] text-teal hover:underline"
                >
                  수정
                </button>
              )}
            </div>
            <p className="m-0 mb-2 max-w-[66ch] text-[12.5px] leading-[1.6] text-silk-dim">{e.desc}</p>
            {e.checklist.length > 0 && (
              <div className="mb-2 flex flex-col gap-[5px]">
                {e.checklist.map((item, i) => (
                  <div
                    key={i}
                    onClick={e.mine ? () => onToggleItem(i) : undefined}
                    className={`flex items-center gap-[8px] text-[12px] ${e.mine ? "cursor-pointer" : ""}`}
                  >
                    <span
                      className={`flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[4px] border border-border ${
                        item.done ? "border-teal bg-teal" : ""
                      }`}
                    >
                      {item.done && (
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="3" className="h-2 w-2 stroke-[#04231b]">
                          <path d="M5 12l5 5 9-10" />
                        </svg>
                      )}
                    </span>
                    <span className={item.done ? "text-silk-faint line-through" : "text-silk-dim"}>{item.text}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-[6px] font-mono text-[11px] text-silk-faint">
              <div className="h-1 w-16 overflow-hidden rounded-[3px] bg-bg-raised">
                <div className="h-full rounded-[3px] bg-teal" style={{ width: `${e.pct}%` }} />
              </div>
              {e.check}
            </div>
          </div>
        ))}
        {emptyNote && (
          <div className="border-b border-border px-[22px] py-[17px] text-[12.5px] text-silk-faint last:border-b-0">
            {emptyNote}
          </div>
        )}
      </div>
    </div>
  );
}
