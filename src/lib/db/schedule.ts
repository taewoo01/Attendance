import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { fixedSchedules, personalEvents, profiles } from "@/db/schema";

/**
 * personal_events / fixed_schedules Repository. 이 모듈은 서버 전용
 * (src/lib/db/client.ts 의존)이다. TASK-028: Schedule 페이지(/schedule)의
 * 주간 뷰/사이드바에서만 사용한다(월간 뷰는 정적 유지). 작성자 이름 표시를
 * 위해 profiles를 함께 조회한다.
 */
export async function listPersonalEvents() {
  return db
    .select({
      id: personalEvents.id,
      userId: personalEvents.userId,
      eventDate: personalEvents.eventDate,
      eventTime: personalEvents.eventTime,
      eventEndTime: personalEvents.eventEndTime,
      title: personalEvents.title,
      name: profiles.name,
    })
    .from(personalEvents)
    .leftJoin(profiles, eq(personalEvents.userId, profiles.userId));
}

export async function listFixedSchedules() {
  return db
    .select({
      id: fixedSchedules.id,
      userId: fixedSchedules.userId,
      dayOfWeek: fixedSchedules.dayOfWeek,
      timeRange: fixedSchedules.timeRange,
      title: fixedSchedules.title,
      name: profiles.name,
    })
    .from(fixedSchedules)
    .leftJoin(profiles, eq(fixedSchedules.userId, profiles.userId));
}
