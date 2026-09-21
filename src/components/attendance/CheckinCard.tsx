"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AttendancePlanModal } from "@/components/attendance/AttendancePlanModal";
import { useSelfCheckinRealtime } from "@/lib/attendance/useSelfCheckinRealtime";
import { useRotatingCheckinQr } from "@/lib/attendance/useRotatingQr";

function seoulTime(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

type CheckinCardProps = {
  /**
   * 로그인한 본인의 현재 체크인 시각(아직 퇴근 전이면 자정을 넘긴 어제 시각일
   * 수 있다 — 밤새 상주 중인 경우). 없으면 아직 체크인하지 않은 것.
   */
  checkedInAt?: Date;
  /** 로그인한 본인의 오늘 퇴근 시각. 없으면 아직 퇴근 전(또는 체크인 자체를 안 함). */
  checkedOutAt?: Date | null;
  /** checkedInAt이 오늘 날짜가 아니면(자정을 넘겨 계속 상주 중) "오늘" 대신 "전날"로 표시한다. */
  checkedInToday?: boolean;
  /** QR 모달이 떠 있는 동안 본인 체크인을 감지해 자동으로 닫기 위한 로그인 사용자 id. */
  userId?: string;
};

/**
 * playground-design/attendance.html의 .card(QR 체크인 카드).
 * 카드에 그려진 픽셀 그림은 실제로 스캔 가능한 QR이 아니라 장식용 패턴이다 — 탭하면
 * 열리는 모달에서 실제 회전형 QR(AGENTS.md 11.3절, useRotatingCheckinQr)을 보여준다.
 * 정적 QR 우회를 막기 위해 QR 없이 바로 체크인되는 수동 버튼은 두지 않는다.
 * 폰마다 매일 로그인이 풀려서(갤럭시 카메라 앱의 QR 미리보기가 Chrome과 쿠키를
 * 공유하지 않는 문제) "스캔 → 로그인 → 다시 스캔"을 해야 하는 번거로움이 있었다
 * (사용자 확인 완료) — 이 화면은 이미 로그인된 세션(예: 데스크톱 브라우저)에서
 * 열리므로, useRotatingCheckinQr에 본인 userId를 넘겨 "본인 전용" QR을 보여준다.
 * 본인 폰 카메라로 그 QR을 스캔하면 스캔하는 폰의 로그인 여부와 무관하게 바로
 * 체크인된다(신원 확인은 이미 이 화면에 로그인돼 있다는 것으로 끝났다). 입구
 * 디스플레이(/attendance-display)의 "본인 이름 선택" 방식과 같은 원리이되,
 * 여기서는 이름을 새로 고를 필요 없이 이미 로그인된 사용자 본인으로 고정된다.
 * 체크아웃 버튼은 원본에서 disabled 정적 상태였으나(체크아웃 기능 자체가 없었음),
 * 퇴근은 위치 증빙 없이 버튼 한 번으로 처리하기로 해서(HeroSection.tsx와 동일한
 * checkOut() Server Action) 실제 동작으로 바꿨다.
 * "퇴근" 버튼은 곧바로 checkOut()을 부르지 않고 AttendancePlanModal을 띄우기만
 * 한다 — 실제 퇴근 처리는 그 모달에서 "내일 상주 계획"을 골라야 확정된다
 * (계획을 안 고르고 닫으면 퇴근이 안 된 상태로 남는다).
 * QR 체크인 모달은 내가 폰으로 QR을 스캔해 체크인해도 자동으로 닫히지 않던
 * 문제가 있었다 — Realtime으로 본인 체크인을 감지해 자동으로 닫고
 * router.refresh()로 카드 상태(체크인 완료)를 갱신한다.
 */
export function CheckinCard({ checkedInAt, checkedOutAt, checkedInToday = true, userId }: CheckinCardProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  function cancelPlanModal() {
    setPlanModalOpen(false);
  }

  function confirmPlanModal() {
    setPlanModalOpen(false);
    router.refresh();
  }

  return (
    <div className="rounded-card border border-border bg-bg-panel px-6 pt-[26px] pb-6">
      <p className="m-0 mb-[18px] font-mono text-[11px] tracking-[0.14em] text-silk-faint">QR CHECK-IN</p>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label="실제 체크인 QR 크게 보기"
        className="mx-auto mb-5 flex h-[184px] w-[184px] cursor-pointer items-center justify-center rounded-input border border-border bg-bg-raised shadow-[0_0_0_1px_rgba(72,217,176,0.06),0_20px_40px_-18px_rgba(0,0,0,0.6)]"
      >
        <svg viewBox="0 0 168 168" className="h-[168px] w-[168px]">
          <g>
            <rect x="0" y="0" width="8" height="8" />
            <rect x="8" y="0" width="8" height="8" />
            <rect x="16" y="0" width="8" height="8" />
            <rect x="24" y="0" width="8" height="8" />
            <rect x="32" y="0" width="8" height="8" />
            <rect x="40" y="0" width="8" height="8" />
            <rect x="48" y="0" width="8" height="8" />
            <rect x="56" y="0" width="8" height="8" />
            <rect x="64" y="0" width="8" height="8" />
            <rect x="80" y="0" width="8" height="8" />
            <rect x="96" y="0" width="8" height="8" />
            <rect x="104" y="0" width="8" height="8" />
            <rect x="112" y="0" width="8" height="8" />
            <rect x="120" y="0" width="8" height="8" />
            <rect x="128" y="0" width="8" height="8" />
            <rect x="136" y="0" width="8" height="8" />
            <rect x="144" y="0" width="8" height="8" />
            <rect x="152" y="0" width="8" height="8" />
            <rect x="160" y="0" width="8" height="8" />
            <rect x="0" y="8" width="8" height="8" />
            <rect x="48" y="8" width="8" height="8" />
            <rect x="64" y="8" width="8" height="8" />
            <rect x="80" y="8" width="8" height="8" />
            <rect x="88" y="8" width="8" height="8" />
            <rect x="112" y="8" width="8" height="8" />
            <rect x="160" y="8" width="8" height="8" />
            <rect x="0" y="16" width="8" height="8" />
            <rect x="16" y="16" width="8" height="8" />
            <rect x="24" y="16" width="8" height="8" />
            <rect x="32" y="16" width="8" height="8" />
            <rect x="48" y="16" width="8" height="8" />
            <rect x="56" y="16" width="8" height="8" />
            <rect x="64" y="16" width="8" height="8" />
            <rect x="96" y="16" width="8" height="8" />
            <rect x="112" y="16" width="8" height="8" />
            <rect x="128" y="16" width="8" height="8" />
            <rect x="136" y="16" width="8" height="8" />
            <rect x="144" y="16" width="8" height="8" />
            <rect x="160" y="16" width="8" height="8" />
            <rect x="0" y="24" width="8" height="8" />
            <rect x="16" y="24" width="8" height="8" />
            <rect x="24" y="24" width="8" height="8" />
            <rect x="32" y="24" width="8" height="8" />
            <rect x="48" y="24" width="8" height="8" />
            <rect x="56" y="24" width="8" height="8" />
            <rect x="72" y="24" width="8" height="8" />
            <rect x="80" y="24" width="8" height="8" />
            <rect x="88" y="24" width="8" height="8" />
            <rect x="96" y="24" width="8" height="8" />
            <rect x="112" y="24" width="8" height="8" />
            <rect x="128" y="24" width="8" height="8" />
            <rect x="136" y="24" width="8" height="8" />
            <rect x="144" y="24" width="8" height="8" />
            <rect x="160" y="24" width="8" height="8" />
            <rect x="0" y="32" width="8" height="8" />
            <rect x="16" y="32" width="8" height="8" />
            <rect x="24" y="32" width="8" height="8" />
            <rect x="32" y="32" width="8" height="8" />
            <rect x="48" y="32" width="8" height="8" />
            <rect x="56" y="32" width="8" height="8" />
            <rect x="80" y="32" width="8" height="8" />
            <rect x="96" y="32" width="8" height="8" />
            <rect x="104" y="32" width="8" height="8" />
            <rect x="112" y="32" width="8" height="8" />
            <rect x="128" y="32" width="8" height="8" />
            <rect x="136" y="32" width="8" height="8" />
            <rect x="144" y="32" width="8" height="8" />
            <rect x="160" y="32" width="8" height="8" />
            <rect x="0" y="40" width="8" height="8" />
            <rect x="48" y="40" width="8" height="8" />
            <rect x="56" y="40" width="8" height="8" />
            <rect x="80" y="40" width="8" height="8" />
            <rect x="104" y="40" width="8" height="8" />
            <rect x="112" y="40" width="8" height="8" />
            <rect x="160" y="40" width="8" height="8" />
            <rect x="0" y="48" width="8" height="8" />
            <rect x="8" y="48" width="8" height="8" />
            <rect x="16" y="48" width="8" height="8" />
            <rect x="24" y="48" width="8" height="8" />
            <rect x="32" y="48" width="8" height="8" />
            <rect x="40" y="48" width="8" height="8" />
            <rect x="48" y="48" width="8" height="8" />
            <rect x="72" y="48" width="8" height="8" />
            <rect x="112" y="48" width="8" height="8" />
            <rect x="120" y="48" width="8" height="8" />
            <rect x="128" y="48" width="8" height="8" />
            <rect x="136" y="48" width="8" height="8" />
            <rect x="144" y="48" width="8" height="8" />
            <rect x="152" y="48" width="8" height="8" />
            <rect x="160" y="48" width="8" height="8" />
            <rect x="0" y="56" width="8" height="8" />
            <rect x="16" y="56" width="8" height="8" />
            <rect x="24" y="56" width="8" height="8" />
            <rect x="40" y="56" width="8" height="8" />
            <rect x="56" y="56" width="8" height="8" />
            <rect x="96" y="56" width="8" height="8" />
            <rect x="0" y="64" width="8" height="8" />
            <rect x="40" y="64" width="8" height="8" />
            <rect x="48" y="64" width="8" height="8" />
            <rect x="64" y="64" width="8" height="8" />
            <rect x="80" y="64" width="8" height="8" />
            <rect x="88" y="64" width="8" height="8" />
            <rect x="96" y="64" width="8" height="8" />
            <rect x="112" y="64" width="8" height="8" />
            <rect x="120" y="64" width="8" height="8" />
            <rect x="128" y="64" width="8" height="8" />
            <rect x="144" y="64" width="8" height="8" />
            <rect x="24" y="72" width="8" height="8" />
            <rect x="32" y="72" width="8" height="8" />
            <rect x="40" y="72" width="8" height="8" />
            <rect x="64" y="72" width="8" height="8" />
            <rect x="72" y="72" width="8" height="8" />
            <rect x="80" y="72" width="8" height="8" />
            <rect x="88" y="72" width="8" height="8" />
            <rect x="112" y="72" width="8" height="8" />
            <rect x="120" y="72" width="8" height="8" />
            <rect x="128" y="72" width="8" height="8" />
            <rect x="136" y="72" width="8" height="8" />
            <rect x="24" y="80" width="8" height="8" />
            <rect x="64" y="80" width="8" height="8" />
            <rect x="72" y="80" width="8" height="8" />
            <rect x="80" y="80" width="8" height="8" />
            <rect x="96" y="80" width="8" height="8" />
            <rect x="104" y="80" width="8" height="8" />
            <rect x="112" y="80" width="8" height="8" />
            <rect x="120" y="80" width="8" height="8" />
            <rect x="128" y="80" width="8" height="8" />
            <rect x="136" y="80" width="8" height="8" />
            <rect x="144" y="80" width="8" height="8" />
            <rect x="152" y="80" width="8" height="8" />
            <rect x="160" y="80" width="8" height="8" />
            <rect x="0" y="88" width="8" height="8" />
            <rect x="8" y="88" width="8" height="8" />
            <rect x="32" y="88" width="8" height="8" />
            <rect x="40" y="88" width="8" height="8" />
            <rect x="48" y="88" width="8" height="8" />
            <rect x="56" y="88" width="8" height="8" />
            <rect x="64" y="88" width="8" height="8" />
            <rect x="104" y="88" width="8" height="8" />
            <rect x="112" y="88" width="8" height="8" />
            <rect x="120" y="88" width="8" height="8" />
            <rect x="128" y="88" width="8" height="8" />
            <rect x="144" y="88" width="8" height="8" />
            <rect x="152" y="88" width="8" height="8" />
            <rect x="8" y="96" width="8" height="8" />
            <rect x="24" y="96" width="8" height="8" />
            <rect x="64" y="96" width="8" height="8" />
            <rect x="72" y="96" width="8" height="8" />
            <rect x="80" y="96" width="8" height="8" />
            <rect x="112" y="96" width="8" height="8" />
            <rect x="120" y="96" width="8" height="8" />
            <rect x="8" y="104" width="8" height="8" />
            <rect x="24" y="104" width="8" height="8" />
            <rect x="32" y="104" width="8" height="8" />
            <rect x="40" y="104" width="8" height="8" />
            <rect x="48" y="104" width="8" height="8" />
            <rect x="56" y="104" width="8" height="8" />
            <rect x="112" y="104" width="8" height="8" />
            <rect x="120" y="104" width="8" height="8" />
            <rect x="128" y="104" width="8" height="8" />
            <rect x="136" y="104" width="8" height="8" />
            <rect x="144" y="104" width="8" height="8" />
            <rect x="0" y="112" width="8" height="8" />
            <rect x="8" y="112" width="8" height="8" />
            <rect x="16" y="112" width="8" height="8" />
            <rect x="24" y="112" width="8" height="8" />
            <rect x="32" y="112" width="8" height="8" />
            <rect x="40" y="112" width="8" height="8" />
            <rect x="48" y="112" width="8" height="8" />
            <rect x="88" y="112" width="8" height="8" />
            <rect x="136" y="112" width="8" height="8" />
            <rect x="152" y="112" width="8" height="8" />
            <rect x="0" y="120" width="8" height="8" />
            <rect x="48" y="120" width="8" height="8" />
            <rect x="64" y="120" width="8" height="8" />
            <rect x="72" y="120" width="8" height="8" />
            <rect x="96" y="120" width="8" height="8" />
            <rect x="104" y="120" width="8" height="8" />
            <rect x="112" y="120" width="8" height="8" />
            <rect x="136" y="120" width="8" height="8" />
            <rect x="0" y="128" width="8" height="8" />
            <rect x="16" y="128" width="8" height="8" />
            <rect x="24" y="128" width="8" height="8" />
            <rect x="32" y="128" width="8" height="8" />
            <rect x="48" y="128" width="8" height="8" />
            <rect x="56" y="128" width="8" height="8" />
            <rect x="72" y="128" width="8" height="8" />
            <rect x="80" y="128" width="8" height="8" />
            <rect x="144" y="128" width="8" height="8" />
            <rect x="152" y="128" width="8" height="8" />
            <rect x="160" y="128" width="8" height="8" />
            <rect x="0" y="136" width="8" height="8" />
            <rect x="16" y="136" width="8" height="8" />
            <rect x="24" y="136" width="8" height="8" />
            <rect x="32" y="136" width="8" height="8" />
            <rect x="48" y="136" width="8" height="8" />
            <rect x="56" y="136" width="8" height="8" />
            <rect x="72" y="136" width="8" height="8" />
            <rect x="80" y="136" width="8" height="8" />
            <rect x="88" y="136" width="8" height="8" />
            <rect x="104" y="136" width="8" height="8" />
            <rect x="0" y="144" width="8" height="8" />
            <rect x="16" y="144" width="8" height="8" />
            <rect x="24" y="144" width="8" height="8" />
            <rect x="32" y="144" width="8" height="8" />
            <rect x="48" y="144" width="8" height="8" />
            <rect x="64" y="144" width="8" height="8" />
            <rect x="80" y="144" width="8" height="8" />
            <rect x="88" y="144" width="8" height="8" />
            <rect x="104" y="144" width="8" height="8" />
            <rect x="136" y="144" width="8" height="8" />
            <rect x="0" y="152" width="8" height="8" />
            <rect x="48" y="152" width="8" height="8" />
            <rect x="56" y="152" width="8" height="8" />
            <rect x="72" y="152" width="8" height="8" />
            <rect x="80" y="152" width="8" height="8" />
            <rect x="0" y="160" width="8" height="8" />
            <rect x="8" y="160" width="8" height="8" />
            <rect x="16" y="160" width="8" height="8" />
            <rect x="24" y="160" width="8" height="8" />
            <rect x="32" y="160" width="8" height="8" />
            <rect x="40" y="160" width="8" height="8" />
            <rect x="48" y="160" width="8" height="8" />
            <rect x="112" y="160" width="8" height="8" />
            <rect x="144" y="160" width="8" height="8" />
            <rect x="152" y="160" width="8" height="8" />
          </g>
        </svg>
      </button>

      <div
        className={`mx-auto mb-[18px] flex w-fit items-center justify-center gap-2 rounded-pill border border-border bg-bg-raised px-[14px] py-2 font-mono text-[12.5px] ${
          checkedInAt ? "text-teal" : "text-silk-dim"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${checkedInAt ? "bg-teal" : "bg-silk-faint"}`} />
        {checkedOutAt
          ? `오늘 ${seoulTime(checkedOutAt)} 퇴근 완료`
          : checkedInAt
            ? `${checkedInToday ? "오늘" : "전날"} ${seoulTime(checkedInAt)} 체크인 완료`
            : "아직 체크인하지 않았어요"}
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => setPlanModalOpen(true)}
          disabled={!checkedInAt || !!checkedOutAt}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-button border border-border bg-transparent px-[18px] py-[13px] text-sm font-semibold text-silk disabled:cursor-not-allowed disabled:text-silk-faint"
        >
          {checkedOutAt ? "퇴근 완료" : "체크아웃"}
        </button>
      </div>

      <p className="m-0 mt-4 text-center font-mono text-[11px] text-silk-faint">
        위 QR을 탭하면 실제 체크인 QR을 볼 수 있어요 · 폰 카메라로 스캔해 체크인하세요
      </p>

      {modalOpen && (
        <CheckinQrModal
          userId={userId}
          onClose={() => setModalOpen(false)}
          onCheckedIn={() => {
            setModalOpen(false);
            router.refresh();
          }}
        />
      )}
      {planModalOpen && <AttendancePlanModal onCancel={cancelPlanModal} onConfirm={confirmPlanModal} />}
    </div>
  );
}

