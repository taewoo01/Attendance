import { QrDisplay } from "@/components/attendance/QrDisplay";
import { getCurrentUser } from "@/lib/auth/get-user";
import { listProfiles } from "@/lib/db/profiles";

// DB 조회(팀원 목록)가 build 시점에 고정되지 않도록 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

/**
 * 연구실 입구에 상시 띄워둘 전용 화면. (main) route group 밖에 위치해
 * StatusBar/Navigation/Footer를 상속하지 않는다(login/page.tsx와 동일한 이유).
 * 로그인 세션이 없는 공용 기기(태블릿/모니터)에서 계속 열어두는 용도라
 * 이 페이지 자체는 로그인을 요구하지 않는다(middleware의 공개 경로 목록 그대로).
 * "본인 이름 선택 → 개인 QR" 야매 체크인: 이 기기 자체가 한 번 로그인돼 있으면
 * (키오스크 계정, 개인 폰과 무관) 이름을 눌러 그 사람 전용 QR을 보여줄 수 있다 —
 * QrDisplay가 로그인 여부에 따라 이 화면(이름 선택+개인 QR) 또는 기존 익명 회전
 * QR 화면을 고른다.
 */
export default async function AttendanceDisplayPage() {
  const [user, roster] = await Promise.all([getCurrentUser(), listProfiles()]);

  return (
    <QrDisplay
      isAdminLoggedIn={!!user}
      roster={roster.map((profile) => ({ userId: profile.userId, name: profile.name }))}
    />
  );
}
