"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db/client";
import { profiles } from "@/db/schema";
import { AVATAR_MAX_SIZE_BYTES, BUCKET, contentTypeFor, extensionOf, isImageExtension } from "@/lib/files/upload-shared";

export type UpdateTeamProfileState = { error?: string; success?: boolean };

/**
 * 팀소개 페이지 수정: EditProfileButton 전용 프로필 저장 액션. 온보딩용
 * completeOwnProfile(이름 필수 강제 흐름, 사진/전공분야 입력칸 없음)은 그대로
 * 두고, 사진/전공분야까지 다루는 이 액션을 새로 분리했다 — 온보딩 모달 동작을
 * 건드리지 않기 위함이다.
 * 사진은 선택 입력이라 안 바뀌면 avatarPath를 건드리지 않는다(기존 값 유지).
 * 새 사진이 오면: 검증 → 새 경로로 업로드 → DB 갱신 → (성공 후) 기존 파일
 * best-effort 삭제 순서로 처리한다 — achievements/idea의 "교체는 삭제 후
 * 재업로드"와 달리 avatarPath는 컬럼 하나뿐이라 먼저 새 파일을 올려서
 * 업로드 실패 시 기존 사진이 사라지지 않게 한다.
 */
export async function updateTeamProfile(formData: FormData): Promise<UpdateTeamProfileState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();

  if (!name) {
    return { error: "이름을 입력해 주세요." };
  }

  const avatar = formData.get("avatar");
  const hasNewAvatar = avatar instanceof File && avatar.size > 0;

  let newAvatarPath: string | undefined;
  let previousAvatarPath = "";

  if (hasNewAvatar) {
    if (!isImageExtension(avatar.name)) {
      return { error: "이미지 파일(png/jpg/gif)만 업로드할 수 있습니다." };
    }
    if (avatar.size > AVATAR_MAX_SIZE_BYTES) {
      return { error: "사진 용량이 5MB를 초과합니다." };
    }

    const [existing] = await db
      .select({ avatarPath: profiles.avatarPath })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);
    previousAvatarPath = existing?.avatarPath ?? "";

    // Supabase Storage 키는 non-ASCII 파일명(한글 등)을 "Invalid key"로 거부한다
    // (files/achievements처럼 원본 파일명을 그대로 쓰는 다운로드용 첨부와 달리,
    // 아바타는 화면에 원본 파일명을 노출할 일이 없어 uuid + 확장자만으로 키를 만든다).
    const ext = extensionOf(avatar.name) || "jpg";
    const storagePath = `avatars/${user.id}/${crypto.randomUUID()}.${ext}`;
    const supabaseAdmin = createAdminClient();
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, await avatar.arrayBuffer(), {
        contentType: contentTypeFor(avatar.name, avatar.type),
      });

    if (uploadError) {
      console.error("[updateTeamProfile] avatar upload failed", avatar.name, uploadError);
      return { error: "사진 업로드 중 오류가 발생했습니다." };
    }
    newAvatarPath = storagePath;
  }

  await db
    .insert(profiles)
    .values({ userId: user.id, name, role, contact, specialty, avatarPath: newAvatarPath ?? "" })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: newAvatarPath === undefined ? { name, role, contact, specialty } : { name, role, contact, specialty, avatarPath: newAvatarPath },
    });

  if (newAvatarPath && previousAvatarPath) {
    const supabaseAdmin = createAdminClient();
    const { error: removeError } = await supabaseAdmin.storage.from(BUCKET).remove([previousAvatarPath]);
    if (removeError) {
      console.error("[updateTeamProfile] old avatar cleanup failed", previousAvatarPath, removeError);
    }
  }

  revalidatePath("/team");
  revalidatePath("/");
  return { success: true };
}
