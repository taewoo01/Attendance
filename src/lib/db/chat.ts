import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { chatMessages } from "@/db/schema";

/**
 * chat Repository. 이 모듈은 서버 전용(src/lib/db/client.ts 의존)이다.
 * 상단바 TeamChatWidget이 최초 마운트 시 한 번만 호출한다 — 그 이후 새 메시지는
 * Realtime(postgres_changes INSERT)으로만 받으므로, 여기서는 과거 메시지가
 * 무한정 쌓이는 걸 막기 위해 최근 N개만 가져온다(페이지네이션은 두지 않는다 —
 * 패널 자체가 작은 창이라 "더 오래된 메시지 불러오기"는 이번 범위 밖).
 */
export async function listRecentChatMessages(limit = 50) {
  const rows = await db
    .select({
      id: chatMessages.id,
      userId: chatMessages.userId,
      avatar: chatMessages.avatar,
      who: chatMessages.who,
      body: chatMessages.body,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);

  // DESC로 가져온 뒤 뒤집어서 오래된 → 최신 순으로 반환한다 — 화면에 그대로
  // 위에서 아래로 렌더링하면 자연스러운 채팅 순서가 된다.
  return rows.reverse();
}
