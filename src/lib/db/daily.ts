import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { dailyLogTemplates, dailyLogs, profiles } from "@/db/schema";

/**
 * daily_logs Repository. 이 모듈은 서버 전용(src/lib/db/client.ts 의존)이다.
 * TASK-025: Daily 페이지(/daily)에서만 사용한다. 작성자 이름 표시를 위해
 * profiles를 함께 조회한다(can_invite 등 다른 컬럼은 select하지 않는다).
 */
export async function listDailyLogs() {
  return db
    .select({
      id: dailyLogs.id,
      userId: dailyLogs.userId,
      loggedAt: dailyLogs.loggedAt,
      body: dailyLogs.body,
      checklist: dailyLogs.checklist,
      name: profiles.name,
    })
    .from(dailyLogs)
    .leftJoin(profiles, eq(dailyLogs.userId, profiles.userId))
    .orderBy(desc(dailyLogs.loggedAt));
}

/** TASK-035: "자주 쓰는 체크리스트" — 사이드바가 로그인한 사용자 본인의 템플릿만 보여준다. */
export async function listMyTemplates(userId: string) {
  return db.select().from(dailyLogTemplates).where(eq(dailyLogTemplates.userId, userId)).orderBy(asc(dailyLogTemplates.title));
}
