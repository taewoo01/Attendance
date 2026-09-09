import { db } from "@/lib/db/client";
import { meetingNotes } from "@/db/schema";

/**
 * meeting_notes Repository. 이 모듈은 서버 전용(src/lib/db/client.ts 의존)이다.
 * TASK-023: Meetings 페이지(/meetings)에서만 사용한다.
 */
export async function listMeetings() {
  return db.select().from(meetingNotes);
}
