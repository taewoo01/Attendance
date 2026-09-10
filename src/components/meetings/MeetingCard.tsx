"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteMeeting, toggleMeetingAction } from "@/lib/meetings/actions";
import { EditMeetingModal } from "@/components/meetings/EditMeetingModal";
import type { MeetingActionRow } from "@/db/schema";

export type MeetingAction = MeetingActionRow;

/** 참석자 뱃지를 이 수까지만 펼쳐 보여주고, 나머지는 "+N명" 뱃지로 접는다. */
const ATTENDEES_VISIBLE_LIMIT = 5;

export type Meeting = {
  id: string;
  title: string;
  meetingDate: string;
  /** ISO 날짜("YYYY-MM-DD", 선택) — EditMeetingModal의 type="date" defaultValue로 쓴다. */
  meetingDateKey: string;
  /** "HH:MM"(선택) — EditMeetingModal의 type="time" defaultValue로 쓴다. */
  meetingTime: string;
  place: string;
  attendees: string[];
  /** 선택 사항 — 미지정이면 빈 문자열. */
  presenter: string;
  /**
   * "rows"면 agenda[i]/decisions[i]가 짝지어진 것(decisions[i]가 빈 문자열일 수 있음).
   * "text"면 agenda[0]/decisions[0]에 줄바꿈이 보존된 원문이 통째로 들어있다.
   * 그 외(과거 데이터, "")는 각각 독립된 줄 단위 목록으로 취급한다.
   */
  notesFormat: string;
  agenda: string[];
  decisions: string[];
  actions: MeetingAction[];
  tag: string;
  recorder: string;
};

/**
 * playground-design/meetings.html의 .mtg-card. 원본 <script>는 카드 내부를
 * 전혀 건드리지 않는 순수 정적 영역이었으나, TASK-033에서 수정/삭제 버튼과
 * 액션 아이템 완료 체크박스(원본에 없던 새 UI — 사이드바의 죽은 `.chk`와 달리
 * 카드 쪽엔 원래 체크박스 자체가 없었다)를 추가해 Client Component로 바꿨다.
 */
