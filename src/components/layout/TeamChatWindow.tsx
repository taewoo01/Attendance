"use client";

import { useEffect, useState } from "react";
import { TeamChatPanel, subscribeChatMessages, type ChatMessage } from "@/components/layout/TeamChatPanel";

/**
 * 별도 창(/chat) 전용 팀 채팅. (main) 레이아웃 밖이라 상단바 위젯이 없으므로 같은
 * 본문(TeamChatPanel)과 Realtime 구독(subscribeChatMessages)을 그대로 써서 창 전체를
 * 채팅으로 채운다. 배지/멘션 사운드는 위젯의 몫이라 여기엔 두지 않는다.
 */
export function TeamChatWindow({
  initialMessages,
  userId,
  userName,
}: {
  initialMessages: ChatMessage[];
  userId?: string;
  userName?: string;
}) {
  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    return subscribeChatMessages((message) => setMessages((prev) => [...prev, message]));
  }, []);

  return (
    <div className="flex h-dvh flex-col bg-bg-panel">
      <div className="border-b border-border px-4 py-3">
        <p className="m-0 text-[12.5px] font-semibold text-silk">팀 채팅</p>
      </div>
      <TeamChatPanel messages={messages} userId={userId} userName={userName} />
    </div>
  );
}
