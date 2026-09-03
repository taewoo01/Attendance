"use client";

import { useEffect, useState } from "react";

type ChecklistItem = { text: string; done: boolean };

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { text: "continual learning 실험 결과 정리", done: true },
  { text: "교수님께 결과 공유 메일 발송", done: true },
  { text: "KEPCO 중간보고서 리뷰 코멘트 반영", done: false },
  { text: "다음 주 파라미터 튜닝 계획 작성", done: false },
];

/**
 * playground-design/daily.html의 #logModalOverlay(작성/수정 모달).
 * 원본은 어떤 날짜의 "수정" 링크를 눌러도 항상 동일한 "오늘의 기록 · 8월 31일
 * (월)" 모달과 동일한 textarea/체크리스트를 보여준다 — 날짜별로 내용이
 * 달라지지 않는 정적 목업 특성을 그대로 유지한다(의도적으로 "고치지" 않음).
 * 체크리스트 상태는 이 모달에서만 쓰이므로 부모로 올리지 않고 로컬로 유지한다.
 * `.check-row:last-of-type{border-bottom:none}`은 실제로는 `.checklist`의
 * 마지막 div가 `.check-add`(다른 클래스지만 같은 div 태그)라서 어떤
 * `.check-row`에도 매칭되지 않는 죽은 규칙이다 — 그대로 재현하기 위해 마지막
 * 체크 항목에도 border-bottom을 생략하지 않는다.
 */
export function WriteLogModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function toggle(index: number) {
    setChecklist((items) => items.map((item, i) => (i === index ? { ...item, done: !item.done } : item)));
  }

  return (
    <div
      className={`fixed inset-0 z-[100] items-center justify-center bg-[rgba(4,10,8,0.65)] p-5 ${
        open ? "flex" : "hidden"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-card border border-border bg-bg-panel">
        <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
          <h3 className="m-0 text-[14.5px] font-semibold">오늘의 기록 · 8월 31일 (월)</h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-xl leading-none text-silk-faint hover:text-silk"
          >
            ×
          </button>
        </div>

        <div className="px-[22px] pt-5 pb-[22px]">
          <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">오늘 한 일 (자유 서술)</p>
          <textarea
            defaultValue="DC 리플 기반 SOH 추정 continual learning 실험 1차 마무리. 배치 학습 대비 드리프트 대응 정확도 비교표 정리해서 김병철 교수님께 공유. 오후에는 KEPCO 과제 중간보고서 리뷰 참여."
            className="min-h-[96px] w-full resize-y rounded-input border border-border bg-bg-raised px-4 py-[14px] font-sans text-[13.5px] leading-[1.65] text-silk focus:border-teal-dim focus:outline-none"
          />

          <p className="m-0 mt-5 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">체크리스트</p>
          <div className="mt-[18px]">
            {checklist.map((item, i) => (
              <div key={item.text} className="flex items-start gap-[10px] border-b border-border py-[9px]">
                <div
                  onClick={() => toggle(i)}
                  className={`mt-px flex h-[17px] w-[17px] shrink-0 cursor-pointer items-center justify-center rounded-[5px] border border-border ${
                    item.done ? "border-teal bg-teal" : ""
                  }`}
                >
                  {item.done && (
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="3" className="h-[10px] w-[10px] stroke-[#04231b]">
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  )}
                </div>
                <div className={`text-[13px] ${item.done ? "text-silk-faint line-through" : "text-silk"}`}>
                  {item.text}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2.5 font-mono text-xs text-silk-faint">
              <span>+</span>
              <input
                type="text"
                placeholder="할 일 추가..."
                className="flex-1 border-none border-b border-dashed border-border bg-transparent px-0.5 py-1.5 font-mono text-[13px] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-[22px] py-[14px]">
          <span className="font-mono text-[11px] text-silk-faint">마지막 저장 09:14</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-border bg-transparent px-3 py-[7px] text-xs font-semibold text-silk"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-3 py-[7px] text-xs font-semibold text-[#04231b]"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
