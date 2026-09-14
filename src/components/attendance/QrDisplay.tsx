"use client";

import { useRotatingCheckinQr } from "@/lib/attendance/useRotatingQr";

/**
 * 연구실 입구 디스플레이(/attendance-display) 전용 client component.
 * AGENTS.md 11.3절(정적 QR 금지): useRotatingCheckinQr가 서버가 알려준 windowSeconds가
 * 지날 때마다 /api/attendance/qr-token을 다시 불러 QR을 새로 그린다. 이 페이지 자체는
 * 로그인 세션이 없어도(공용 디스플레이 기기) 동작해야 해서 토큰 발급 엔드포인트는 인증을
 * 요구하지 않는다 — 실제 사용자 인증/중복 체크는 스캔 이후 /attendance/checkin이 처리한다.
 */
export function QrDisplay() {
  // margin(quiet zone)이 너무 좁으면 카메라가 QR 경계를 인식하지 못한다 — qrcode 기본값(4) 사용.
  const { qrDataUrl, error } = useRotatingCheckinQr(380);

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-6 bg-bg text-silk">
      <p className="font-mono text-sm tracking-[0.14em] text-silk-faint">연구실 입구 · QR 체크인</p>

      <div className="flex h-[420px] w-[420px] items-center justify-center rounded-card border border-border bg-bg-panel p-6">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="출석 체크인 QR 코드" className="h-full w-full" />
        ) : (
          <p className="font-mono text-xs text-silk-faint">
            {error ? "QR을 불러오지 못했습니다. 재시도 중..." : "QR 생성 중..."}
          </p>
        )}
      </div>

      <p className="font-mono text-xs text-silk-faint">폰 카메라로 스캔하면 자동으로 체크인됩니다 · QR은 주기적으로 갱신됩니다</p>
    </div>
  );
}
