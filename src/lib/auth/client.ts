import { createClient } from "@/lib/supabase/browser";

/**
 * Client Component에서 사용하는 Supabase Auth 최소 wrapper.
 * 로그인/비밀번호 재설정 요청은 Server Action(src/lib/auth/login.ts)에서
 * 처리한다 — 클라이언트가 anon key로 직접 호출하지 않는다. 여기 남기는 것은
 * 그럴 필요가 없는(별도 서버 상태 검증이 필요 없는) signOut()뿐이다.
 */
export function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}
