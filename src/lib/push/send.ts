import webpush from "web-push";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pushSubscriptions } from "@/db/schema";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

let vapidConfigured = false;

/** 최초 호출 시 1회만 설정한다. 키가 비어 있으면(로컬 .env.local 미설정 등) false를 돌려주고 조용히 건너뛴다. */
function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  vapidConfigured = true;
  return true;
}

export type PushPayload = { title: string; body: string; url: string };

/**
 * notifyUser/notifyTeamExcept이 notifications 테이블에 쓴 직후 호출하는 보조 채널.
 * in-app 알림(벨/토스트)이 항상 1순위이고 이건 "구독해둔 기기에 추가로" 보내는
 * 것뿐이라, 실패해도 호출부를 절대 막지 않는다(throw하지 않는다) — VAPID 키가
 * 없거나, 구독이 하나도 없거나, 전송 중 일부가 실패해도 알림 생성 자체는 그대로
 * 성공해야 한다.
 * 만료되거나 구독 해제된 endpoint는 push 서비스가 404/410으로 알려준다 — 그 즉시
 * DB에서 지워서(PushSubscribeToggle이 모르는 채로) 다음부터는 재시도하지 않는다.
 */
export async function sendPushToUsers(userIds: string[], payload: PushPayload): Promise<void> {
  if (userIds.length === 0 || !ensureVapidConfigured()) return;

  const subs = await db.select().from(pushSubscriptions).where(inArray(pushSubscriptions.userId, userIds));
  if (subs.length === 0) return;

  const body = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.authKey } }, body);
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
        } else {
          console.error("[sendPushToUsers] push 전송 실패", sub.id, error);
        }
      }
    }),
  );
}
