import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Component에서 사용하는 Supabase client 팩토리.
 * anon key만 사용하며(브라우저에 노출되는 것을 전제로 함), service role key는 여기서 참조하지 않는다.
 * TASK-017 범위: client 생성 구조만 준비하고 Auth 로직은 구현하지 않는다.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