function CheckinQrModal({
  userId,
  onClose,
  onCheckedIn,
}: {
  userId?: string;
  onClose: () => void;
  onCheckedIn: () => void;
}) {
  const { qrDataUrl, error } = useRotatingCheckinQr(320, userId);
  useSelfCheckinRealtime(userId, onCheckedIn);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(4,10,8,0.65)] p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[380px] rounded-card border border-border bg-bg-panel">
        <div className="flex items-start justify-between gap-3 border-b border-border px-[22px] py-[18px]">
          <h3 className="m-0 text-[14.5px] font-semibold">체크인 QR</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-xl leading-none text-silk-faint hover:text-silk"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 px-[22px] pt-5 pb-[22px]">
          <div className="flex h-[320px] w-[320px] items-center justify-center rounded-input border border-border bg-bg-raised p-4">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="출석 체크인 QR 코드" className="h-full w-full" />
            ) : (
              <p className="font-mono text-xs text-silk-faint">
                {error ? "QR을 불러오지 못했습니다. 재시도 중..." : "QR 생성 중..."}
              </p>
            )}
          </div>
          <p className="m-0 text-center font-mono text-[11px] text-silk-faint">
            본인 폰 카메라로 이 QR을 스캔하면 로그인 여부와 상관없이 바로 체크인됩니다 · QR은 주기적으로 갱신됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
