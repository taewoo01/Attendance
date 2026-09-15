import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { attendance, attendancePlans } from "@/db/schema";
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
      checkedOutAt: attendance.checkedOutAt,
    })
    .from(attendance)
    .orderBy(desc(attendance.checkedInAt));
}

/**
 * QR 체크인: 하루 중복 체크인 방지를 위해 오늘 이미 체크인했는지 먼저 확인한다.
 * attendance에 (userId, 날짜) unique 제약이 없어 애플리케이션 레벨에서 검증한다.
 * 퇴근 처리(checkOutAttendance)도 같은 오늘자 행을 찾아야 해서 checkedOutAt을 함께 반환한다.
 */
export async function findTodayAttendance(userId: string, todayKey: string) {
  const rows = await db
    .select({ id: attendance.id, checkedInAt: attendance.checkedInAt, checkedOutAt: attendance.checkedOutAt })
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

/**
 * 퇴근 처리. actions.ts의 checkOut()이 먼저 "오늘 체크인했는가"/"이미 퇴근했는가"를
 * 확인하지만, 동시 클릭 등에 대비해 여기서도 `checkedOutAt IS NULL` 조건으로 최종
 * 방어선을 둔다 — 이미 퇴근 기록이 있으면 이 UPDATE는 0행에 매치되어 아무것도 덮어쓰지 않는다.
 */
export async function checkOutAttendance(id: string) {
  const [row] = await db
    .update(attendance)
    .set({ checkedOutAt: new Date() })
    .where(and(eq(attendance.id, id), isNull(attendance.checkedOutAt)))
    .returning({ id: attendance.id, checkedOutAt: attendance.checkedOutAt });
  return row ?? null;
}

/**
 * 퇴근 직후 "내일 상주 계획" 모달에서 등록된, 특정 날짜(dateKey)의 계획 전체를
 * 가져온다. 홈 화면/출석 인증 페이지가 오늘 날짜로 호출해서 팀원별 배지를 만든다.
 */
export async function getAttendancePlansForDate(dateKey: string) {
  return db
    .select({ userId: attendancePlans.userId, kind: attendancePlans.kind, label: attendancePlans.label })
    .from(attendancePlans)
    .where(eq(attendancePlans.planDate, dateKey));
}
