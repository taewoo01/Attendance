"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { createTemplate, deleteTemplate, saveDailyLog } from "@/lib/daily/actions";
import type { DailyLogChecklistItem } from "@/db/schema";

export type DailyLogTemplate = { id: string; title: string; items: string[] };

export type WriteLogTarget = {
  dateKey: string;
  dateLabel: string;
  initial: { body: string; checklist: DailyLogChecklistItem[] } | null;
};

/**
 * playground-design/daily.html의 #logModalOverlay(작성/수정 모달).
 * TASK-009 당시엔 원본처럼 어떤 "수정" 링크를 눌러도 항상 같은 하드코딩된
 * 텍스트/체크리스트를 보여주는 정적 목업이었다(체크리스트 항목 추가 input도
 * 리스너 없음). TASK-035: 실제 daily_logs 저장(하루 1건, 있으면 수정/없으면
 * 작성)과 체크리스트 편집, "자주 쓰는 체크리스트" 적용/저장 기능을 추가했다.
 * 편집 대상(target)이 없으면 렌더링하지 않는다 — 날짜가 바뀔 때마다
 * body/checklist를 새로 초기화해야 해서 EditPersonalEventModal과 동일하게
 * "항상 마운트 + hidden 토글" 대신 조건부 마운트를 쓴다.
 */
export function WriteLogModal({
  target,
  onClose,
  templates,
}: {
  target: WriteLogTarget | null;
  onClose: () => void;
  templates: DailyLogTemplate[];
}) {
  const router = useRouter();
  const [checklist, setChecklist] = useState<DailyLogChecklistItem[]>(target?.initial?.checklist ?? []);
  const [newItemText, setNewItemText] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!target) return null;

  function addChecklistItem() {
    const text = newItemText.trim();
    if (!text) return;
    setChecklist((prev) => [...prev, { text, done: false }]);
    setNewItemText("");
  }

  function handleNewItemKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addChecklistItem();
    }
  }

  function toggleChecklistItem(index: number) {
    setChecklist((prev) => prev.map((item, i) => (i === index ? { ...item, done: !item.done } : item)));
  }

  function removeChecklistItem(index: number) {
    setChecklist((prev) => prev.filter((_, i) => i !== index));
  }

  function applyTemplate(items: string[]) {
    setChecklist((prev) => [...prev, ...items.map((text) => ({ text, done: false }))]);
  }

  async function handleSaveTemplate() {
    const title = templateTitle.trim();
    if (!title) return;
    setError(null);
    const formData = new FormData();
    formData.set("title", title);
    formData.set("itemsJson", JSON.stringify(checklist.map((c) => c.text)));
    const result = await createTemplate(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setTemplateTitle("");
    setSavingTemplate(false);
    router.refresh();
  }

  async function handleDeleteTemplate(id: string) {
    const result = await deleteTemplate(id);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("checklistJson", JSON.stringify(checklist));

    const result = await saveDailyLog(target!.dateKey, formData);

    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
    router.refresh();
  }

  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(4,10,8,0.65)] p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-card border border-border bg-bg-panel">
        <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
          <h3 className="m-0 text-[14.5px] font-semibold">
            {target.dateLabel} 기록 {target.initial ? "수정" : "작성"}
          </h3>
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
            <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">오늘 한 일 (자유 서술)</p>
            <textarea
              name="body"
              defaultValue={target.initial?.body ?? ""}
              placeholder="오늘 한 일을 자유롭게 적어보세요..."
              className="min-h-[96px] w-full resize-y rounded-input border border-border bg-bg-raised px-4 py-[14px] font-sans text-[13.5px] leading-[1.65] text-silk focus:border-teal-dim focus:outline-none"
            />

            {templates.length > 0 && (
              <div className="mt-4">
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">템플릿에서 추가</p>
                <div className="flex flex-wrap gap-[6px]">
                  {templates.map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-bg-raised px-[11px] py-1.5 font-mono text-[11px] text-silk-dim"
                    >
                      <button type="button" onClick={() => applyTemplate(t.items)} className="cursor-pointer border-none bg-transparent p-0 hover:text-teal">
                        + {t.title}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(t.id)}
                        aria-label="템플릿 삭제"
                        className="cursor-pointer border-none bg-transparent p-0 leading-none text-silk-faint hover:text-[#e2543f]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between">
              <p className="m-0 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">
                체크리스트 {checklist.length > 0 && `(${doneCount}/${checklist.length})`}
              </p>
              {checklist.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSavingTemplate((v) => !v)}
                  className="cursor-pointer border-none bg-transparent font-mono text-[11px] text-teal hover:underline"
                >
                  템플릿으로 저장
                </button>
              )}
            </div>

            {savingTemplate && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  placeholder="템플릿 이름"
                  className="flex-1 rounded-input border border-border bg-bg-raised px-3 py-2 font-sans text-[12.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-3 py-2 text-xs font-semibold text-[#04231b]"
                >
                  저장
                </button>
              </div>
            )}

            <div className="mt-[18px]">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-start gap-[10px] border-b border-border py-[9px]">
                  <div
                    onClick={() => toggleChecklistItem(i)}
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
                  <div className={`flex-1 text-[13px] ${item.done ? "text-silk-faint line-through" : "text-silk"}`}>
                    {item.text}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(i)}
                    aria-label="체크리스트 항목 삭제"
                    className="cursor-pointer border-none bg-transparent p-0 leading-none text-silk-faint hover:text-[#e2543f]"
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-2.5 font-mono text-xs text-silk-faint">
                <span>+</span>
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={handleNewItemKeyDown}
                  placeholder="할 일 추가..."
                  className="flex-1 border-none border-b border-dashed border-border bg-transparent px-0.5 py-1.5 font-mono text-[13px] text-silk focus:border-teal-dim focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="cursor-pointer border-none bg-transparent text-teal hover:underline"
                >
                  추가
                </button>
              </div>
            </div>

            {error && <p className="m-0 mt-[14px] font-mono text-[11px] text-[#e2543f]">{error}</p>}
          </div>

          <div className="flex items-center justify-between border-t border-border px-[22px] py-[14px]">
            <span className="font-mono text-[11px] text-silk-faint">{target.dateLabel}</span>
            <div className="flex gap-2">
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
          </div>
        </form>
      </div>
    </div>
  );
}
