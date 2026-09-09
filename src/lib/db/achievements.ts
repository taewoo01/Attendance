import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { achievements } from "@/db/schema";

/**
 * achievements Repository. 이 모듈은 서버 전용(src/lib/db/client.ts 의존)이다.
 * TASK-026: Results 페이지(/results)에서만 사용한다.
 */
export async function listAchievements() {
  return db.select().from(achievements).orderBy(desc(achievements.createdAt));
}
