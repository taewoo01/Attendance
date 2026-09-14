import { createHmac, timingSafeEqual } from "crypto";

/**
 * AGENTS.md 11.3절(정적 QR 금지, 시간 기반 토큰) 구현.
 * 토큰을 DB/메모리에 저장하지 않는다 — 서버가 항상 같은 공식(HMAC(secret, 시간 구간))으로
 * 재계산 가능하므로 서버리스 환경(Vercel)에서도 별도 상태 없이 검증할 수 있다.
 * WINDOW_SECONDS 주기로 값이 바뀌어, 화면 QR을 사진 찍어 공유해도 짧은 시간 안에 무효화된다.
 */
const WINDOW_SECONDS = 20;

function secret(): string {
  const value = process.env.ATTENDANCE_QR_SECRET;
  if (!value) {
    throw new Error("ATTENDANCE_QR_SECRET 환경변수가 설정되지 않았습니다.");
  }
  return value;
}

function tokenForBucket(bucket: number): string {
  return createHmac("sha256", secret()).update(String(bucket)).digest("base64url");
}

export function issueAttendanceQrToken(): { token: string; windowSeconds: number } {
  const bucket = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  return { token: tokenForBucket(bucket), windowSeconds: WINDOW_SECONDS };
}

/**
 * 현재 구간과 직전 구간(스캔 후 페이지 이동 지연 허용)만 유효로 인정한다.
 * 그 이전 구간은 만료로 취급해 거부한다.
 */
export function verifyAttendanceQrToken(candidate: string | null): boolean {
  if (!candidate) return false;

  const candidateBuf = Buffer.from(candidate);
  const currentBucket = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);

  for (const bucket of [currentBucket, currentBucket - 1]) {
    const expectedBuf = Buffer.from(tokenForBucket(bucket));
    if (expectedBuf.length === candidateBuf.length && timingSafeEqual(expectedBuf, candidateBuf)) {
      return true;
    }
  }
  return false;
}
