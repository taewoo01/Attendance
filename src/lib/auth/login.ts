"use server";

import { createClient } from "@/lib/supabase/server";
import { getRequestOrigin } from "@/lib/auth/request-origin";

/**
 * 로그인 화면(LoginScreen/LoginForm) 전용 Server Action.
 * 클라이언트가 anon key로 Supabase Auth를 직접 호출하지 않도록,
 * signInWithPassword()/resetPasswordForEmail()을 서버에서만 실행한다.
 * 실패 사유는 구분하지 않고 통일된 메시지로만 응답한다(계정 존재 여부 추측 방지).
 */
export async function signInAction(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }
  return { error: null };
}

/**
 * 비밀번호 재설정 요청. redirectTo는 클라이언트의 window.location.origin 대신
 * 서버에서 받은 요청 헤더(host/x-forwarded-proto)로 동일하게 재구성한다.
 * /auth/callback → /set-password로 이어지는 recovery 흐름(invite와 공유)으로 착지한다.
 */
export async function resetPasswordAction(email: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const origin = await getRequestOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback`,
  });

  return { error: error ? error.message : null };
}
