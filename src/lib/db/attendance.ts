import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { attendance } from "@/db/schema";

/**
 * attendance Repository. 이 모듈은 서버 전용(src/lib/db/client.ts 의존)이다.
 * TASK-027: Attendance 페이지(/attendance)에서만 사용한다. 체크인 로직(실제
 * QR 토큰 발급/검증)은 이 모듈의 범위가 아니다 — 조회만 담당한다.
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
