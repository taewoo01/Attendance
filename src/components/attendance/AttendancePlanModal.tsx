"use client";

import { useState } from "react";
import { setAttendancePlan } from "@/lib/attendance/plan";
import { CUSTOM_LABEL_MAX_LENGTH, type PlanKind } from "@/lib/attendance/plan-shared";

const PRESETS: { kind: Exclude<PlanKind, "custom">; label: string }[] = [
  { kind: "day", label: "주간" },
  { kind: "night", label: "야간" },
  { kind: "full", label: "종일" },
  { kind: "off", label: "안 옴" },
];

/**
 * 홈 화면(HeroSection)/출석 인증 페이지(CheckinCard) "퇴근" 처리 직후 뜨는 모달.
 * "내일 상주 계획"을 등록해두면 다음날 팀원 전체의 출석 현황(HeroSection 상태
 * 모달/AttendanceList)에 미리 배지로 보인다(체크인 여부와 무관하게). 다음날
 * 하루에만 적용되는 1회성 설정이라 건너뛰면(닫기) 아무것도 저장되지 않는다.
 */
export function AttendancePlanModal({ onClose }: { onClose: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState("");

  async function submit(kind: PlanKind, label?: string) {
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.append("kind", kind);
    if (label) formData.append("label", label);
    const result = await setAttendancePlan(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(4,10,8,0.65)] p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[360px] rounded-card border border-border bg-bg-panel px-[22px] pt-[22px] pb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="m-0 text-[14.5px] font-semibold">내일 상주 계획</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-xl leading-none text-silk-faint hover:text-silk"
          >
            ×
          </button>
        </div>
        <p className="m-0 mb-4 text-[12.5px] leading-[1.6] text-silk-dim">
          내일 얼마나 상주할지 미리 알려주면 팀원들이 오늘 출석 현황에서 미리 볼 수 있어요.
        </p>

        {!customOpen ? (
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.kind}
                type="button"
                disabled={pending}
                onClick={() => submit(preset.kind)}
                className="cursor-pointer rounded-button border border-border bg-bg-raised px-3 py-2.5 text-[13px] font-semibold text-silk hover:border-teal-dim hover:text-teal disabled:cursor-not-allowed disabled:opacity-60"
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              disabled={pending}
              onClick={() => setCustomOpen(true)}
              className="col-span-2 cursor-pointer rounded-button border border-border bg-bg-raised px-3 py-2.5 text-[13px] font-semibold text-silk-dim hover:border-teal-dim hover:text-teal disabled:cursor-not-allowed disabled:opacity-60"
            >
              기타 직접 입력
            </button>
          </div>
        ) : (
          <div>
            <input
              autoFocus
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              maxLength={CUSTOM_LABEL_MAX_LENGTH}
              placeholder="예: 오전 반차"
              disabled={pending}
              className="mb-2 w-full rounded-input border border-border bg-bg-raised px-2.5 py-2 text-[13px] text-silk outline-none focus:border-teal-dim disabled:cursor-not-allowed"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => submit("custom", customLabel.trim())}
                disabled={pending || !customLabel.trim()}
                className="flex-1 cursor-pointer rounded-button border border-teal bg-teal px-3 py-2 text-[12.5px] font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "저장 중..." : "등록"}
              </button>
              <button
                type="button"
                onClick={() => setCustomOpen(false)}
                disabled={pending}
                className="cursor-pointer rounded-button border border-border px-3 py-2 text-[12.5px] text-silk-dim disabled:cursor-not-allowed"
              >
                뒤로
              </button>
            </div>
          </div>
        )}

        {error && <p className="m-0 mt-3 font-mono text-[11px] text-[#e2543f]">{error}</p>}

        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="mt-4 w-full cursor-pointer border-none bg-transparent p-0 text-center font-mono text-[11.5px] text-silk-faint hover:text-silk disabled:cursor-not-allowed"
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
}
