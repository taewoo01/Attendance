"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createMeeting } from "@/lib/meetings/actions";
import type { MeetingActionRow } from "@/db/schema";

type DraftAction = MeetingActionRow;

const EMPTY_ACTION: DraftAction = { text: "", who: "", avatar: "", due: "", dueVariant: undefined, done: false };

/**
 * playground-design/meetings.html의 "+ 회의록 작성" 버튼(원본은 리스너 없는
 * 정적 버튼, 등록 모달 자체가 원본에 없음). TASK-033: RegisterEventModal/
 * RegisterResultModal과 동일하게 page-head(제목+버튼)와 모달을 한 Client
 * Component에서 함께 담당한다. meeting_notes는 user_id가 없는 팀 공유
 * 데이터라 "기록자" 필드는 자유 텍스트로 남기되(스키마 그대로), 현재 로그인한
 * 사용자의 프로필 이름을 기본값으로 채워준다.
 * 액션 아이템(agenda/decisions와 달리 구조화된 배열)은 이 모달 안에서 행 단위로
 * 추가/삭제하는 최소 편집기를 둔다 — 별도 공용 컴포넌트로 추상화하지 않는다.
 */
export function RegisterMeetingModal({ defaultRecorder }: { defaultRecorder: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actions, setActions] = useState<DraftAction[]>([]);

  function closeModal() {
    setOpen(false);
    setError(null);
    setActions([]);
  }

  function updateAction(index: number, patch: Partial<DraftAction>) {
    setActions((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setPending(true);
    setError(null);

    const formData = new FormData(form);
    formData.set("actionsJson", JSON.stringify(actions.filter((a) => a.text.trim().length > 0)));

    const result = await createMeeting(formData);

    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    form.reset();
    setActions([]);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">회의록 관리</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">회의록 관리</h1>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-4 py-2.5 text-[13px] font-semibold text-[#04231b]"
        >
          + 회의록 작성
        </button>
      </div>

      <div
        className={`fixed inset-0 z-[100] items-center justify-center bg-[rgba(4,10,8,0.65)] p-5 ${
          open ? "flex" : "hidden"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="max-h-[88vh] w-full max-w-[620px] overflow-y-auto rounded-card border border-border bg-bg-panel">
          <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
            <h3 className="m-0 text-[14.5px] font-semibold">회의록 작성</h3>
            <button
              type="button"
              onClick={closeModal}
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
                  placeholder="예: KEPCO 과제 중간보고 준비 회의"
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>

              <div className="mb-[18px] grid grid-cols-2 gap-[14px]">
                <div>
                  <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">날짜/시간</p>
                  <input
                    name="meetingDate"
                    type="text"
                    placeholder="예: 9월 10일 (수) 15:00"
                    className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                  />
                </div>
                <div>
                  <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">장소</p>
                  <input
                    name="place"
                    type="text"
                    placeholder="예: 302호"
                    className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                  />
                </div>
              </div>

              <div className="mb-[18px]">
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">참석자 (쉼표로 구분)</p>
                <input
                  name="attendees"
                  type="text"
                  placeholder="예: 김, 이, 박"
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>

              <div className="mb-[18px]">
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">안건 (한 줄에 하나씩)</p>
                <textarea
                  name="agenda"
                  placeholder={"예: 진행상황 공유\n다음 분기 계획 검토"}
                  className="min-h-[72px] w-full resize-y rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] leading-[1.6] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>

              <div className="mb-[18px]">
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">결정 사항 (한 줄에 하나씩)</p>
                <textarea
                  name="decisions"
                  placeholder={"예: 중간보고서는 9월 3일까지 초안 완성"}
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
                    placeholder="예: KEPCO 과제"
                    className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                  />
                </div>
                <div>
                  <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">기록자</p>
                  <input
                    name="recorder"
                    type="text"
                    defaultValue={defaultRecorder}
                    className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                  />
                </div>
              </div>

              {error && <p className="m-0 font-mono text-[11px] text-[#e2543f]">{error}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border px-[22px] py-[14px]">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-border bg-transparent px-3 py-[7px] text-xs font-semibold text-silk"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-3 py-[7px] text-xs font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "등록 중..." : "등록"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
