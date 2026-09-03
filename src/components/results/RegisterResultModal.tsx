"use client";

import { useEffect, useState } from "react";

/**
 * playground-design/results.html의 .page-head(제목+실적 등록 버튼)와
 * #resultModalOverlay(실적 등록 모달)를 함께 담당한다.
 * 버튼 클릭으로 모달을 열고 닫는 상태를 공유해야 해서 두 마크업을 한 Client
 * Component에서 원본과 동일한 DOM 순서(Fragment)로 반환한다.
 * 모달은 원본처럼 항상 마운트된 채 className으로 표시 여부만 토글한다
 * (display 토글형 — DESIGN-SYSTEM.md 10.3절, index.html의 fade형과 다름).
 */
export function RegisterResultModal() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"personal" | "team">("personal");
  const [fileLabel, setFileLabel] = useState("파일 선택");

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">실적 관리</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">실적 관리</h1>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-4 py-2.5 text-[13px] font-semibold text-[#04231b]"
        >
          + 실적 등록
        </button>
      </div>

      <div
        className={`fixed inset-0 z-[100] items-center justify-center bg-[rgba(4,10,8,0.65)] p-5 ${
          open ? "flex" : "hidden"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div className="max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-card border border-border bg-bg-panel">
          <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
            <h3 className="m-0 text-[14.5px] font-semibold">실적 등록</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-xl leading-none text-silk-faint hover:text-silk"
            >
              ×
            </button>
          </div>

          <div className="px-[22px] pt-5 pb-[22px]">
            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">제목</p>
              <input
                type="text"
                placeholder="예: DC 리플 기반 SOH 추정 실험 완료"
                className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">구분</p>
              <div className="flex w-fit overflow-hidden rounded-button border border-border">
                <button
                  type="button"
                  onClick={() => setType("personal")}
                  className={`cursor-pointer border-none px-[18px] py-2 text-[12.5px] font-semibold ${
                    type === "personal" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
                  }`}
                >
                  개인
                </button>
                <button
                  type="button"
                  onClick={() => setType("team")}
                  className={`cursor-pointer border-none px-[18px] py-2 text-[12.5px] font-semibold ${
                    type === "team" ? "bg-teal text-[#04231b]" : "bg-transparent text-silk-dim"
                  }`}
                >
                  팀
                </button>
              </div>
            </div>

            <div className="mb-[18px]">
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">설명</p>
              <textarea
                placeholder="무엇을 했는지 간단히 설명해주세요"
                className="min-h-[88px] w-full resize-y rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] leading-[1.6] text-silk focus:border-teal-dim focus:outline-none"
              />
            </div>

            <div className="mb-[18px] grid grid-cols-2 gap-[14px]">
              <div>
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">담당자</p>
                <input
                  type="text"
                  defaultValue="김연구"
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
              <div>
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">날짜</p>
                <input
                  type="text"
                  defaultValue="8월 31일 (월)"
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-[18px] grid grid-cols-2 gap-[14px]">
              <div>
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">수치 지표 라벨 (선택)</p>
                <input
                  type="text"
                  placeholder="예: 오차"
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
              <div>
                <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">수치 지표 값 (선택)</p>
                <input
                  type="text"
                  placeholder="예: 2.8%"
                  className="w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none"
                />
              </div>
            </div>

            <div>
              <p className="m-0 mb-2 font-mono text-[10.5px] tracking-[0.1em] text-silk-faint">첨부파일 (선택)</p>
              <label
                htmlFor="resFileInput"
                className="inline-flex cursor-pointer items-center gap-[7px] rounded-button border border-dashed border-border bg-bg-raised px-[13px] py-[9px] text-[12.5px] text-silk-dim hover:border-teal-dim hover:text-silk"
              >
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[13px] w-[13px] stroke-silk-faint">
                  <path d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
                <span>{fileLabel}</span>
              </label>
              <input
                type="file"
                id="resFileInput"
                className="hidden"
                onChange={(e) => setFileLabel(e.target.files?.length ? e.target.files[0].name : "파일 선택")}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-border px-[22px] py-[14px]">
            <span className="font-mono text-[11px] text-silk-faint">등록한 실적은 팀 전체에 공유돼요</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-border bg-transparent px-3 py-[7px] text-xs font-semibold text-silk"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-3 py-[7px] text-xs font-semibold text-[#04231b]"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
