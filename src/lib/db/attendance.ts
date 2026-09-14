import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { attendance } from "@/db/schema";
import { seoulDateKey } from "@/lib/date";

/**
 * attendance Repository. 이 모듈은 서버 전용(src/lib/db/client.ts 의존)이다.
 * TASK-027: Attendance 페이지(/attendance)에서만 사용한다.
 */
export async function listAttendance() {
  return db
    .select({
      id: attendance.id,
      userId: attendance.userId,
      checkedInAt: attendance.checkedInAt,
    })
    .from(attendance)
    .orderBy(desc(attendance.checkedInAt));
}

/**
 * QR 체크인: 하루 중복 체크인 방지를 위해 오늘 이미 체크인했는지 먼저 확인한다.
 * attendance에 (userId, 날짜) unique 제약이 없어 애플리케이션 레벨에서 검증한다.
 */
export async function findTodayAttendance(userId: string, todayKey: string) {
  const rows = await db
    .select({ id: attendance.id, checkedInAt: attendance.checkedInAt })
    .from(attendance)
    .where(eq(attendance.userId, userId));

  return rows.find((row) => seoulDateKey(row.checkedInAt) === todayKey) ?? null;
}

export async function insertAttendanceCheckIn(userId: string) {
  const [row] = await db
    .insert(attendance)
    .values({ userId })
    .returning({ id: attendance.id, checkedInAt: attendance.checkedInAt });
  return row;
}
