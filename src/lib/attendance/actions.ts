import { getCurrentUser } from "@/lib/auth/get-user";
import { deleteAttendancePlan, findOpenAttendance, insertAttendanceCheckIn } from "@/lib/db/attendance";
import { getProfileByUserId } from "@/lib/db/profiles";
import { verifyAttendanceQrToken, verifyPersonalAttendanceQrToken } from "@/lib/attendance/qr-token";
import { notifyTeamExcept } from "@/lib/notifications/create";
import { addDays, seoulDateKey } from "@/lib/date";

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

  try {
    await insertAttendanceCheckIn(userId);
  } catch (error) {
    // "열린 행 없음" 확인과 insert 사이에는 보호장치가 없어서, 거의 동시에
    // 두 번 체크인되면 둘 다 이 확인을 통과할 수 있었다(실제 운영에서 한
    // 사용자에게 중복된 열린 행이 쌓이는 버그로 이어짐 — drizzle/0052 마이그레이션
    // 참고). attendance_open_per_user_unique partial unique index가 이제 두
    // 번째 insert를 DB에서 막아주므로, unique_violation(23505)이면 이미
    // 처리된 것으로 보고 "already"를 돌려준다. 다른 에러는 그대로 던진다.
    if ((error as { code?: string }).code === "23505") return "already";
    throw error;
  }
  // 당일 재출근: 직전 퇴근 때 등록해둔 "내일 상주 계획"은 더 이상 유효하지 않으니
  // 지운다(다른 팀원 화면의 "내일 X" 배지도 함께 사라진다) — 안 지우면 이후 다시
  // 퇴근할 때 같은 (userId, planDate) unique 제약에 걸려 계획을 재등록하지 못한다.
  await deleteAttendancePlan(userId, addDays(seoulDateKey(new Date()), 1));

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
