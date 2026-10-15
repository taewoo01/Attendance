"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/browser";
import { sendChatMessage } from "@/lib/chat/actions";

export type ChatMessage = {
  id: string;
  userId: string | null;
  avatar: string;
  who: string;
  body: string;
  createdAt: Date;
};

function timeLabel(at: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(at);
}

/**
 * chat_messages INSERT를 Realtime(postgres_changes)으로 구독한다. 상단바 위젯과
 * 별도 창(/chat)이 같은 구독/행 매핑을 쓰도록 여기 한 곳에 둔다. 반환값은 구독 해제 함수.
 */
export function subscribeChatMessages(onMessage: (message: ChatMessage) => void): () => void {
  const supabase = createClient();
  const channel = supabase
    .channel("chat-messages")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
      const row = payload.new as {
        id: string;
        user_id: string | null;
        avatar: string;
        who: string;
        body: string;
        created_at: string;
      };
      onMessage({
        id: row.id,
        userId: row.user_id,
        avatar: row.avatar,
        who: row.who,
        body: row.body,
        createdAt: new Date(row.created_at),
      });
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * 채팅 메시지 목록 + 입력창. 헤더(제목/닫기 등)는 쓰는 쪽이 그린다 — 상단바 위젯의
 * 떠있는 패널과 별도 창(/chat)이 같은 본문을 공유한다. 부모는 `flex flex-col`
 * 컨테이너(높이 고정)여야 목록이 남은 공간을 채우며 스크롤된다.
 */
export function TeamChatPanel({
  messages,
  userId,
  userName,
}: {
  messages: ChatMessage[];
  userId?: string;
  userName?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 마운트 직후, 그리고 새 메시지가 올 때마다 맨 아래로 스크롤한다(DOM 조작만 한다).
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;

    setPending(true);
    setError(null);
    const result = await sendChatMessage(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    form.reset();
  }

  return (
    <>
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="m-0 py-6 text-center text-[12px] text-silk-faint">아직 메시지가 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {messages.map((m) => {
              const mine = userId && m.userId === userId;
              const mentioned = !mine && userName && m.body.includes(userName);
              return (
                <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                  <div className="mb-0.5 flex items-center gap-1.5 font-mono text-[11px] text-silk-faint">
                    {!mine && <span>{m.who}</span>}
                    <span>{timeLabel(m.createdAt)}</span>
                  </div>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-input px-3 py-2 text-[12.5px] leading-[1.45] ${
                      mine
                        ? "bg-teal-dim text-silk"
                        : mentioned
                          ? "border border-amber bg-amber-dim text-silk"
                          : "border border-border bg-bg-raised text-silk-dim"
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="m-0 px-4 pb-1 font-mono text-[11px] text-[#e2543f]">{error}</p>}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-2.5">
        <input
          name="body"
          type="text"
          placeholder="메시지 입력..."
          autoComplete="off"
          disabled={pending}
          className="w-full rounded-input border border-border bg-bg-raised px-3 py-2 font-sans text-[12.5px] text-silk focus:border-teal-dim focus:outline-none disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 cursor-pointer rounded-input border border-teal bg-teal px-3 py-2 text-[12px] font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          전송
        </button>
      </form>
    </>
  );
}
