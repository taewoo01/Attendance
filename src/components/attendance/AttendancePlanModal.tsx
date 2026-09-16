"use client";

import { useState } from "react";
import { checkOut } from "@/lib/attendance/checkout";
import { setAttendancePlan } from "@/lib/attendance/plan";
import { CUSTOM_LABEL_MAX_LENGTH, type PlanKind } from "@/lib/attendance/plan-shared";

const PRESETS: { kind: Exclude<PlanKind, "custom">; label: string }[] = [
  { kind: "day", label: "주간" },
  { kind: "night", label: "야간" },
  { kind: "full", label: "종일" },
  { kind: "off", label: "안 옴" },
];

/**
 * 홈 화면(HeroSection)/출석 인증 페이지(CheckinCard)에서 "퇴근" 버튼을 누르면
 * 뜨는 모달. 퇴근 자체를 이 모달이 확정한다 — "내일 상주 계획"을 실제로
 * 골라야만 checkOut()이 호출되어 퇴근 처리된다. X(닫기)를 누르면 아무 계획도
 * 고르지 않은 것이므로 퇴근이 전혀 되지 않은 채(체크인 상태 그대로) 모달만
 * 닫힌다 — 예전에는 모달을 띄우기 전에 이미 퇴근 처리를 해버려서 계획을
 * 안 고르고 닫아도 퇴근은 이미 된 상태로 남는 문제가 있었다.
 * checkOut()이 성공한 뒤에만 setAttendancePlan()을 호출한다 — 계획 저장이
 * 실패해도 checkOut()을 다시 부르면 "이미 퇴근 처리되었습니다" 에러가 나므로
 * checkedOut 플래그로 재시도 시 checkOut()을 건너뛴다.
 */
export function AttendancePlanModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [checkedOut, setCheckedOut] = useState(false);

  async function submit(kind: PlanKind, label?: string) {
    setPending(true);
    setError(null);

    if (!checkedOut) {
      const checkoutResult = await checkOut();
      if (checkoutResult.error) {
        setPending(false);
        setError(checkoutResult.error);
        return;
      }
      setCheckedOut(true);
    }

    const formData = new FormData();
    formData.append("kind", kind);
    if (label) formData.append("label", label);
    const result = await setAttendancePlan(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onConfirm();
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(4,10,8,0.65)] p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
    >
      <div className="w-full max-w-[360px] rounded-card border border-border bg-bg-panel px-[22px] pt-[22px] pb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="m-0 text-[14.5px] font-semibold">내일 상주 계획</h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            aria-label="닫기"
            className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-xl leading-none text-silk-faint hover:text-silk disabled:cursor-not-allowed disabled:opacity-60"
          >
            ×
          </button>
        </div>
        <p className="m-0 mb-4 text-[12.5px] leading-[1.6] text-silk-dim">
          내일 얼마나 상주할지 골라야 퇴근이 처리돼요. 닫기(×)를 누르면 퇴근하지 않은 상태로 남아요.
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
      </div>
    </div>
  );
}
