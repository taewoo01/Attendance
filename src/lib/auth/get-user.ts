import { createClient } from "@/lib/supabase/server";

/**
 * Server Component/Server Action에서 현재 로그인 사용자를 확인하는 최소 helper.
 * 세션이 없으면 user는 null이다. profile/DB 조회는 TASK-018 범위.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
