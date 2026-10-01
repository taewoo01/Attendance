"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import { pushSubscriptions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/get-user";

export type PushSubscriptionInput = { endpoint: string; p256dh: string; authKey: string };
export type PushActionState = { error?: string };

/**
 * PushSubscribeToggle이 "켜기"를 누르면 호출한다. 같은 endpoint로 다시 구독하면
 * (브라우저가 만료된 구독을 스스로 재발급하는 경우 포함) upsert로 덮어쓴다 —
 * endpoint가 unique라 중복 행이 쌓이지 않는다. userAgent는 클라이언트 값을
 * 그대로 믿지 않고(어차피 보안에 쓰이지 않는 "이 기기가 뭔지 보여주는" 라벨일
 * 뿐이지만) 요청 헤더에서 읽는다 — getRequestOrigin과 동일한 원칙.
 */
export async function savePushSubscription(input: PushSubscriptionInput): Promise<PushActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") ?? "";

  await db
    .insert(pushSubscriptions)
    .values({ userId: user.id, endpoint: input.endpoint, p256dh: input.p256dh, authKey: input.authKey, userAgent })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { userId: user.id, p256dh: input.p256dh, authKey: input.authKey, userAgent },
    });

  return {};
}

/**
 * PushSubscribeToggle이 "끄기"를 누르면 호출한다. WHERE userId = 본인으로
 * 소유권을 확인한다(deleteFile/deleteFolder와 동일한 원칙) — 남의 구독
 * endpoint를 알아내도 지울 수 없다.
 */
export async function deletePushSubscription(endpoint: string): Promise<PushActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.endpoint, endpoint), eq(pushSubscriptions.userId, user.id)));

  return {};
}
