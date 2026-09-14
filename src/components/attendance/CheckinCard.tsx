export type CheckinBannerStatus = "ok" | "already" | "invalid_token" | "unauthenticated";

const BANNER_TEXT: Record<CheckinBannerStatus, string> = {
  ok: "체크인 완료되었습니다.",
  already: "오늘 이미 체크인했습니다.",
  invalid_token: "QR이 만료되었어요. 화면의 QR을 다시 스캔해 주세요.",
  unauthenticated: "로그인 후 다시 QR을 스캔해 주세요.",
};

function seoulTime(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

type CheckinCardProps = {
  /** 로그인한 본인의 오늘 체크인 시각. 없으면 아직 체크인하지 않은 것. */
  checkedInAt?: Date;
  /** /attendance/checkin 리다이렉트 직후에만 존재하는 방금 시도한 체크인 결과. */
  bannerStatus?: CheckinBannerStatus | null;
};

/**
 * playground-design/attendance.html의 .card(QR 체크인 카드).
 * 원본의 QR 그림은 실제로 스캔 가능한 QR이 아니라 장식용 픽셀 패턴이다 — 실제 회전형
 * QR(AGENTS.md 11.3절)은 별도 입구 디스플레이(/attendance-display)에 띄우고, 이 카드는
 * 본인 화면에서 "내가 오늘 체크인했는지"만 보여준다. 정적 QR 우회를 막기 위해 QR 없이
 * 바로 체크인되는 수동 버튼은 두지 않는다(체크아웃 버튼은 원본에서도 disabled 정적 상태 —
 * 이번 작업 범위 밖).
 */
export function CheckinCard({ checkedInAt, bannerStatus }: CheckinCardProps) {
  return (
    <div className="rounded-card border border-border bg-bg-panel px-6 pt-[26px] pb-6">
      <p className="m-0 mb-[18px] font-mono text-[11px] tracking-[0.14em] text-silk-faint">QR CHECK-IN</p>

      <div className="mx-auto mb-5 flex h-[184px] w-[184px] items-center justify-center rounded-input border border-border bg-bg-raised shadow-[0_0_0_1px_rgba(72,217,176,0.06),0_20px_40px_-18px_rgba(0,0,0,0.6)]">
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
      </div>

      <div
        className={`mx-auto mb-[18px] flex w-fit items-center justify-center gap-2 rounded-pill border border-border bg-bg-raised px-[14px] py-2 font-mono text-[12.5px] ${
          checkedInAt ? "text-teal" : "text-silk-dim"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${checkedInAt ? "bg-teal" : "bg-silk-faint"}`} />
        {checkedInAt ? `오늘 ${seoulTime(checkedInAt)} 체크인 완료` : "아직 체크인하지 않았어요"}
      </div>

      {bannerStatus && (
        <p
          className={`m-0 mb-[14px] rounded-input border px-[14px] py-2.5 text-center text-[12.5px] ${
            bannerStatus === "ok" ? "border-teal/40 bg-teal/10 text-teal" : "border-border bg-bg-raised text-silk-dim"
          }`}
        >
          {BANNER_TEXT[bannerStatus]}
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          disabled
          className="inline-flex w-full items-center justify-center gap-2 rounded-button border border-border bg-transparent px-[18px] py-[13px] text-sm font-semibold text-silk disabled:cursor-not-allowed disabled:text-silk-faint"
        >
          체크아웃
        </button>
      </div>

      <p className="m-0 mt-4 text-center font-mono text-[11px] text-silk-faint">
        연구실 입구 화면의 QR을 폰 카메라로 스캔해 체크인하세요
      </p>
    </div>
  );
}
