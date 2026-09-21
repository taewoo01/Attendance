"use server";

import { getCurrentUser } from "@/lib/auth/get-user";
import { checkOutAttendance, findOpenAttendance } from "@/lib/db/attendance";

export type CheckOutState = { error?: string; success?: boolean };

/**
 * 홈 화면(HeroSection)/출석 인증 페이지(CheckinCard) "퇴근" 버튼이 호출하는
 * Server Action. 체크인과 달리 QR/위치 증빙 없이 버튼 한 번으로 처리하기로
 * 했다(사용자 확인 완료) — 로그인 여부와 "아직 퇴근하지 않은 출석 행이 있는가"만
 * 확인한다(날짜가 아니라 퇴근 여부 기준 — 밤새 상주해 날짜가 바뀌어도 퇴근
 * 버튼을 눌러야만 처리된다). 클라이언트 컴포넌트에서 직접 호출되므로(Next.js 제약) 함수 단위가
 * 아니라 파일 최상단에 "use server"가 있는 별도 파일로 둔다 — actions.ts의
 * checkInWithQr은 Route Handler 전용이라 그 파일과 이 파일을 분리했다.
 * 일부러 revalidatePath를 호출하지 않는다 — 여기서 revalidatePath를 쓰면
 * Next.js가 액션 응답과 동시에 화면을 즉시 새로고침해버려서, 호출부
 * (HeroSection/CheckinCard)가 의도한 "퇴근 → 내일 상주 계획 모달 → 모달을
 * 닫을 때 새로고침" 순서보다 먼저 끼어들어 모달을 띄우려는 상태 변경이
 * 덮어써지는 문제가 있었다. 새로고침은 호출부가 router.refresh()로 직접,
 * 원하는 시점에만 하도록 남겨둔다.
 */
export async function checkOut(): Promise<CheckOutState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const existing = await findOpenAttendance(user.id);
  if (!existing) {
    return { error: "아직 체크인하지 않았거나 이미 퇴근 처리되었습니다." };
  }

  await checkOutAttendance(existing.id);

  return { success: true };
}
