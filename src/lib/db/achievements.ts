import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { achievementFiles, achievements } from "@/db/schema";

/**
 * achievements Repository. 이 모듈은 서버 전용(src/lib/db/client.ts 의존)이다.
 * TASK-026: Results 페이지(/results)에서만 사용한다.
 */
export async function listAchievements() {
  return db.select().from(achievements).orderBy(desc(achievements.createdAt));
}

/** 실적 상세 페이지(/results/[id])용. */
export async function getAchievementById(id: string) {
  const [row] = await db.select().from(achievements).where(eq(achievements.id, id)).limit(1);
  return row ?? null;
}

/** 실적 페이지 상세화 #8: 실적 하나당 여러 첨부파일. */
export async function listAchievementFiles() {
  return db.select().from(achievementFiles);
}

export async function getAchievementFileById(id: string) {
  const [row] = await db.select().from(achievementFiles).where(eq(achievementFiles.id, id)).limit(1);
  return row ?? null;
}

/** 실적 삭제 시 Storage 정리용 — 삭제 대상 실적에 달린 첨부파일 목록. */
export async function listAchievementFilesFor(achievementId: string) {
  return db.select().from(achievementFiles).where(eq(achievementFiles.achievementId, achievementId));
}
