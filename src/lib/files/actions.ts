"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db/client";
import { files } from "@/db/schema";
import { getFileById } from "@/lib/db/files";
import {
  ALLOWED_EXTENSIONS,
  BUCKET,
  MAX_SIZE_BYTES,
  contentTypeFor,
  extensionOf,
  sanitizeFileName,
} from "@/lib/files/upload-shared";

export type UploadFileState = { error?: string; success?: boolean };

/**
 * 파일 업로드 Server Action. 순서: Authentication → 확장자/용량 검증 →
 * Storage 업로드 → files 메타데이터 insert. 클라이언트는 file 하나만 보내고,
 * 폴더 배정 UI가 없어 folder는 항상 빈 문자열로 저장한다(TASK-029 범위).
 */
export async function uploadFile(formData: FormData): Promise<UploadFileState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "업로드할 파일을 선택해 주세요." };
  }

  const ext = extensionOf(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { error: "허용되지 않는 파일 형식입니다." };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { error: "파일 용량이 20MB를 초과합니다." };
  }

  const safeName = sanitizeFileName(file.name);
  const storagePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;

  const supabaseAdmin = createAdminClient();
  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, await file.arrayBuffer(), {
      contentType: contentTypeFor(file.name, file.type),
    });

  if (uploadError) {
    console.error("[uploadFile] file upload failed", safeName, uploadError);
    return { error: "업로드 중 오류가 발생했습니다." };
  }

  await db.insert(files).values({
    userId: user.id,
    storagePath,
    name: safeName,
    sizeBytes: file.size,
  });

  revalidatePath("/files");
  return { success: true };
}

export type DownloadUrlResult = { url?: string; error?: string };

/**
 * 다운로드 signed URL 발급 Server Action. 클라이언트는 Storage 경로를 직접
 * 조합하지 않는다(docs/MIGRATION.md 11절) — 인증된 사용자면 60초 만료 URL을
 * 서버가 대신 발급한다.
 */
export async function getFileDownloadUrl(fileId: string): Promise<DownloadUrlResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const file = await getFileById(fileId);
  if (!file) {
    return { error: "파일을 찾을 수 없습니다." };
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(file.storagePath, 60);

  if (error || !data) {
    return { error: "다운로드 링크 발급 중 오류가 발생했습니다." };
  }

  return { url: data.signedUrl };
}
