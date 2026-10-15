import type { Metadata } from "next";
import { TeamChatWindow } from "@/components/layout/TeamChatWindow";
import { getCurrentUser } from "@/lib/auth/get-user";
import { listRecentChatMessages } from "@/lib/db/chat";
import { getProfileByUserId } from "@/lib/db/profiles";

// 매 요청마다 최신 메시지를 조회한다.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "팀 채팅 · PLAY GROUND" };

/**
 * 팀 채팅 별도 창. `(main)` route group 밖에 둬서 사이드바/Footer 없이 채팅만
 * 보여준다 — 상단바 위젯의 "새 창으로 열기"가 이 경로를 팝업으로 연다. 로그인 가드는
 * src/proxy.ts가 담당한다(비로그인이면 /login으로 이동).
 */
export default async function ChatPage() {
  const user = await getCurrentUser();
  const [profile, messages] = await Promise.all([
    user ? getProfileByUserId(user.id) : null,
    listRecentChatMessages(),
  ]);

  return <TeamChatWindow initialMessages={messages} userId={user?.id} userName={profile?.name || undefined} />;
}
