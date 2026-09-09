import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { profiles } from "@/db/schema";

/**
 * profiles Repository. 이 모듈은 서버 전용(src/lib/db/client.ts 의존)이다.
 * 현재는 초대 권한 확인(getCanInvite)에서만 사용한다 — 실적/일정 등 다른 기능은
 * profiles를 조회하지 않는다(TASK-019 지시사항: can_invite를 다른 권한과 연결하지 않음).
 */
export async function getProfileByUserId(userId: string) {
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

  return profile ?? null;
}

/**
 * Team 페이지(TASK-022)용 목록 조회. can_invite는 Team UI에 필요하지 않으므로
 * 컬럼을 명시적으로 select해 제외한다.
 */
export async function listProfiles() {
  return db
    .select({
      userId: profiles.userId,
      name: profiles.name,
      role: profiles.role,
      contact: profiles.contact,
    })
    .from(profiles);
}
