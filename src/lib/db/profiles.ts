import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db/client";
import { profiles } from "@/db/schema";

/**
 * profiles Repository. 이 모듈은 서버 전용(src/lib/db/client.ts 의존)이다.
 * 실적 페이지 상세화/로그인 온보딩 gap 이후로는 (main)/layout.tsx와 여러 page.tsx가
 * 같은 요청 안에서 같은 userId로 이 함수를 중복 호출한다 — React `cache()`로
 * 감싸 DB 커넥션 풀 압박을 줄인다(get-user.ts의 getCurrentUser와 동일한 이유).
 */
export const getProfileByUserId = cache(async (userId: string) => {
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

  return profile ?? null;
});

/**
 * Team 페이지(TASK-022)용 목록 조회. can_invite는 Team UI에 필요하지 않으므로
 * 컬럼을 명시적으로 select해 제외한다. 팀소개 페이지 수정: avatarPath/specialty
 * 추가 — avatarPath는 원본 Storage 경로일 뿐이라 화면에 쓰려면 호출부가
 * withAvatarUrls(src/lib/team/avatars.ts)로 signed URL을 따로 발급해야 한다.
 */
export async function listProfiles() {
  return db
    .select({
      userId: profiles.userId,
      name: profiles.name,
      role: profiles.role,
      contact: profiles.contact,
      specialty: profiles.specialty,
      avatarPath: profiles.avatarPath,
    })
    .from(profiles);
}
