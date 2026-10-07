"use server";

import { db } from "@/lib/db/client";
import { chatMessages } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getProfileByUserId } from "@/lib/db/profiles";
import { notifyTeamExcept, truncateForPreview } from "@/lib/notifications/create";

export type SendChatMessageState = { error?: string; success?: boolean };

/**
 * 상단바 TeamChatWidget이 호출하는 Server Action. `who`/`avatar`는 ideas.createIdea와
 * 동일한 이유로 폼 입력이 아니라 로그인 사용자의 profiles.name에서 서버가 채운다
 * (다른 사람 명의로 메시지를 위조해 보낼 수 없게). chat_messages는 RLS가 INSERT를
 * 전부 막아뒀으므로(drizzle/0055) 이 Server Action의 DATABASE_URL 연결(RLS 우회)로만
 * 쓸 수 있다. insert 후 revalidatePath를 호출하지 않는다 — 패널 안 실시간 갱신은
 * Realtime INSERT 구독(TeamChatWidget)이 전담하고, 이 액션은 저장과 알림 발송만
 * 담당한다.
 * attendance_checkin/file_upload와 동일한 notifyTeamExcept 패턴으로 본인 제외
 * 팀 전체에게 알림(벨/토스트/Web Push)을 보낸다 — 채팅 패널을 안 보고 있어도
 * 다른 알림처럼 놓치지 않게. linkHref는 실제 라우트가 아니라 "#chat" 센티널
 * 값이다 — 채팅은 페이지가 아니라 상단바의 떠있는 패널이라, NotificationBell이
 * 이 값을 보면 라우팅 대신 TeamChatWidget을 열라는 커스텀 이벤트(team-chat:open)를
 * window에 쏜다.
 */
export async function sendChatMessage(formData: FormData): Promise<SendChatMessageState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { error: "메시지를 입력해 주세요." };
  }

  const profile = await getProfileByUserId(user.id);
  const who = profile?.name?.trim() || "팀원";

  await db.insert(chatMessages).values({ userId: user.id, avatar: who.charAt(0), who, body });

  await notifyTeamExcept(user.id, {
    type: "chat_message",
    actorUserId: user.id,
    actorName: who,
    message: `${who}: ${truncateForPreview(body)}`,
    linkHref: "#chat",
  });

  return { success: true };
}
