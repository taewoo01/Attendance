import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getCanInvite } from "@/lib/auth/can-invite";
import { InviteForm } from "@/components/invite/InviteForm";

/**
 * 팀원 초대 화면. (main) route group 안에 있어 다른 페이지와 동일하게
 * StatusBar/Footer를 상속한다. can_invite=false인 사용자는 페이지 자체에
 * 접근할 수 없다 — 서버에서 세션의 실제 DB 값(getCanInvite)으로 확인하고,
 * 클라이언트가 보낸 값은 신뢰하지 않는다. Server Action(src/lib/auth/invite.ts)의
 * can_invite 재검사는 그대로 유지되어 있어(defense in depth), 이 페이지 체크를
 * 우회해 직접 제출해도 서버 액션에서 다시 막힌다.
 */
export default async function InvitePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const canInvite = await getCanInvite(user.id);
  if (!canInvite) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-[480px] px-6 py-16">
      <InviteForm />
    </div>
  );
}
