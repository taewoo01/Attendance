import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// src/components/login/LoginScreen.tsx의 데모 로그인 성공 시 세팅하는 쿠키와 이름을 맞춘다.
const AUTH_COOKIE = "pg_demo_auth";

/**
 * 데모 수준의 로그인 게이트.
 * 실제 Supabase Auth/서버 세션 검증이 아니라, /login에서 데모 계정(demo@edcl.team/1234)
 * 로그인에 성공했을 때만 세팅되는 쿠키(pg_demo_auth) 존재 여부만 확인한다.
 * 로그인 전에는 "/"를 포함한 어떤 페이지도 볼 수 없고 항상 /login으로 이동하며,
 * 이미 로그인된 상태로 /login에 다시 접근하면 홈으로 돌려보낸다.
 */
export function proxy(request: NextRequest) {
  const isAuthenticated = request.cookies.has(AUTH_COOKIE);
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!isAuthenticated && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
