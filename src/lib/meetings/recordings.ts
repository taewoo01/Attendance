"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db/client";
import { meetingRecordings } from "@/db/schema";
import { BUCKET, MAX_SIZE_BYTES, extensionOf } from "@/lib/files/upload-shared";

/**
 * 상단바 녹음 버튼(RecordingControl.tsx)이 만드는 오디오 파일의 허용 확장자.
 * 문서 첨부(upload-shared.ts의 ALLOWED_EXTENSIONS)와는 별도로 둔다 — 녹음
 * 파일은 브라우저 MediaRecorder가 만드는 형식(webm/ogg/mp4)만 올라오고, 이
 * 목록을 문서 업로드 쪽에 섞으면 자료실/실적/아이디어 첨부파일에서도 오디오를
 * 받게 되어 그쪽 화면 의도와 맞지 않는다.
 */
const AUDIO_EXTENSIONS = new Set(["webm", "ogg", "m4a"]);
const AUDIO_MIME_TYPES: Record<string, string> = {
  webm: "audio/webm",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
};

/** "9월 15일 14:32"(Asia/Seoul) — 녹음 기본 표시 이름에 쓴다. */
function formatSeoulTimestamp(date: Date): string {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("month")} ${get("day")} ${get("hour")}:${get("minute")}`;
}

export type CreateMeetingRecordingState = { error?: string; success?: boolean };

/**
 * 상단바 녹음 버튼 종료 시 호출된다. 어느 페이지에 있었는지와 무관하게 항상
 * 이 액션으로 저장되고, 특정 회의록과 묶지 않는다(schema.ts의
 * meeting_recordings 주석 참고) — 회의록 페이지 사이드바(RecordingsCard)에
 * 최신순으로 나열된다.
 */
export async function createMeetingRecording(formData: FormData): Promise<CreateMeetingRecordingState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const file = formData.get("recording");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "녹음 파일이 없습니다." };
  }

  const ext = extensionOf(file.name);
  if (!AUDIO_EXTENSIONS.has(ext)) {
    return { error: "지원하지 않는 녹음 형식입니다." };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { error: "녹음 용량이 20MB를 초과합니다." };
  }

  const durationSeconds = Math.max(0, Math.round(Number(formData.get("durationSeconds") ?? 0)) || 0);
  const name = `회의 녹음 ${formatSeoulTimestamp(new Date())}`;
  // Storage 키는 한글 등 비-ASCII 문자가 섞이면 업로드가 실패해서 UUID+확장자로만
  // 구성한다(upload-shared.ts의 sanitizeFileName 주석과 동일한 이유).
  const storagePath = `meeting-recordings/${user.id}/${crypto.randomUUID()}.${ext}`;

  const supabaseAdmin = createAdminClient();
  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, await file.arrayBuffer(), { contentType: AUDIO_MIME_TYPES[ext] });

  if (uploadError) {
    console.error("[createMeetingRecording] recording upload failed", uploadError);
    return { error: "녹음 저장 중 오류가 발생했습니다." };
  }

  await db.insert(meetingRecordings).values({
    userId: user.id,
    storagePath,
    name,
    durationSeconds,
    sizeBytes: file.size,
  });

  revalidatePath("/meetings");
  return { success: true };
}

export type DeleteMeetingRecordingState = { error?: string; success?: boolean };

/** 본인이 만든 녹음만 삭제 가능(WHERE userId = 본인 — deleteFile과 동일한 소유권 검증 방식). */
export async function deleteMeetingRecording(id: string): Promise<DeleteMeetingRecordingState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const deleted = await db
    .delete(meetingRecordings)
    .where(and(eq(meetingRecordings.id, id), eq(meetingRecordings.userId, user.id)))
    .returning({ id: meetingRecordings.id, storagePath: meetingRecordings.storagePath });

  if (deleted.length === 0) {
    return { error: "삭제할 녹음을 찾을 수 없습니다(본인이 만든 녹음만 삭제할 수 있어요)." };
  }

  const supabaseAdmin = createAdminClient();
  await supabaseAdmin.storage.from(BUCKET).remove([deleted[0].storagePath]);

  revalidatePath("/meetings");
  return { success: true };
}
