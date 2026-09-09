"use client";

import Link from "next/link";
import type { DailyLogTemplate } from "@/components/daily/WriteLogModal";

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
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">자주 쓰는 체크리스트</h4>
        {templates.length === 0 ? (
          <p className="m-0 text-xs text-silk-faint">
            아직 저장된 템플릿이 없어요. 기록 작성 모달에서 체크리스트를 &ldquo;템플릿으로 저장&rdquo;할 수 있어요.
          </p>
        ) : (
          templates.map((t) => (
            <div key={t.id} className="flex items-center justify-between border-b border-border py-[7px] text-xs last:border-b-0 last:pb-0">
              <span className="text-silk-dim">{t.title}</span>
              <button
                type="button"
                onClick={() => onApplyTemplate(t.items)}
                className="cursor-pointer border-none bg-transparent font-mono text-[11px] text-teal"
              >
                + 추가
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
