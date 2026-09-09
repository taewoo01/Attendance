"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { updatePersonalEvent } from "@/lib/schedule/actions";

export type EditablePersonalEvent = { id: string; title: string; eventDate: string; eventTime: string };

/**
 * ScheduleCalendar의 주간 뷰에서 내 개인 일정 카드를 클릭하면 뜨는 수정 모달.
 * RegisterEventModal과 동일한 필드(제목/날짜/시간) 레이아웃을 그대로 쓰되,
 * "구분" 토글 없이 personal_events만 대상으로 한다(TASK-032).
 * 편집 대상이 바뀔 때마다 컴포넌트를 새로 마운트해야 defaultValue가 갱신되므로,
 * 다른 모달들과 달리 열려 있지 않을 때는 아예 렌더링하지 않는다(부모가 event로 제어).
 */
export function EditPersonalEventModal({ event, onClose }: { event: EditablePersonalEvent | null; onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!event) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await updatePersonalEvent(event!.id, new FormData(e.currentTarget));

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
      <div className="w-full max-w-[420px] overflow-y-auto rounded-card border border-border bg-bg-panel">
        <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
          <h3 className="m-0 text-[14.5px] font-semibold">개인 일정 수정</h3>
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
                defaultValue={event.title}
                className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px] grid grid-cols-2 gap-[14px]">
              <div>
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">날짜</p>
                <input
                  name="eventDate"
                  type="date"
                  required
                  defaultValue={event.eventDate}
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
              <div>
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">시간</p>
                <input
                  name="eventTime"
                  type="time"
                  defaultValue={event.eventTime}
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
