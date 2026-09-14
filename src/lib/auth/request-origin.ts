import { headers } from "next/headers";

/**
 * 현재 요청의 origin을 서버에서 재구성한다. 클라이언트가 보낸 window.location.origin을
 * 신뢰하지 않고 요청 헤더(host/x-forwarded-proto)만 사용한다 — Supabase Auth의
 * redirectTo(초대/비밀번호 재설정 이메일 링크 목적지)를 만들 때 쓴다.
 */
export async function getRequestOrigin(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host");
  const proto =
    headersList.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https");
  return host ? `${proto}://${host}` : "";
}
