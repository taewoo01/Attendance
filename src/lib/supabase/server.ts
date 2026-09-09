import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Component/Server Action/Route Handler 전용 Supabase client 팩토리.
 * `next/headers`의 `cookies()`를 사용하므로 Client Component에서 import하면 빌드 에러가 난다 —
 * 이 파일은 서버 전용 코드에서만 import한다. anon key만 사용하며, service role key는
 * 이 파일에서 다루지 않는다(TASK-017 범위 밖 — 필요해지면 별도 서버 전용 client로 분리한다).
 * TASK-017 범위: client 생성 구조만 준비하고 Auth 로직/세션 검증은 구현하지 않는다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component에서 호출되면 쿠키를 쓸 수 없다 — 세션 갱신은
            // 이후 TASK에서 proxy(middleware)가 담당하게 되면 여기서는 무시해도 된다.
          }
        },
      },
    },
  );
}
