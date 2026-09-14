"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

/**
 * 초대 수락(invite) / 비밀번호 재설정(recovery) 이메일 링크의 착지점.
 * 커스텀 SMTP 없이 Supabase 기본 메일러를 쓰면 이메일의 확인 링크가 Supabase 호스팅
 * verify 엔드포인트를 거친 뒤, 세션 토큰을 URL 해시(#access_token=...)에 담아 이
 * 페이지로 리다이렉트한다. 해시는 서버로 전송되지 않으므로 브라우저에서만 처리 가능 —
 * `createBrowserClient()`가 기본값(detectSessionInUrl: true)으로 해시를 읽어 세션을
 * 만들고 쿠키에 반영한다. 리다이렉트 목적지를 쿼리로 받지 않는다(open redirect 방지,
 * 기존 auth/confirm 설계 원칙과 동일).
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;
      router.replace(session ? "/set-password" : "/login");
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <p className="text-[13px] text-silk-dim">처리 중입니다...</p>
    </div>
  );
}
