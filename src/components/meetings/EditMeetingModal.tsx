"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { updateMeeting } from "@/lib/meetings/actions";
import type { MeetingActionRow } from "@/db/schema";
import type { Meeting } from "@/components/meetings/MeetingCard";

type AgendaRow = { agenda: string; decision: string };
type NotesMode = "rows" | "text" | "plain";

const EMPTY_ACTION: MeetingActionRow = { text: "", who: "", avatar: "", due: "", dueVariant: undefined, done: false };
const EMPTY_AGENDA_ROW: AgendaRow = { agenda: "", decision: "" };

/** agenda/decisions는 서로 다른 배열이라(길이가 달라도 됨) 편집 시엔 긴 쪽 길이에 맞춰 짝을 지어 보여준다. */
function zipAgendaRows(agenda: string[], decisions: string[]): AgendaRow[] {
  const len = Math.max(agenda.length, decisions.length);
  return Array.from({ length: len }, (_, i) => ({ agenda: agenda[i] ?? "", decision: decisions[i] ?? "" }));
}

function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function tabButtonClass(active: boolean): string {
  return `cursor-pointer rounded-[6px] border-none px-2.5 py-1 font-mono text-[11.5px] font-semibold ${
    active ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-faint hover:text-silk"
  }`;
}

/**
 * RegisterMeetingModal과 필드 구성이 동일하다(제목/날짜/장소/참석자/안건/결정
 * 사항/액션 아이템/태그/기록자). EditPersonalEventModal·EditFixedScheduleModal과
 * 같은 이유로 별도 컴포넌트로 분리했다 — 값을 채워서 여는 대상(`meeting`)이
 * 없으면 렌더링하지 않는다.
 */
