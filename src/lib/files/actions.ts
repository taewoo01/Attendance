"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db/client";
import { files, folders } from "@/db/schema";
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
 * Storage 업로드 → files 메타데이터 insert. 폴더 상세 화면에서 업로드하면
 * UploadButton이 formData에 folder를 함께 보낸다 — 전체 폴더 화면에서는 folder가
 * 없어 기존처럼 빈 문자열로 저장된다.
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

  const folder = String(formData.get("folder") ?? "").trim().slice(0, 60);

  const safeName = sanitizeFileName(file.name);
  // Storage 오브젝트 키는 한글 등 비-ASCII 문자가 섞이면 업로드가 실패해서
  // UUID+확장자로만 구성한다(upload-shared.ts의 sanitizeFileName 주석 참고).
  // 화면에 보여줄 원본 파일명은 DB의 name 컬럼(safeName)에만 저장한다.
  const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

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
    folder,
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

export type DeleteFileState = { error?: string; success?: boolean };

/**
 * 파일 삭제. 본인이 올린 파일만 삭제 가능(WHERE userId = 본인 — ideas.deleteIdea와
 * 동일한 소유권 검증 방식). DB 행 삭제가 성공한 경우에만 Storage 객체를 지운다
 * (Storage 삭제는 best-effort — 실패해도 이미 끝난 DB 삭제를 되돌리지 않는다).
 */
export async function deleteFile(id: string): Promise<DeleteFileState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const deleted = await db
    .delete(files)
    .where(and(eq(files.id, id), eq(files.userId, user.id)))
    .returning({ id: files.id, storagePath: files.storagePath });

  if (deleted.length === 0) {
    return { error: "삭제할 파일을 찾을 수 없습니다(본인이 올린 파일만 삭제할 수 있어요)." };
  }

  const supabaseAdmin = createAdminClient();
  await supabaseAdmin.storage.from(BUCKET).remove([deleted[0].storagePath]);

  revalidatePath("/files");
  return { success: true };
}

export type CreateFolderState = { error?: string; success?: boolean };

/**
 * 새 폴더 생성. files.folder(파일에 붙는 자유 텍스트 태그)와 달리 파일 없이도
 * 존재해야 해서 folders 테이블에 별도로 저장한다. 이름 중복은 DB의
 * folders_name_unique로도 막히지만, 미리 조회해서 더 친절한 에러 메시지를 준다.
 */
export async function createFolder(formData: FormData): Promise<CreateFolderState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "폴더 이름을 입력해 주세요." };
  }

  const existing = await db.select({ id: folders.id }).from(folders).where(eq(folders.name, name)).limit(1);
  if (existing.length > 0) {
    return { error: "이미 같은 이름의 폴더가 있어요." };
  }

  try {
    await db.insert(folders).values({ userId: user.id, name });
  } catch {
    return { error: "폴더 생성 중 오류가 발생했습니다." };
  }

  revalidatePath("/files");
  return { success: true };
}

export type DeleteFolderState = { error?: string; success?: boolean };

/**
 * 폴더 삭제. 본인이 만든 폴더만 삭제 가능(WHERE userId = 본인 — deleteFile과
 * 동일한 소유권 검증 방식). folders는 files.folder와 FK로 묶여 있지 않아
 * 이미 그 이름으로 태그된 파일이 있어도 파일 자체는 지워지지 않는다(폴더
 * 카드만 사라지고 파일의 folder 텍스트값은 그대로 남는다).
 */
export async function deleteFolder(id: string): Promise<DeleteFolderState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const deleted = await db
    .delete(folders)
    .where(and(eq(folders.id, id), eq(folders.userId, user.id)))
    .returning({ id: folders.id });

  if (deleted.length === 0) {
    return { error: "삭제할 폴더를 찾을 수 없습니다(본인이 만든 폴더만 삭제할 수 있어요)." };
  }

  revalidatePath("/files");
  return { success: true };
}
