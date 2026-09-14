"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = new Set(["invite", "recovery"]);

export type ConfirmActionState = { error?: string };

/**
 * 초대 수락(invite) / 비밀번호 재설정(recovery) 이메일의 실제 인증 처리.
 * 메일 클라이언트/보안 스캐너가 링크를 미리 방문(prefetch)해 1회용 토큰을
 * 먼저 소모해버리는 문제(실제로 재현·확인함) 때문에, 이 처리는 페이지 GET이
 * 아니라 사람이 버튼을 눌러 만드는 form POST(Server Action)에서만 실행한다 —
 * 자동 스캐너는 보통 링크만 따라가고 폼을 제출하지는 않는다.
 * type은 invite/recovery 둘로만 제한한다(fail closed, 기존 auth/confirm과 동일한
 * open redirect 방지 원칙 — 리다이렉트 목적지를 쿼리로 받지 않고 항상 /set-password
 * 로 고정한다).
 */
export async function confirmAuthToken(
  tokenHash: string,
  type: string,
): Promise<ConfirmActionState> {
  if (!tokenHash || !ALLOWED_TYPES.has(type)) {
    return { error: "잘못된 링크입니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: type as "invite" | "recovery",
    token_hash: tokenHash,
  });

  if (error) {
    return { error: "링크가 만료되었거나 이미 사용되었습니다. 다시 요청해 주세요." };
  }

  redirect("/set-password");
}
