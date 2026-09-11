import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetingNotes } from "@/db/schema";

/**
 * meeting_notes Repository. 이 모듈은 서버 전용(src/lib/db/client.ts 의존)이다.
 * TASK-023: Meetings 페이지(/meetings)에서만 사용한다.
 * ORDER BY 없이 그냥 SELECT하면 Postgres가 행 순서를 전혀 보장하지 않는다 —
 * 특히 UPDATE(액션 아이템 체크 토글)마다 MVCC로 물리적 위치가 바뀌어서 매번
 * 카드 순서가 뒤섞였다. createdAt은 등록 시각에 고정되고 수정으로는 안 바뀌므로
 * 이걸로 정렬해야 "최신 등록순" + "체크해도 순서 안 흔들림"이 둘 다 보장된다.
 */
export async function listMeetings() {
  return db.select().from(meetingNotes).orderBy(desc(meetingNotes.createdAt));
}
