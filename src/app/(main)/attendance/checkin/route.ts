import { NextResponse, type NextRequest } from "next/server";
import { checkInWithQr } from "@/lib/attendance/actions";

/**
 * QR 스캔이 여는 착지 URL. 결과를 쿼리 파라미터로만 실어 /attendance로 리다이렉트한다
 * (auth/callback/page.tsx와 동일하게, 리다이렉트 목적지 자체는 고정하고 상태값만 전달한다).
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t");
  const result = await checkInWithQr(token);

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/attendance";
  redirectUrl.search = `?checkin=${result}`;
  return NextResponse.redirect(redirectUrl);
}
