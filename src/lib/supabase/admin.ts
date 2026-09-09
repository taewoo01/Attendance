import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service Role Key를 사용하는 서버 전용 Admin Client.
 * `auth.admin.inviteUserByEmail()`처럼 서버에서만 허용되는 Admin API 호출에만 사용한다.
 * Client Component/Browser에서 import되면 안 된다 — 방어적으로 브라우저 실행 시 즉시 에러를 던진다.
 * anon key 기반의 일반 client(browser.ts/server.ts)와 공유하지 않는다.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient()는 서버 전용입니다. 브라우저에서 호출할 수 없습니다.");
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
