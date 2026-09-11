import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/files/upload-shared";

/**
 * 팀소개 페이지 수정: 프로필 사진 signed URL 발급 TTL. 다운로드 signed URL(60초,
 * getFileDownloadUrl)과 달리 team 페이지에 여러 장을 한 번에 렌더링하는 용도라
 * 너무 짧으면 느린 네트워크에서 이미지가 깨질 수 있다 — 페이지 자체가
 * force-dynamic이라 매 요청마다 새로 발급되므로 1시간으로도 "만료가 있는
 * presigned URL"(AGENTS.md 11.4절) 요구는 충족한다.
 */
const AVATAR_URL_TTL_SECONDS = 3600;

/**
 * profiles.avatarPath 목록을 받아 한 번의 Storage 호출(createSignedUrls)로
 * signed URL을 일괄 발급한다. 클라이언트가 Storage 경로를 직접 조합하지 않도록
 * (docs/MIGRATION.md 11절) 항상 서버(이 함수)에서만 URL을 만든다.
 */
export async function withAvatarUrls<T extends { avatarPath: string }>(
  members: T[],
): Promise<(T & { avatarUrl: string | null })[]> {
  const paths = members.map((member) => member.avatarPath).filter(Boolean);
  if (paths.length === 0) {
    return members.map((member) => ({ ...member, avatarUrl: null }));
  }

  const supabaseAdmin = createAdminClient();
  const { data } = await supabaseAdmin.storage.from(BUCKET).createSignedUrls(paths, AVATAR_URL_TTL_SECONDS);
  const urlByPath = new Map((data ?? []).map((entry) => [entry.path, entry.signedUrl]));

  return members.map((member) => ({
    ...member,
    avatarUrl: member.avatarPath ? (urlByPath.get(member.avatarPath) ?? null) : null,
  }));
}