export function EditMeetingModal({ meeting, onClose }: { meeting: Meeting | null; onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialNotesMode: NotesMode =
    meeting?.notesFormat === "text" ? "text" : meeting?.notesFormat === "plain" ? "plain" : "rows";
  const [actions, setActions] = useState<MeetingActionRow[]>(meeting?.actions ?? []);
  const [agendaRows, setAgendaRows] = useState<AgendaRow[]>(
    initialNotesMode === "rows" ? zipAgendaRows(meeting?.agenda ?? [], meeting?.decisions ?? []) : [],
  );
  const [notesMode, setNotesMode] = useState<NotesMode>(initialNotesMode);
  const [agendaText, setAgendaText] = useState(initialNotesMode === "text" ? (meeting?.agenda[0] ?? "") : "");
  const [decisionText, setDecisionText] = useState(initialNotesMode === "text" ? (meeting?.decisions[0] ?? "") : "");
  const [plainText, setPlainText] = useState(initialNotesMode === "plain" ? (meeting?.agenda[0] ?? "") : "");

  if (!meeting) return null;

  function updateAction(index: number, patch: Partial<MeetingActionRow>) {
    setActions((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  function updateAgendaRow(index: number, patch: Partial<AgendaRow>) {
    setAgendaRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  /** 행 편집 ↔ 자유 텍스트(안건·결정) ↔ 자유 텍스트(단일) 전환 시 입력값을 서로 변환해 유지한다. */
  function switchNotesMode(next: NotesMode) {
    if (next === notesMode) return;

    if (notesMode === "rows") {
      if (next === "text") {
        setAgendaText(agendaRows.map((r) => r.agenda.trim()).filter(Boolean).join("\n"));
        setDecisionText(agendaRows.map((r) => r.decision.trim()).filter(Boolean).join("\n"));
      } else {
        setPlainText(
          agendaRows
            .map((r) => (r.decision.trim() ? `${r.agenda.trim()} - ${r.decision.trim()}` : r.agenda.trim()))
            .filter(Boolean)
            .join("\n"),
        );
      }
    } else if (notesMode === "text") {
      if (next === "rows") {
        setAgendaRows(zipAgendaRows(splitLines(agendaText), splitLines(decisionText)));
      } else {
        setPlainText([agendaText.trim(), decisionText.trim()].filter(Boolean).join("\n\n"));
      }
    } else {
      if (next === "rows") {
        setAgendaRows(splitLines(plainText).map((line) => ({ agenda: line, decision: "" })));
      } else {
        setAgendaText(plainText);
        setDecisionText("");
      }
    }
    setNotesMode(next);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("actionsJson", JSON.stringify(actions.filter((a) => a.text.trim().length > 0)));
    formData.set("notesFormat", notesMode);
    if (notesMode === "text") {
      formData.set("agenda", agendaText);
      formData.set("decisions", decisionText);
    } else if (notesMode === "plain") {
      formData.set("agenda", plainText);
    } else {
      formData.set(
        "agendaRowsJson",
        JSON.stringify(agendaRows.filter((r) => r.agenda.trim().length > 0).map((r) => ({ agenda: r.agenda.trim(), decision: r.decision.trim() }))),
      );
    }

    const result = await updateMeeting(meeting!.id, formData);

    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(4,10,8,0.65)] p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[88vh] w-full max-w-[1080px] overflow-y-auto rounded-card border border-border bg-bg-panel">
        <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
          <h3 className="m-0 text-[14.5px] font-semibold">회의록 수정</h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-xl leading-none text-silk-faint hover:text-silk"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-[22px] pt-5 pb-[22px]">
            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[11.5px] tracking-[0.1em] text-silk-faint">제목</p>
              <input
                name="title"
                type="text"
                required
                defaultValue={meeting.title}
                className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px] grid grid-cols-3 gap-[14px] max-[480px]:grid-cols-1">
              <div>
                <p className="m-0 mb-2 font-mono text-[11.5px] tracking-[0.1em] text-silk-faint">날짜</p>
                <input
                  name="meetingDateKey"
                  type="date"
                  defaultValue={meeting.meetingDateKey}
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
              <div>
                <p className="m-0 mb-2 font-mono text-[11.5px] tracking-[0.1em] text-silk-faint">시간 (선택)</p>
                <input
                  name="meetingTime"
                  type="time"
                  defaultValue={meeting.meetingTime}
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
              <div>
                <p className="m-0 mb-2 font-mono text-[11.5px] tracking-[0.1em] text-silk-faint">장소</p>
                <input
                  name="place"
                  type="text"
                  defaultValue={meeting.place}
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[11.5px] tracking-[0.1em] text-silk-faint">참석자 (쉼표로 구분)</p>
              <input
                name="attendees"
                type="text"
                defaultValue={meeting.attendees.join(", ")}
                className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[11.5px] tracking-[0.1em] text-silk-faint">발표자 (선택)</p>
              <input
                name="presenter"
                type="text"
                defaultValue={meeting.presenter}
                placeholder="예: 김철수"
                className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px] rounded-input border border-border bg-bg-raised p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="m-0 font-mono text-[11.5px] tracking-[0.1em] text-silk-faint">
                  {notesMode === "plain" ? "회의 내용" : "안건 · 결정 사항"}
                </p>
                <div className="flex items-center gap-2">
                  {notesMode === "rows" && (
                    <button
                      type="button"
                      onClick={() => setAgendaRows((prev) => [...prev, { ...EMPTY_AGENDA_ROW }])}
                      className="cursor-pointer rounded-button border border-teal-dim bg-transparent px-2.5 py-1 font-mono text-[12px] font-semibold text-teal hover:bg-teal-dim"
                    >
                      + 항목 추가
                    </button>
                  )}
                  <div className="flex items-center gap-1 rounded-[8px] border border-border p-0.5">
                    <button type="button" onClick={() => switchNotesMode("rows")} className={tabButtonClass(notesMode === "rows")}>
                      행 편집
                    </button>
                    <button type="button" onClick={() => switchNotesMode("text")} className={tabButtonClass(notesMode === "text")}>
                      자유 텍스트(안건·결정)
                    </button>
                    <button type="button" onClick={() => switchNotesMode("plain")} className={tabButtonClass(notesMode === "plain")}>
                      자유 텍스트(단일)
                    </button>
                  </div>
                </div>
              </div>

              {notesMode === "text" ? (
                <div className="grid grid-cols-2 gap-[14px] max-[640px]:grid-cols-1">
                  <div>
                    <p className="m-0 mb-1.5 font-mono text-[11px] text-silk-faint">안건 (한 줄에 하나씩)</p>
                    <textarea
                      value={agendaText}
                      onChange={(e) => setAgendaText(e.target.value)}
                      placeholder={"예: 진행상황 공유\n다음 분기 계획 검토"}
                      className="min-h-[200px] w-full resize-y rounded-input border border-border bg-bg-panel px-2.5 py-2 font-sans text-[12.5px] leading-[1.6] text-silk focus:border-teal-dim focus:outline-none"
                    />
                  </div>
                  <div>
                    <p className="m-0 mb-1.5 font-mono text-[11px] text-silk-faint">결정 사항 (한 줄에 하나씩)</p>
                    <textarea
                      value={decisionText}
                      onChange={(e) => setDecisionText(e.target.value)}
                      placeholder={"예: 중간보고서는 9월 3일까지 초안 완성"}
                      className="min-h-[200px] w-full resize-y rounded-input border border-border bg-bg-panel px-2.5 py-2 font-sans text-[12.5px] leading-[1.6] text-silk focus:border-teal-dim focus:outline-none"
                    />
                  </div>
                </div>
              ) : notesMode === "plain" ? (
                <textarea
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  placeholder={"안건과 결정 사항을 구분하지 않고 자유롭게 적어보세요."}
                  className="min-h-[200px] w-full resize-y rounded-input border border-border bg-bg-panel px-2.5 py-2 font-sans text-[12.5px] leading-[1.6] text-silk focus:border-teal-dim focus:outline-none"
                />
              ) : (
                <>
                  {agendaRows.length === 0 && (
                    <p className="m-0 font-mono text-[12.5px] text-silk-faint">
                      아직 추가된 항목이 없습니다. “+ 항목 추가”로 안건과 그에 대한 결정 사항을 함께 적어보세요.
                    </p>
                  )}
                  {agendaRows.map((row, i) => (
                    <div key={i} className="mb-2 flex items-start gap-2 last:mb-0">
                      <input
                        type="text"
                        value={row.agenda}
                        onChange={(e) => updateAgendaRow(i, { agenda: e.target.value })}
                        placeholder="안건 (예: 진행상황 공유)"
                        className="flex-1 rounded-input border border-border bg-bg-panel px-2.5 py-2 font-sans text-[12.5px] text-silk focus:border-teal-dim focus:outline-none"
                      />
                      <input
                        type="text"
                        value={row.decision}
                        onChange={(e) => updateAgendaRow(i, { decision: e.target.value })}
                        placeholder="결정 사항 (선택)"
                        className="flex-1 rounded-input border border-border bg-bg-panel px-2.5 py-2 font-sans text-[12.5px] text-silk focus:border-teal-dim focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setAgendaRows((prev) => prev.filter((_, idx) => idx !== i))}
                        aria-label="안건 삭제"
                        className="cursor-pointer border-none bg-transparent p-1 leading-none text-silk-faint hover:text-[#e2543f]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="mb-[18px] rounded-input border border-border bg-bg-raised p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="m-0 font-mono text-[11.5px] tracking-[0.1em] text-silk-faint">할 일</p>
                <button
                  type="button"
                  onClick={() => setActions((prev) => [...prev, { ...EMPTY_ACTION }])}
                  className="cursor-pointer rounded-button border border-teal-dim bg-transparent px-2.5 py-1 font-mono text-[12px] font-semibold text-teal hover:bg-teal-dim"
                >
                  + 항목 추가
                </button>
              </div>
              {actions.length === 0 && (
                <p className="m-0 font-mono text-[12.5px] text-silk-faint">
                  아직 추가된 항목이 없습니다. “+ 항목 추가”로 담당자·마감일을 정해보세요.
                </p>
              )}
              {actions.map((action, i) => (
                <div key={i} className="mb-2 rounded-[8px] border border-border bg-bg-panel p-2.5 last:mb-0">
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={action.text}
                      onChange={(e) => updateAction(i, { text: e.target.value })}
                      placeholder="할 일"
                      className="flex-1 rounded-input border border-border bg-bg-raised px-2.5 py-2 font-sans text-[12.5px] text-silk focus:border-teal-dim focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setActions((prev) => prev.filter((_, idx) => idx !== i))}
                      aria-label="할 일 삭제"
                      className="cursor-pointer border-none bg-transparent p-1 leading-none text-silk-faint hover:text-[#e2543f]"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={action.who}
                      onChange={(e) => updateAction(i, { who: e.target.value })}
                      placeholder="담당자"
                      className="rounded-input border border-border bg-bg-raised px-2.5 py-2 font-sans text-[12px] text-silk focus:border-teal-dim focus:outline-none"
                    />
                    <input
                      type="text"
                      value={action.due}
                      onChange={(e) => updateAction(i, { due: e.target.value })}
                      placeholder="마감일 (예: 9/6)"
                      className="rounded-input border border-border bg-bg-raised px-2.5 py-2 font-sans text-[12px] text-silk focus:border-teal-dim focus:outline-none"
                    />
                    <select
                      value={action.dueVariant ?? ""}
                      onChange={(e) =>
                        updateAction(i, { dueVariant: e.target.value === "" ? undefined : (e.target.value as "soon" | "late") })
                      }
                      className="rounded-input border border-border bg-bg-raised px-2 py-2 font-sans text-[12px] text-silk focus:border-teal-dim focus:outline-none"
                    >
                      <option value="">보통</option>
                      <option value="soon">임박</option>
                      <option value="late">지연</option>
                    </select>
                  </div>
                  <label className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-silk-dim">
                    <input
                      type="checkbox"
                      checked={action.done ?? false}
                      onChange={(e) => updateAction(i, { done: e.target.checked })}
                    />
                    완료됨
                  </label>
                </div>
              ))}
            </div>

            <div className="mb-[18px] grid grid-cols-2 gap-[14px]">
              <div>
                <p className="m-0 mb-2 font-mono text-[11.5px] tracking-[0.1em] text-silk-faint">태그</p>
                <input
                  name="tag"
                  type="text"
                  defaultValue={meeting.tag}
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
              <div>
                <p className="m-0 mb-2 font-mono text-[11.5px] tracking-[0.1em] text-silk-faint">기록자</p>
                <input
                  name="recorder"
                  type="text"
                  defaultValue={meeting.recorder}
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="m-0 font-mono text-[11px] text-[#e2543f]">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border px-[22px] py-[14px]">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-border bg-transparent px-3 py-[7px] text-xs font-semibold text-silk"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-3 py-[7px] text-xs font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
