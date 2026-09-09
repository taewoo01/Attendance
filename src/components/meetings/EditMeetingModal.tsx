"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { updateMeeting } from "@/lib/meetings/actions";
import type { MeetingActionRow } from "@/db/schema";
import type { Meeting } from "@/components/meetings/MeetingCard";

const EMPTY_ACTION: MeetingActionRow = { text: "", who: "", avatar: "", due: "", dueVariant: undefined, done: false };

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
  const [actions, setActions] = useState<MeetingActionRow[]>(meeting?.actions ?? []);

  if (!meeting) return null;

  function updateAction(index: number, patch: Partial<MeetingActionRow>) {
    setActions((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("actionsJson", JSON.stringify(actions.filter((a) => a.text.trim().length > 0)));

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
      <div className="max-h-[88vh] w-full max-w-[620px] overflow-y-auto rounded-card border border-border bg-bg-panel">
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
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">제목</p>
              <input
                name="title"
                type="text"
                required
                defaultValue={meeting.title}
                className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px] grid grid-cols-2 gap-[14px]">
              <div>
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">날짜/시간</p>
                <input
                  name="meetingDate"
                  type="text"
                  defaultValue={meeting.meetingDate}
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
              <div>
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">장소</p>
                <input
                  name="place"
                  type="text"
                  defaultValue={meeting.place}
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">참석자 (쉼표로 구분)</p>
              <input
                name="attendees"
                type="text"
                defaultValue={meeting.attendees.join(", ")}
                className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">안건 (한 줄에 하나씩)</p>
              <textarea
                name="agenda"
                defaultValue={meeting.agenda.join("\n")}
                className="min-h-[72px] w-full resize-y rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] leading-[1.6] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">결정 사항 (한 줄에 하나씩)</p>
              <textarea
                name="decisions"
                defaultValue={meeting.decisions.join("\n")}
                className="min-h-[72px] w-full resize-y rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] leading-[1.6] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px]">
              <div className="mb-2 flex items-center justify-between">
                <p className="m-0 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">액션 아이템</p>
                <button
                  type="button"
                  onClick={() => setActions((prev) => [...prev, { ...EMPTY_ACTION }])}
                  className="cursor-pointer border-none bg-transparent font-mono text-[11px] text-teal hover:underline"
                >
                  + 항목 추가
                </button>
              </div>
              {actions.map((action, i) => (
                <div key={i} className="mb-2 rounded-[8px] border border-border bg-bg-raised p-2.5">
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={action.text}
                      onChange={(e) => updateAction(i, { text: e.target.value })}
                      placeholder="할 일"
                      className="flex-1 rounded-input border border-border bg-bg-panel px-2.5 py-2 font-sans text-[12.5px] text-silk focus:border-teal-dim focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setActions((prev) => prev.filter((_, idx) => idx !== i))}
                      aria-label="액션 아이템 삭제"
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
                      className="rounded-input border border-border bg-bg-panel px-2.5 py-2 font-sans text-[12px] text-silk focus:border-teal-dim focus:outline-none"
                    />
                    <input
                      type="text"
                      value={action.due}
                      onChange={(e) => updateAction(i, { due: e.target.value })}
                      placeholder="마감일 (예: 9/6)"
                      className="rounded-input border border-border bg-bg-panel px-2.5 py-2 font-sans text-[12px] text-silk focus:border-teal-dim focus:outline-none"
                    />
                    <select
                      value={action.dueVariant ?? ""}
                      onChange={(e) =>
                        updateAction(i, { dueVariant: e.target.value === "" ? undefined : (e.target.value as "soon" | "late") })
                      }
                      className="rounded-input border border-border bg-bg-panel px-2 py-2 font-sans text-[12px] text-silk focus:border-teal-dim focus:outline-none"
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
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">태그</p>
                <input
                  name="tag"
                  type="text"
                  defaultValue={meeting.tag}
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
              <div>
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">기록자</p>
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
