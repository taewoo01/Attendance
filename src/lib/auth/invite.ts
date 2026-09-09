"use server";

import { getCurrentUser } from "@/lib/auth/get-user";
import { getCanInvite } from "@/lib/auth/can-invite";
import { createAdminClient } from "@/lib/supabase/admin";

export type InviteActionState = { error?: string; success?: boolean };

/**
 * 팀원 초대 Server Action.
 * 순서를 반드시 지킨다: Authentication → Authorization → Admin API.
 * userId/can_invite는 client가 아니라 서버 세션(getCurrentUser)과 DB(getCanInvite)에서만
 * 가져온다 — formData가 신뢰하는 값은 email 하나뿐이다.
 * can_invite=true로 seed된 사용자가 없는 한(초기 창업 멤버 4명, drizzle/sql/seed-founders.template.sql)
 * 모든 요청이 fail closed로 거부된다.
 */
export async function inviteTeamMember(
  _prevState: InviteActionState,
  formData: FormData,
): Promise<InviteActionState> {
  const email = String(formData.get("email") ?? "").trim();

  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const canInvite = await getCanInvite(user.id);
  if (!canInvite) {
    return { error: "팀원을 초대할 권한이 없습니다." };
  }

  if (!email) {
    return { error: "이메일을 입력해 주세요." };
  }

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

  if (error) {
    return { error: "초대 처리 중 오류가 발생했습니다." };
  }

  return { success: true };
}
