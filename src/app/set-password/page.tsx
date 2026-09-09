import { SetPasswordForm } from "@/components/set-password/SetPasswordForm";

/**
 * 초대 수락(최초 비밀번호 설정) / 비밀번호 재설정 공통 화면.
 * (main) route group 밖에 위치해 StatusBar/Footer를 상속하지 않는다(login 페이지와 동일).
 * 세션이 없으면 proxy.ts가 보호 라우트로 판단해 /login으로 보낸다 — 이 페이지는
 * src/app/auth/confirm이 만든 세션이 있을 때만 실질적으로 도달 가능하다.
 */
export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <SetPasswordForm />
    </div>
  );
}
