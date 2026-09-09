"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { deletePersonalEvent, updatePersonalEvent } from "@/lib/schedule/actions";

export type EditablePersonalEvent = {
  id: string;
  title: string;
  eventDate: string;
  eventTime: string;
  eventEndTime?: string;
};

/**
 * ScheduleCalendar/AgendaCard에서 내 개인 일정 항목을 클릭하면 뜨는 수정 모달.
 * RegisterEventModal과 동일한 필드(제목/날짜/시간) 레이아웃을 그대로 쓰되,
 * "구분" 토글 없이 personal_events만 대상으로 한다(TASK-032).
 * 삭제도 이 모달의 "삭제" 버튼으로 처리한다 — month view처럼 좁은 칸 안에
 * 별도 × 버튼을 두면 클릭 영역이 너무 작아 오누름/오조작이 잦아서, 삭제를
 * 이 모달 하나로 모았다(week view의 인라인 × 버튼은 그대로 유지, 이 모달을 열어도
 * 삭제 가능한 두 번째 경로가 생기는 것뿐이라 충돌하지 않는다).
 * 편집 대상이 바뀔 때마다 컴포넌트를 새로 마운트해야 defaultValue가 갱신되므로,
 * 다른 모달들과 달리 열려 있지 않을 때는 아예 렌더링하지 않는다(부모가 event로 제어).
 */
export function EditPersonalEventModal({ event, onClose }: { event: EditablePersonalEvent | null; onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    const result = await deletePersonalEvent(event!.id);

    setDeleting(false);
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

            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">날짜</p>
              <input
                name="eventDate"
                type="date"
                required
                defaultValue={event.eventDate}
                className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px] grid grid-cols-2 gap-[14px]">
              <div>
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">시작 시간</p>
                <input
                  name="eventTime"
                  type="time"
                  defaultValue={event.eventTime}
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
              <div>
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">종료 시간</p>
                <input
                  name="eventEndTime"
                  type="time"
                  defaultValue={event.eventEndTime ?? ""}
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="m-0 font-mono text-[11px] text-[#e2543f]">{error}</p>}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border px-[22px] py-[14px]">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || pending}
              className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-[#e2543f] bg-transparent px-3 py-[7px] text-xs font-semibold text-[#e2543f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "삭제 중..." : "삭제"}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-border bg-transparent px-3 py-[7px] text-xs font-semibold text-silk"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={pending || deleting}
                className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-3 py-[7px] text-xs font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
