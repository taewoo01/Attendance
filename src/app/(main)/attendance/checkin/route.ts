import { NextResponse, type NextRequest } from "next/server";
import { checkInWithQr } from "@/lib/attendance/actions";

/**
 * QR 스캔이 여는 착지 URL. 결과를 쿼리 파라미터로만 실어 /attendance/checkin-result로
 * 리다이렉트한다(auth/callback/page.tsx와 동일하게, 리다이렉트 목적지 자체는 고정하고
 * 상태값만 전달한다). /attendance(로그인 필요)로 바로 보내지 않는 이유: "본인 QR"
 * (로그인 없이 체크인되는 개인 토큰)을 스캔하면 체크인 자체는 성공해도 스캔한 폰이
 * 로그인 안 돼 있을 수 있어서, 그대로 보내면 결과 대신 로그인 화면이 뜬다.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t");
  const result = await checkInWithQr(token);

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/attendance/checkin-result";
  redirectUrl.search = `?checkin=${result}`;
  return NextResponse.redirect(redirectUrl);
}
