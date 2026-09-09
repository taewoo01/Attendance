"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-user";
import { db } from "@/lib/db/client";
import { profiles } from "@/db/schema";

export type CompleteProfileState = { error?: string; success?: boolean };

export type CompleteProfileInput = { name: string; role: string; contact: string };

/**
 * 로그인 관련 온보딩 gap: Supabase Auth에 직접 등록된 계정이나 초대 수락 계정
 * 모두 auth.users insert 트리거(0001 마이그레이션)가 profiles 행을 만들지만
 * `name`/`role`/`contact`는 항상 빈 문자열로 남는다 — 이메일/비밀번호만 다루는
 * 로그인/초대/비밀번호 설정 폼 어디에도 이 값들을 받는 곳이 없었기 때문이다.
 * 이 액션이 그 값들을 채우는 유일한 경로다: (1) 초대 수락 시 `/set-password`에서
 * 비밀번호와 함께, (2) 직접 등록된 계정은 로그인 후 profiles.name이 비어있으면
 * (main)/layout.tsx가 띄우는 CompleteProfileModal에서 각각 호출한다.
 * `role`/`contact`는 team 페이지 표시 외 다른 기능과 연결되지 않아 선택 입력이고,
 * `name`만 필수다. profiles insert가 트리거 실패 등으로 아직 없는 예외 상황도
 * 있을 수 있어 upsert로 처리한다(단순 update가 아니다).
 */
export async function completeOwnProfile(input: CompleteProfileInput): Promise<CompleteProfileState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const name = input.name.trim();
  const role = input.role.trim();
  const contact = input.contact.trim();

  if (!name) {
    return { error: "이름을 입력해 주세요." };
  }

  await db
    .insert(profiles)
    .values({ userId: user.id, name, role, contact })
    .onConflictDoUpdate({ target: profiles.userId, set: { name, role, contact } });

  revalidatePath("/");
  return { success: true };
}
