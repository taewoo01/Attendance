import { getCurrentUser } from "@/lib/auth/get-user";
import { seoulDateKey } from "@/lib/date";
import { findTodayAttendance, insertAttendanceCheckIn } from "@/lib/db/attendance";
import { verifyAttendanceQrToken } from "@/lib/attendance/qr-token";

export type CheckInResult = "ok" | "already" | "invalid_token" | "unauthenticated";

/**
 * QR 스캔(GET /attendance/checkin?t=...)이 호출하는 체크인 처리.
 * 1) 로그인 여부 2) 토큰 유효성(시간 구간) 3) 오늘 중복 체크인 여부 순으로 검증한다.
 * AGENTS.md 11.3절: 토큰 만료/중복 체크인 모두 서버에서 검증하고, 통과한 경우에만 insert한다.
 */
export async function checkInWithQr(token: string | null): Promise<CheckInResult> {
  const user = await getCurrentUser();
  if (!user) return "unauthenticated";

  if (!verifyAttendanceQrToken(token)) return "invalid_token";

  const todayKey = seoulDateKey(new Date());
  const existing = await findTodayAttendance(user.id, todayKey);
  if (existing) return "already";

  await insertAttendanceCheckIn(user.id);
  return "ok";
}
