import { getCurrentUser } from "@/lib/auth/get-user";
import { findOpenAttendance, insertAttendanceCheckIn } from "@/lib/db/attendance";
import { getProfileByUserId } from "@/lib/db/profiles";
import { verifyAttendanceQrToken, verifyPersonalAttendanceQrToken } from "@/lib/attendance/qr-token";
import { notifyTeamExcept } from "@/lib/notifications/create";

export type CheckInResult = "ok" | "already" | "invalid_token" | "unauthenticated";

/**
 * QR 스캔(GET /attendance/checkin?t=...)이 호출하는 체크인 처리.
 * 입구 디스플레이의 "본인 이름 선택" 화면에서 발급한 개인 토큰이면 토큰 안의
 * userId로 바로 체크인한다 — 스캔한 폰이 로그인돼 있는지는 보지 않는다(신원
 * 확인은 그 토큰을 발급할 때 이미 입구 기기 로그인으로 끝났다).
 * 개인 토큰이 아니면(기존 익명 회전 QR) 그대로 1) 로그인 여부 2) 토큰 유효성
 * (시간 구간) 순으로 검증한다. 이후 공통으로 3) 이미 퇴근하지 않은 출석 행이
 * 있는지 본다(날짜가 아니라 퇴근 여부 기준 — 밤새 상주해 날짜가 바뀐 채로
 * 아직 퇴근 전이어도 중복 체크인을 막는다).
 * AGENTS.md 11.3절: 토큰 만료/중복 체크인 모두 서버에서 검증하고, 통과한 경우에만 insert한다.
 * 체크인 성공 후 본인을 제외한 팀 전체에게 알림을 보낸다(개인 토큰이든 회전
 * QR이든, 로그인 여부와 무관하게 체크인은 항상 같은 방식으로 알린다).
 */
export async function checkInWithQr(token: string | null): Promise<CheckInResult> {
  const personal = verifyPersonalAttendanceQrToken(token);
  const userId = personal ? personal.userId : (await getCurrentUser())?.id;

  if (!userId) return "unauthenticated";
  if (!personal && !verifyAttendanceQrToken(token)) return "invalid_token";

  const existing = await findOpenAttendance(userId);
  if (existing) return "already";

  await insertAttendanceCheckIn(userId);

  const profile = await getProfileByUserId(userId);
  const actorName = profile?.name?.trim() || "누군가";
  await notifyTeamExcept(userId, {
    type: "attendance_checkin",
    actorUserId: userId,
    actorName,
    message: `${actorName}님이 체크인했습니다`,
    linkHref: "/attendance",
  });

  return "ok";
}
