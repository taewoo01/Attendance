import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * src/proxy.ts(Next.js Middleware) 전용 Supabase client 팩토리.
 * `next/headers`의 `cookies()`는 middleware 런타임에서 사용할 수 없으므로,
 * NextRequest/NextResponse의 쿠키 API로 별도 adapter를 구성한다.
 * anon key만 사용하며, service role key는 여기서 다루지 않는다.
 */
export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  return { supabase, getResponse: () => response };
}
