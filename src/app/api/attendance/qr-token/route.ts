import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { issueAttendanceQrToken, issuePersonalAttendanceQrToken } from "@/lib/attendance/qr-token";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 입구 디스플레이(/attendance-display)가 폴링하는 회전 토큰 발급 엔드포인트.
 * `userId` 쿼리 없이 호출하면 기존과 동일한 익명 토큰(로그인 불필요, 실제 인증은
 * /attendance/checkin에서 수행)을 내려준다.
 * `userId`를 붙이면(입구 디스플레이의 "본인 이름 선택" 화면 전용) 그 사람으로
 * 바로 체크인되는 개인 토큰을 내려주는데, 이건 로그인 여부를 요구한다 — 그렇지
 * 않으면 userId만 알아내면 누구나 원격으로 남을 체크인시킬 수 있다. 이 로그인은
 * 입구 기기 자체(키오스크)가 한 번만 해두면 되고, 스캔하는 개인 폰과는 무관하다.
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (userId) {
    if (!UUID_RE.test(userId)) {
      return NextResponse.json({ error: "invalid userId" }, { status: 400 });
    }
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    const { token, windowSeconds } = issuePersonalAttendanceQrToken(userId);
    return NextResponse.json(
      { token, windowSeconds },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const { token, windowSeconds } = issueAttendanceQrToken();
  return NextResponse.json(
    { token, windowSeconds },
    { headers: { "Cache-Control": "no-store" } },
  );
}
