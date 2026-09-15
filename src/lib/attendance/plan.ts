"use server";

import { getCurrentUser } from "@/lib/auth/get-user";
import { addDays, seoulDateKey } from "@/lib/date";
import { db } from "@/lib/db/client";
import { attendancePlans } from "@/db/schema";
import { CUSTOM_LABEL_MAX_LENGTH, PRESET_LABELS, VALID_KINDS, type PlanKind } from "@/lib/attendance/plan-shared";

export type SetAttendancePlanState = { error?: string; success?: boolean };

/**
 * 홈 화면(HeroSection)/출석 인증 페이지(CheckinCard) "퇴근" 처리 직후 뜨는
 * AttendancePlanModal이 호출한다. 클라이언트 컴포넌트에서 직접 호출되므로
 * (checkout.ts와 동일한 이유) 함수 단위가 아니라 파일 최상단에 "use server"가
 * 있는 별도 파일로 둔다. 다음날 하루에만 적용되는 1회성 설정이라 수정 액션은
 * 따로 두지 않는다 — 이미 등록되어 있으면(같은 날 두 번 퇴근할 수 없어 실제로는
 * 거의 안 생기지만) unique 제약에 걸려 에러로 안내한다.
 * checkout.ts와 동일한 이유로 revalidatePath를 호출하지 않는다 — 새로고침은
 * 모달을 닫을 때(AttendancePlanModal의 onClose → closePlanModal) 호출부가
 * router.refresh()로 한 번만, 원하는 시점에 한다.
 */
export async function setAttendancePlan(formData: FormData): Promise<SetAttendancePlanState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const kind = String(formData.get("kind") ?? "");
  if (!VALID_KINDS.includes(kind as PlanKind)) {
    return { error: "잘못된 선택입니다." };
  }

  let label: string;
  if (kind === "custom") {
    label = String(formData.get("label") ?? "").trim().slice(0, CUSTOM_LABEL_MAX_LENGTH);
    if (!label) {
      return { error: "내용을 입력해 주세요." };
    }
  } else {
    label = PRESET_LABELS[kind as Exclude<PlanKind, "custom">];
  }

  const tomorrowKey = addDays(seoulDateKey(new Date()), 1);

  try {
    await db.insert(attendancePlans).values({ userId: user.id, planDate: tomorrowKey, kind, label });
  } catch {
    return { error: "이미 내일 계획을 등록했어요." };
  }

  return { success: true };
}