export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingIndex, setTogglingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm("이 회의록을 삭제할까요?")) return;
    setDeleting(true);
    setError(null);
    const result = await deleteMeeting(meeting.id);
    setDeleting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleToggle(actionIndex: number) {
    setTogglingIndex(actionIndex);
    setError(null);
    const result = await toggleMeetingAction(meeting.id, actionIndex);
    setTogglingIndex(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mb-4 rounded-card border border-border bg-bg-panel px-[22px] pt-5 pb-[18px]">
      <div className="mb-[14px] flex flex-wrap items-start justify-between gap-[14px] border-b border-border pb-[14px]">
        <div>
          <h4 className="m-0 mb-1.5 text-[15.5px] font-semibold text-silk">{meeting.title}</h4>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[12.5px] text-silk-faint">
            <span className="text-teal">{meeting.meetingDate}</span>
            <span>·</span>
            <span>{meeting.place}</span>
            {meeting.presenter && (
              <>
                <span>·</span>
                <span>발표: {meeting.presenter}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {meeting.attendees.slice(0, ATTENDEES_VISIBLE_LIMIT).map((av, i) => (
            <div
              key={i}
              className="flex h-[22px] shrink-0 items-center justify-center whitespace-nowrap rounded-pill border border-teal-dim bg-[rgba(72,217,176,0.18)] px-2 font-mono text-[10px] font-bold text-teal"
            >
              {av}
            </div>
          ))}
          {meeting.attendees.length > ATTENDEES_VISIBLE_LIMIT && (
            <div
              title={meeting.attendees.slice(ATTENDEES_VISIBLE_LIMIT).join(", ")}
              className="flex h-[22px] shrink-0 cursor-default items-center justify-center whitespace-nowrap rounded-pill border border-border bg-bg-raised px-2 font-mono text-[10px] font-bold text-silk-faint"
            >
              +{meeting.attendees.length - ATTENDEES_VISIBLE_LIMIT}명
            </div>
          )}
        </div>
      </div>

      {meeting.notesFormat === "rows" ? (
        <div className="mb-[14px]">
          <p className="m-0 mb-2 font-mono text-[11px] tracking-[0.1em] text-silk-faint">안건 · 결정 사항</p>
          {meeting.agenda.map((item, i) => (
            <div key={i} className="mb-2.5 last:mb-0">
              <div className="relative pl-[14px] text-[12.8px] leading-[1.6] text-silk-dim before:absolute before:left-0 before:content-['—'] before:text-silk-faint">
                {item}
              </div>
              {meeting.decisions[i] && (
                <div className="mt-1.5 rounded-[6px] border-l-[3px] border-teal bg-teal-dim px-[13px] py-2.5 text-[12.8px] leading-[1.6] text-silk">
                  {meeting.decisions[i]}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : meeting.notesFormat === "text" ? (
        <>
          <div className="mb-[14px]">
            <p className="m-0 mb-2 font-mono text-[11px] tracking-[0.1em] text-silk-faint">안건</p>
            {meeting.agenda[0] && (
              <p className="m-0 whitespace-pre-wrap text-[12.8px] leading-[1.6] text-silk-dim">{meeting.agenda[0]}</p>
            )}
          </div>
          <div className="mb-[14px]">
            <p className="m-0 mb-2 font-mono text-[11px] tracking-[0.1em] text-silk-faint">결정 사항</p>
            {meeting.decisions[0] && (
              <div className="rounded-[6px] border-l-[3px] border-teal bg-teal-dim px-[13px] py-2.5 whitespace-pre-wrap text-[12.8px] leading-[1.6] text-silk">
                {meeting.decisions[0]}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mb-[14px]">
            <p className="m-0 mb-2 font-mono text-[11px] tracking-[0.1em] text-silk-faint">안건</p>
            <ul className="m-0 list-none p-0">
              {meeting.agenda.map((item, i) => (
                <li
                  key={i}
                  className="relative mb-[5px] pl-[14px] text-[12.8px] leading-[1.6] text-silk-dim last:mb-0 before:absolute before:left-0 before:content-['—'] before:text-silk-faint"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-[14px]">
            <p className="m-0 mb-2 font-mono text-[11px] tracking-[0.1em] text-silk-faint">결정 사항</p>
            {meeting.decisions.map((decision, i) => (
              <div
                key={i}
                className="mb-1.5 rounded-[6px] border-l-[3px] border-teal bg-teal-dim px-[13px] py-2.5 text-[12.8px] leading-[1.6] text-silk last:mb-0"
              >
                {decision}
              </div>
            ))}
          </div>
        </>
      )}

      <div>
        <p className="m-0 mb-2 font-mono text-[11px] tracking-[0.1em] text-silk-faint">할 일</p>
        {meeting.actions.map((action, i) => (
          <div
            key={i}
            className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-b border-border py-[9px] last:border-b-0"
          >
            <input
              type="checkbox"
              checked={action.done ?? false}
              disabled={togglingIndex === i}
              onChange={() => handleToggle(i)}
              aria-label="할 일 완료 토글"
              className="h-[14px] w-[14px] cursor-pointer disabled:cursor-not-allowed"
            />
            <div className={`text-[12.8px] ${action.done ? "text-silk-faint line-through" : "text-silk"}`}>
              {action.text}
            </div>
            <div className="flex items-center gap-[5px] whitespace-nowrap font-mono text-[11px] text-silk-dim">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[rgba(226,168,63,0.18)] text-[8px] font-bold text-amber">
                {action.avatar}
              </span>
              {action.who}
            </div>
            <div
              className={`whitespace-nowrap rounded-[5px] px-2 py-[3px] font-mono text-[11.5px] ${
                action.dueVariant === "soon"
                  ? "bg-amber-dim text-amber"
                  : action.dueVariant === "late"
                    ? "bg-[rgba(226,84,63,0.16)] text-[#e2543f]"
                    : "bg-bg-raised text-silk-faint"
              }`}
            >
              {action.due}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="m-0 mt-3 font-mono text-[11px] text-[#e2543f]">{error}</p>}

      <div className="mt-[14px] flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 font-mono text-[12px] text-silk-faint">
        <span className="rounded-[5px] bg-bg-raised px-2 py-[3px]">{meeting.tag}</span>
        <div className="flex items-center gap-3">
          <span>기록: {meeting.recorder}</span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="cursor-pointer border-none bg-transparent p-0 text-teal hover:underline"
          >
            수정
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="cursor-pointer border-none bg-transparent p-0 text-silk-faint hover:text-[#e2543f] disabled:cursor-not-allowed"
          >
            삭제
          </button>
        </div>
      </div>

      {editing && <EditMeetingModal meeting={meeting} onClose={() => setEditing(false)} />}
    </div>
  );
}
