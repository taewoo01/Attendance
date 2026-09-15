import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetingNotes, meetingRecordings } from "@/db/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/files/upload-shared";

/**
 * meeting_notes Repository. 이 모듈은 서버 전용(src/lib/db/client.ts 의존)이다.
 * TASK-023: Meetings 페이지(/meetings)에서만 사용한다.
 * ORDER BY 없이 그냥 SELECT하면 Postgres가 행 순서를 전혀 보장하지 않는다 —
 * 특히 UPDATE(액션 아이템 체크 토글)마다 MVCC로 물리적 위치가 바뀌어서 매번
 * 카드 순서가 뒤섞였다. createdAt은 등록 시각에 고정되고 수정으로는 안 바뀌므로
 * 이걸로 정렬해야 "최신 등록순" + "체크해도 순서 안 흔들림"이 둘 다 보장된다.
 */
export async function listMeetings() {
  return db.select().from(meetingNotes).orderBy(desc(meetingNotes.createdAt));
}

/** 상단바 녹음 버튼으로 만든 녹음 목록. 회의록 사이드바(RecordingsCard)에 최신순으로 나열한다. */
export async function listMeetingRecordings() {
  return db.select().from(meetingRecordings).orderBy(desc(meetingRecordings.createdAt));
}

// 다운로드 signed URL(60초, getFileDownloadUrl)과 달리 <audio> 태그에 바로 물려서
// 재생하는 용도라 너무 짧으면 재생 도중 URL이 만료될 수 있다 — team/avatars.ts의
// AVATAR_URL_TTL_SECONDS와 동일한 이유로 1시간을 쓴다.
const RECORDING_URL_TTL_SECONDS = 3600;

/**
 * meeting_recordings.storagePath 목록을 받아 재생용 signed URL을 일괄 발급한다
 * (team/avatars.ts의 withAvatarUrls와 동일한 패턴).
 */
export async function withRecordingUrls<T extends { storagePath: string }>(
  recordings: T[],
): Promise<(T & { url: string | null })[]> {
  if (recordings.length === 0) return [];

  const supabaseAdmin = createAdminClient();
  const paths = recordings.map((r) => r.storagePath);
  const { data } = await supabaseAdmin.storage.from(BUCKET).createSignedUrls(paths, RECORDING_URL_TTL_SECONDS);
  const urlByPath = new Map((data ?? []).map((entry) => [entry.path, entry.signedUrl]));

  return recordings.map((r) => ({ ...r, url: urlByPath.get(r.storagePath) ?? null }));
}
