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
 * QR 체크인 중복 방지 & 퇴근 처리 대상 조회 공용: "오늘 체크인했는가"가 아니라
 * "아직 퇴근하지 않은 행이 있는가"로 판단한다. 상주팀이 자정을 넘겨 밤새
 * 있는 경우가 많아서, 체크인 날짜 기준으로 찾으면 날짜가 바뀌는 순간 열려
 * 있는 출석 행을 못 찾아 "퇴근" 버튼이 사라지고 미출근으로 보이는 문제가
 * 있었다 — 퇴근 버튼을 눌러야만(checkOutAttendance) 상태가 정리되도록 한다.
 */
export async function findOpenAttendance(userId: string) {
  const [row] = await db
    .select({ id: attendance.id, checkedInAt: attendance.checkedInAt, checkedOutAt: attendance.checkedOutAt })
    .from(attendance)
    .where(and(eq(attendance.userId, userId), isNull(attendance.checkedOutAt)))
    .orderBy(desc(attendance.checkedInAt))
    .limit(1);

  return row ?? null;
}

export type AttendanceCheckRow = { checkedInAt: Date; checkedOutAt: Date | null };
export type AttendanceState = AttendanceCheckRow & { status: "on" | "left" };

/** attendance 전체 목록(desc 정렬 전제)에서 사용자별 가장 최근 체크인 행만 추린다. */
export function latestAttendanceByUser<T extends { userId: string; checkedInAt: Date; checkedOutAt: Date | null }>(
  rows: T[],
): Map<string, AttendanceCheckRow> {
  const map = new Map<string, AttendanceCheckRow>();
  for (const row of rows) {
    if (!map.has(row.userId)) {
      map.set(row.userId, { checkedInAt: row.checkedInAt, checkedOutAt: row.checkedOutAt });
    }
  }
  return map;
}

/**
 * 사용자의 가장 최근 체크인 행으로 "오늘" 기준 출석 상태를 판단한다.
 * - 아직 퇴근 전(checkedOutAt 없음): 체크인이 어제였어도 "on"(밤새 상주 중).
 * - 오늘 퇴근함: "left".
 * - 어제 이전에 이미 퇴근했고 오늘은 아직 체크인 안 함: null(오늘 기준 미출근).
 */
export function resolveAttendanceState(latest: AttendanceCheckRow | undefined, todayKey: string): AttendanceState | null {
  if (!latest) return null;
  if (!latest.checkedOutAt) return { ...latest, status: "on" };
  return seoulDateKey(latest.checkedOutAt) === todayKey ? { ...latest, status: "left" } : null;
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
