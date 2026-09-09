"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type KeyboardEvent } from "react";
import type { DailyLogTemplate } from "@/components/daily/WriteLogModal";
import { createTemplate, deleteTemplate } from "@/lib/daily/actions";

export type WeekStatusDay = { dow: string; dnum: number; done: boolean; today: boolean };

type DailySidebarProps = {
  weekStatus: WeekStatusDay[];
  streakCurrent: number;
  streakBest: number;
  templates: DailyLogTemplate[];
  onApplyTemplate: (items: string[]) => void;
};

/**
 * playground-design/daily.html의 <aside> 격 3개 카드(이번 주 기록 현황 /
 * 실적 연동 프로모 / 자주 쓰는 체크리스트).
 * TASK-009 당시엔 셋 다 원본 script가 건드리지 않는 정적 영역이라 Server
 * Component였다. TASK-035: "이번 주 기록 현황"(요일별 done/연속 기록 일수)과
 * "자주 쓰는 체크리스트"(실제 저장된 템플릿 + "+ 추가"가 오늘 기록 모달에
 * 적용됨)를 실데이터로 바꾸면서, DailyBoard의 모달 오픈 로직과 콜백을 주고받아야
 * 해서 Client Component가 됐다. 실적 연동 프로모 카드(Link)는 원본 그대로 정적.
 */
export function DailySidebar({ weekStatus, streakCurrent, streakBest, templates, onApplyTemplate }: DailySidebarProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [itemText, setItemText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addItem() {
    const text = itemText.trim();
    if (!text) return;
    setItems((prev) => [...prev, text]);
    setItemText("");
  }

  function handleItemKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreate() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || items.length === 0) return;
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.set("title", trimmedTitle);
    formData.set("itemsJson", JSON.stringify(items));
    const result = await createTemplate(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setTitle("");
    setItems([]);
    setCreating(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const result = await deleteTemplate(id);
    if (!result.error) router.refresh();
  }

  return (
    <div>
      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">이번 주 기록 현황</h4>
        <div className="flex justify-between">
          {weekStatus.map((d) => (
            <div key={d.dow} className="flex flex-col items-center gap-[7px]">
              <span className="font-mono text-[9.5px] text-silk-faint">{d.dow}</span>
              <div
                className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border ${
                  d.done ? "border-teal-dim bg-teal-dim" : d.today ? "border-teal" : "border-border"
                }`}
              >
                {d.done && (
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="3" className="h-[10px] w-[10px] stroke-teal">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                )}
              </div>
              <span className="text-[10.5px] text-silk-faint">{d.dnum}</span>
            </div>
          ))}
        </div>
        <div className="mt-[14px] font-mono text-[30px] font-bold leading-none text-teal">{streakCurrent}일</div>
        <div className="mt-1.5 text-[11.5px] text-silk-faint">연속 기록 중 · 이번 달 최고 기록 {streakBest}일</div>
      </div>

      <div className="mb-4 rounded-panel border border-teal-dim bg-[linear-gradient(155deg,rgba(72,217,176,0.1),rgba(72,217,176,0.02))] px-4 pt-4 pb-[15px]">
        <p className="m-0 mb-3 text-xs leading-[1.6] text-silk-dim">
          <b className="text-silk">실적 관리와 연동돼요.</b>
          <br />
          체크리스트를 완료하면 주간·월간 실적 취합에 자동으로 반영할 수 있어요.
        </p>
        <Link
          href="/results"
          className="inline-flex w-full cursor-pointer items-center justify-center gap-[7px] rounded-button border border-border bg-transparent px-4 py-2.5 text-[13px] font-semibold text-silk"
        >
          실적 관리에서 보기
        </Link>
      </div>

      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <div className="mb-[14px] flex items-center justify-between">
          <h4 className="m-0 text-[13.5px] font-semibold">자주 쓰는 체크리스트</h4>
          {!creating && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="cursor-pointer border-none bg-transparent font-mono text-[11px] text-teal hover:underline"
            >
              + 새 템플릿
            </button>
          )}
        </div>

        {templates.length === 0 && !creating && (
          <p className="m-0 text-xs text-silk-faint">아직 저장된 템플릿이 없어요. &ldquo;+ 새 템플릿&rdquo;으로 만들어 보세요.</p>
        )}

        {templates.map((t) => (
          <div key={t.id} className="flex items-center justify-between border-b border-border py-[7px] text-xs last:border-b-0 last:pb-0">
            <span className="text-silk-dim">{t.title}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onApplyTemplate(t.items)}
                className="cursor-pointer border-none bg-transparent font-mono text-[11px] text-teal"
              >
                + 추가
              </button>
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                aria-label="템플릿 삭제"
                className="cursor-pointer border-none bg-transparent p-0 leading-none text-silk-faint hover:text-[#e2543f]"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {creating && (
          <div className={templates.length > 0 ? "mt-3" : ""}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="템플릿 이름"
              className="mb-2 w-full rounded-input border border-border bg-bg-raised px-2.5 py-2 font-sans text-xs text-silk focus:border-teal-dim focus:outline-none"
            />

            {items.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-[6px]">
                {items.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-bg-raised px-2.5 py-1 font-mono text-[10.5px] text-silk-dim"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      aria-label="항목 삭제"
                      className="cursor-pointer border-none bg-transparent p-0 leading-none text-silk-faint hover:text-[#e2543f]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="mb-2 flex items-center gap-2">
              <input
                type="text"
                value={itemText}
                onChange={(e) => setItemText(e.target.value)}
                onKeyDown={handleItemKeyDown}
                placeholder="할 일 추가..."
                className="flex-1 rounded-input border border-border bg-bg-raised px-2.5 py-2 font-sans text-xs text-silk focus:border-teal-dim focus:outline-none"
              />
              <button type="button" onClick={addItem} className="cursor-pointer border-none bg-transparent font-mono text-[11px] text-teal">
                추가
              </button>
            </div>

            {error && <p className="m-0 mb-2 font-mono text-[10.5px] text-[#e2543f]">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setTitle("");
                  setItems([]);
                  setError(null);
                }}
                className="cursor-pointer rounded-button border border-border bg-transparent px-2.5 py-[5px] text-[11px] font-semibold text-silk"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={pending || !title.trim() || items.length === 0}
                className="cursor-pointer rounded-button border border-teal bg-teal px-2.5 py-[5px] text-[11px] font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
