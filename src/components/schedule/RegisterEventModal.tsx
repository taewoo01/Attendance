"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createFixedSchedule, createPersonalEvent } from "@/lib/schedule/actions";

const DAYS_OF_WEEK = ["월", "화", "수", "목", "금", "토", "일"];

/**
 * playground-design/schedule.html의 "+ 개인 일정 등록" 버튼(원본은 리스너 없는
 * 정적 버튼, 등록 모달 자체가 원본에 없음). TASK-031: 실제 등록 기능을 위해
 * personal_events 스키마(eventDate/eventTime/title)와 1:1로 대응하는 최소 폼을
 * 새로 만들었다 — 필드 구성/모달 레이아웃은 RegisterResultModal.tsx(TASK-008)의
 * 기존 스타일을 그대로 재사용한다(새 디자인을 만들지 않음).
 * TASK-032: "구분"(개인 일정/고정 시간표) 토글을 RegisterResultModal의 "개인/팀"
 * 토글과 동일한 스타일로 추가해 fixed_schedules 등록도 같은 모달에서 처리한다.
 * 일정 페이지 고도화 #1/#2: 요일은 select 하나가 아니라 복수 선택 가능한 chip
 * 그룹(hidden input들로 제출)이고, 시간은 자유 텍스트("09–11시") 대신 개인
 * 일정과 동일하게 시작/종료 time input으로 구조화했다.
 */
export function RegisterEventModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"personal" | "fixed">("personal");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleDay(day: string) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError(null);

    if (kind === "fixed" && selectedDays.length === 0) {
      setError("요일을 하나 이상 선택해 주세요.");
      return;
    }

    setPending(true);
    const result =
      kind === "personal" ? await createPersonalEvent(new FormData(form)) : await createFixedSchedule(new FormData(form));

    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    form.reset();
    setKind("personal");
    setSelectedDays([]);
    setOpen(false);
    router.refresh();
  }

  function closeModal() {
    setOpen(false);
    setKind("personal");
    setSelectedDays([]);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-[15px] py-[9px] text-[13px] font-semibold text-[#04231b]"
      >
        + 개인 일정 등록
      </button>

      <div
        className={`fixed inset-0 z-[100] items-center justify-center bg-[rgba(4,10,8,0.65)] p-5 ${
          open ? "flex" : "hidden"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="w-full max-w-[420px] overflow-y-auto rounded-card border border-border bg-bg-panel">
          <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
            <h3 className="m-0 text-[14.5px] font-semibold">{kind === "personal" ? "개인 일정 등록" : "고정 시간표 등록"}</h3>
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
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">구분</p>
                <div className="flex w-fit overflow-hidden rounded-button border border-border">
                  <button
                    type="button"
                    onClick={() => setKind("personal")}
                    className={`cursor-pointer border-none px-[18px] py-2 text-[12.5px] font-semibold ${
                      kind === "personal" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
                    }`}
                  >
                    개인 일정
                  </button>
                  <button
                    type="button"
                    onClick={() => setKind("fixed")}
                    className={`cursor-pointer border-none px-[18px] py-2 text-[12.5px] font-semibold ${
                      kind === "fixed" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
                    }`}
                  >
                    고정 시간표
                  </button>
                </div>
              </div>

              <div className="mb-[18px]">
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">제목</p>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="예: 병원 예약"
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>

              {kind === "personal" ? (
                <>
                  <div className="mb-[18px]">
                    <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">날짜</p>
                    <input
                      name="eventDate"
                      type="date"
                      required
                      className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                    />
                  </div>
                  <div className="mb-[18px] grid grid-cols-2 gap-[14px]">
                    <div>
                      <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">시작 시간</p>
                      <input
                        name="eventTime"
                        type="time"
                        className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                      />
                    </div>
                    <div>
                      <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">종료 시간</p>
                      <input
                        name="eventEndTime"
                        type="time"
                        className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-[18px]">
                    <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">요일 (복수 선택 가능)</p>
                    <div className="flex flex-wrap gap-[6px]">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`cursor-pointer rounded-chip border px-3 py-1.5 font-mono text-[12px] font-semibold ${
                            selectedDays.includes(day)
                              ? "border-teal bg-teal text-[#04231b]"
                              : "border-border bg-bg-raised text-silk-dim"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    {selectedDays.map((day) => (
                      <input key={day} type="hidden" name="dayOfWeek" value={day} />
                    ))}
                  </div>
                  <div className="mb-[18px] grid grid-cols-2 gap-[14px]">
                    <div>
                      <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">시작 시간</p>
                      <input
                        name="startTime"
                        type="time"
                        className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                      />
                    </div>
                    <div>
                      <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">종료 시간</p>
                      <input
                        name="endTime"
                        type="time"
                        className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

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
