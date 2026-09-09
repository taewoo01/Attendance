import { SetPasswordForm } from "@/components/set-password/SetPasswordForm";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getProfileByUserId } from "@/lib/db/profiles";

/**
 * 초대 수락(최초 비밀번호 설정) / 비밀번호 재설정 공통 화면.
 * (main) route group 밖에 위치해 StatusBar/Footer를 상속하지 않는다(login 페이지와 동일).
 * 세션이 없으면 proxy.ts가 보호 라우트로 판단해 /login으로 보낸다 — 이 페이지는
 * src/app/auth/confirm이 만든 세션이 있을 때만 실질적으로 도달 가능하다.
 * 로그인 관련 온보딩 gap: 이 라우트는 초대 수락(invite)과 비밀번호 재설정(recovery)
 * 을 구분하지 않고 공유한다(auth/confirm/route.ts가 보안상 type 쿼리파라미터를
 * 여기로 넘기지 않는다) — 대신 profiles.name이 비어있으면(=이름을 한 번도
 * 입력한 적 없는 초대 수락 최초 로그인) 이름 입력칸을 같이 보여준다.
 */
export default async function SetPasswordPage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfileByUserId(user.id) : null;
  const needsName = !profile?.name;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <SetPasswordForm needsName={needsName} defaultEmail={user?.email} />
    </div>
  );
}
