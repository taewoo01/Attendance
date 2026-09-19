"use server";

import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/get-user";

/**
 * 알림 벨을 열면(NotificationBell) 호출한다. 개별 알림 클릭이 아니라 "열람"
 * 자체를 읽음 처리 시점으로 삼는다(안읽음 배지가 열자마자 사라지는 익숙한 패턴).
 * checkout.ts와 동일한 이유로 클라이언트 컴포넌트가 직접 호출하는 별도 파일에
 * "use server"를 둔다.
 */
export async function markAllNotificationsRead(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));
}
