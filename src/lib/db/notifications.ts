import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { notifications } from "@/db/schema";

const RECENT_LIMIT = 20;

/**
 * notifications Repository. 이 모듈은 서버 전용(src/lib/db/client.ts 의존)이다.
 * (main)/layout.tsx가 상단바 알림 벨의 "나에게 온 알림" 섹션을 채우는 데 쓴다.
 */
export async function listNotificationsForUser(userId: string, limit = RECENT_LIMIT) {
  return db
    .select({
      id: notifications.id,
      type: notifications.type,
      message: notifications.message,
      linkHref: notifications.linkHref,
      createdAt: notifications.createdAt,
      readAt: notifications.readAt,
    })
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}
