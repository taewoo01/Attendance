import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

/**
 * Supabase Auth 세션 기준 로그인 게이트.
 * 로그인 전에는 "/"를 포함한 어떤 페이지도 볼 수 없고 항상 /login으로 이동하며,
 * 이미 로그인된 상태로 /login에 다시 접근하면 홈으로 돌려보낸다.
 * (TASK-019: 기존 데모 쿠키(pg_demo_auth) 게이트를 Supabase 세션 확인으로 교체)
 */
export async function proxy(request: NextRequest) {
  const { supabase, getResponse } = createMiddlewareClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;
  const isLoginPage = request.nextUrl.pathname === "/login";
  // /auth/*(예: /auth/confirm)는 초대 수락/비밀번호 재설정 이메일 링크의 착지점이라
  // 로그인 전 상태에서도 반드시 통과해야 한다 — 여기서 자체적으로 세션을 만든다.
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth/");

  if (isAuthCallback) {
    return getResponse();
  }

  if (!isAuthenticated && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirectResponse = NextResponse.redirect(url);
    getResponse()
      .cookies.getAll()
      .forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (isAuthenticated && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    const redirectResponse = NextResponse.redirect(url);
    getResponse()
      .cookies.getAll()
      .forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return getResponse();
}

export const config = {
  // manifest.webmanifest/icons는 PWA 설치 가능 여부 판단(브라우저의 "앱 설치" 배너)에
  // 필요해 로그인 여부와 무관하게 항상 응답해야 한다 — favicon.ico와 동일한 이유로 제외.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/).*)"],
};
