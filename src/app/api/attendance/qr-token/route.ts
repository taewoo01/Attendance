import { NextResponse } from "next/server";
import { issueAttendanceQrToken } from "@/lib/attendance/qr-token";

/**
 * 입구 디스플레이(/attendance-display)가 폴링하는 회전 토큰 발급 엔드포인트.
 * 이 값 자체는 화면에 QR로 띄우는 게 목적이라 로그인 여부를 요구하지 않는다 —
 * 실제 인증/권한 검증은 체크인 처리(/attendance/checkin, checkInWithQr)에서 수행한다.
 */
export async function GET() {
  const { token, windowSeconds } = issueAttendanceQrToken();
  return NextResponse.json(
    { token, windowSeconds },
    { headers: { "Cache-Control": "no-store" } },
  );
}
