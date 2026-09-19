import { db } from "@/lib/db/client";
import { notifications } from "@/db/schema";
import { listProfiles } from "@/lib/db/profiles";

export type NotificationType = "idea_comment" | "attendance_checkin";

type NotificationInput = {
  type: NotificationType;
  actorUserId: string;
  actorName: string;
  message: string;
  linkHref: string;
};

/** 미리보기 문구가 벨/토스트에서 한 줄로 잘리도록 댓글 본문 등 자유 텍스트를 자른다. */
export function truncateForPreview(text: string, maxLength = 60): string {
  const trimmed = text.trim();
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength)}…` : trimmed;
}

/** 특정 한 명(글 작성자 등)에게 알림 하나를 보낸다. */
export async function notifyUser(userId: string, input: NotificationInput) {
  await db.insert(notifications).values({ userId, ...input });
}

/**
 * 체크인처럼 "본인 제외 팀 전체"에게 같은 알림을 보낼 때 쓴다. profiles를
 * 매번 새로 조회한다(요청마다 다른 팀원이 나가있을 수 있어 캐시하지 않음 —
 * 팀 규모가 작아 매 체크인마다 조회해도 부담이 없다).
 */
export async function notifyTeamExcept(excludeUserId: string, input: NotificationInput) {
  const roster = await listProfiles();
  const recipientIds = roster.map((p) => p.userId).filter((userId) => userId !== excludeUserId);
  if (recipientIds.length === 0) return;

  await db.insert(notifications).values(recipientIds.map((userId) => ({ userId, ...input })));
}
