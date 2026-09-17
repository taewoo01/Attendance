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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 입구 디스플레이(/attendance-display)의 "본인 이름 선택" 화면 전용 토큰.
 * 위 익명 토큰과 달리 발급 시점에 대상 userId를 못박아 서명한다 — 스캔한 폰이
 * 로그인돼 있지 않아도 이 토큰만으로 "누구인지"를 알 수 있다(로그인 대신
 * "입구 기기에서 본인 이름을 직접 눌렀다"는 걸로 신원 확인을 대신하는 방식).
 * 그래서 발급 자체는(qr-token API) 반드시 로그인된 요청에서만 허용해야 한다 —
 * 그렇지 않으면 userId만 알면 누구나 원격으로 남을 체크인시킬 수 있게 된다.
 */
export function issuePersonalAttendanceQrToken(userId: string): { token: string; windowSeconds: number } {
  const bucket = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  const payload = `${userId}.${bucket}`;
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return { token: `${payload}.${signature}`, windowSeconds: WINDOW_SECONDS };
}

/** 서명이 유효하고 현재/직전 구간 안이면 userId를 반환하고, 아니면 null. */
export function verifyPersonalAttendanceQrToken(candidate: string | null): { userId: string } | null {
  if (!candidate) return null;

  const parts = candidate.split(".");
  if (parts.length !== 3) return null;
  const [userId, bucketRaw, signature] = parts;
  if (!UUID_RE.test(userId)) return null;

  const bucket = Number(bucketRaw);
  if (!Number.isInteger(bucket)) return null;
  const currentBucket = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  if (bucket !== currentBucket && bucket !== currentBucket - 1) return null;

  const expectedBuf = Buffer.from(createHmac("sha256", secret()).update(`${userId}.${bucket}`).digest("base64url"));
  const candidateBuf = Buffer.from(signature);
  if (expectedBuf.length !== candidateBuf.length || !timingSafeEqual(expectedBuf, candidateBuf)) return null;

  return { userId };
}
