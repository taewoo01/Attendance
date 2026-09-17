"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type TokenResponse = { token: string; windowSeconds: number };

/**
 * /api/attendance/qr-token을 windowSeconds 주기로 다시 불러 QR 데이터 URL을 갱신한다.
 * /attendance-display(QrDisplay)와 CheckinCard의 QR 모달이 동일한 회전 로직을 공유한다.
 * `userId`를 주면(입구 디스플레이의 "본인 이름 선택" 화면 전용) 그 사람으로 바로
 * 체크인되는 개인 토큰을 받아온다 — 발급 자체가 로그인을 요구하므로 이 화면(기기)이
 * 로그인돼 있지 않으면 계속 에러 상태로 남는다.
 */
export function useRotatingCheckinQr(qrSize: number, userId?: string) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function refresh() {
      try {
        const url = userId
          ? `/api/attendance/qr-token?userId=${encodeURIComponent(userId)}`
          : "/api/attendance/qr-token";
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("token fetch failed");
        const { token, windowSeconds }: TokenResponse = await res.json();

        const checkinUrl = `${window.location.origin}/attendance/checkin?t=${encodeURIComponent(token)}`;
        const dataUrl = await QRCode.toDataURL(checkinUrl, { margin: 4, width: qrSize });
        if (cancelled) return;

        setQrDataUrl(dataUrl);
        setError(false);
        timer = setTimeout(refresh, windowSeconds * 1000);
      } catch {
        if (!cancelled) {
          setError(true);
          timer = setTimeout(refresh, 5000);
        }
      }
    }

    refresh();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [qrSize, userId]);

  return { qrDataUrl, error };
}
