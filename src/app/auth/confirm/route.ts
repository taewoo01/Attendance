import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 초대 수락(invite) / 비밀번호 재설정(recovery) 이메일 링크의 공통 착지점.
 * Supabase가 보낸 링크는 `?token_hash=...&type=invite|recovery`로 이 라우트에 도착한다.
 * verifyOtp()로 세션을 만든 뒤 항상 /set-password로 보낸다 — 실패하면 /login으로 보낸다.
 * proxy.ts는 /auth/* 를 인증 여부와 무관하게 항상 통과시킨다(로그인 전 링크 클릭이므로).
 *
 * 이 라우트가 지원하는 목적지는 /set-password 하나뿐이다(TASK-019: 인증 진입점은
 * 로그인/초대 수락+비밀번호 설정/비밀번호 재설정 3개뿐). 리다이렉트 목적지를 쿼리
 * 파라미터로 받지 않는다 — 공격자가 제어하는 입력을 리다이렉트 대상에 쓰지 않기 위함이다.
 * `type`도 이 두 흐름으로만 제한해, 이 라우트가 의도치 않은 다른 verifyOtp 용도로
 * 쓰이지 않게 한다.
 */
const ALLOWED_TYPES = new Set(["invite", "recovery"]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (tokenHash && type && ALLOWED_TYPES.has(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/set-password";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.search = "";
  return NextResponse.redirect(redirectUrl);
}
