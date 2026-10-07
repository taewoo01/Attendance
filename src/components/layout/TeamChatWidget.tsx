"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { IconButton } from "@/components/ui/IconButton";
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

const OPEN_KEY = "teamChat:open";
const LAST_READ_KEY = "teamChat:lastReadAt";

function timeLabel(at: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(at);
}

function readLastReadAt(): number {
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

/** 카카오톡 미리보기처럼: 패널을 안 열어본 동안 쌓인(본인이 보내지 않은) 메시지 수. */
function countUnread(messages: ChatMessage[], userId: string | undefined, lastReadAt: number): number {
  return messages.filter((m) => m.userId !== userId && m.createdAt.getTime() > lastReadAt).length;
}

/**
 * 멤버 이름이 본문에 불리면(언급되면) 짧은 알림음을 울린다 — 커스텀 사운드 파일을
 * 새로 추가하지 않고(최소 dependency 원칙) Web Audio API로 짧은 비프를 그 자리에서
 * 만든다. 브라우저의 자동재생 정책상 사용자가 이 탭에서 한 번도 상호작용하지
 * 않았으면 소리가 안 날 수 있다 — 조용히 무시한다(알림 자체는 배지/토스트로도 간다).
 */
function playMentionSound() {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => ctx.close();
  } catch {
    // AudioContext 생성 실패(권한/정책 등) — 소리만 조용히 건너뛴다.
  }
}

/**
 * 상단바 제일 오른쪽의 팀 채팅 아이콘 + 화면 우측 하단에 뜨는 패널.
 * NotificationBell과 달리 바깥을 클릭해도 닫히지 않는다 — 오직 패널의 "닫기"(×)
 * 버튼으로만 닫힌다(사용자 확인 완료). 열림 상태는 localStorage에 저장해서,
 * 페이지를 이동하거나(이 컴포넌트는 (main)/layout.tsx에 있어 네비게이션 중
 * 리마운트되지 않는다) 새로고침해도 유지된다.
 * DM/채널 구분 없이 팀 전체가 보는 단일 채팅방이다. 초기 메시지는 서버가 최근
 * 50개만 내려주고(listRecentChatMessages), 그 이후는 Realtime(postgres_changes
 * INSERT)으로만 받는다 — 보낸 사람 본인도 같은 구독으로 자기 메시지를 받으므로
 * 낙관적 업데이트를 따로 하지 않는다(중복 추가 위험을 피함).
 * 배지 숫자(카카오톡 미리보기 스타일): "마지막으로 패널을 연 시각"을 localStorage에
 * 저장해두고, 그 이후 온 메시지(본인이 보낸 것 제외) 개수를 배지로 보여준다 —
 * 새로고침해도 사라지지 않는다(기존엔 세션 안에서만 세는 임시 카운트였다).
 * 알림 연동: 보낸 사람의 sendChatMessage Server Action이 이미 notifyTeamExcept로
 * 벨/토스트/Web Push까지 보낸다 — 이 컴포넌트는 그 알림을 눌렀을 때(linkHref
 * "#chat") 패널을 열어주는 "team-chat:open" 커스텀 이벤트만 듣는다.
 * 멘션 사운드: 본문에 내 이름이 그대로 들어있으면(= 이름이 불리면) 짧은 비프를
 * 울린다. 패널이 열려 있어도, 닫혀 있어도 울린다 — "이름이 불렸다"는 알림 자체가
 * 중요해서 열람 여부와 무관하게 다룬다.
 */
export function TeamChatWidget({
  initialMessages,
  userId,
  userName,
}: {
  initialMessages: ChatMessage[];
  userId?: string;
  userName?: string;
}) {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(OPEN_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [messages, setMessages] = useState(initialMessages);
  const [unread, setUnread] = useState(() => countUnread(initialMessages, userId, readLastReadAt()));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function changeOpen(next: boolean) {
    setOpen(next);
    try {
      if (next) {
        localStorage.setItem(LAST_READ_KEY, String(Date.now()));
        setUnread(0);
      }
      localStorage.setItem(OPEN_KEY, next ? "1" : "0");
    } catch {
      // localStorage 사용 불가(프라이빗 모드 등) — 열림 상태만 이번 세션에서 유지.
      if (next) setUnread(0);
    }
  }

  // Realtime 구독/이벤트 리스너는 마운트 시 한 번만 설정돼(deps: []) 그 안의
  // `open`은 그 시점 값으로 고정된다 — open이 바뀔 때마다 ref에 최신값을 담아
  // 대신 읽는다.
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // 알림 벨에서 "#chat" 알림을 클릭하면(NotificationBell.goTo) 이 이벤트가 온다.
  useEffect(() => {
    function handleOpenEvent() {
      changeOpen(true);
    }
    window.addEventListener("team-chat:open", handleOpenEvent);
    return () => window.removeEventListener("team-chat:open", handleOpenEvent);
  }, []);

  useEffect(() => {
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
        const isMine = row.user_id === userId;
        setMessages((prev) => [
          ...prev,
          { id: row.id, userId: row.user_id, avatar: row.avatar, who: row.who, body: row.body, createdAt: new Date(row.created_at) },
        ]);
        // 패널이 닫혀 있을 때 온, 본인이 보내지 않은 메시지만 배지 카운트를 올린다.
        // Realtime 콜백은 "외부 시스템(구독)에서 온 이벤트에 반응해 setState를
        // 호출"하는 경우라 일반적인 "effect 안 setState 금지" 규칙의 대상이 아니다.
        if (!openRef.current && !isMine) setUnread((n) => n + 1);
        if (!isMine && userName && row.body.includes(userName)) playMentionSound();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userName]);

  // 패널이 열려 있는 동안 새 메시지가 오거나, 패널을 막 열었을 때 맨 아래로
  // 스크롤한다(DOM 조작만 하고 setState는 없다).
  useEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [open, messages]);

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
      <IconButton
        badge={unread > 0 ? (unread > 9 ? "9+" : unread) : undefined}
        onClick={() => changeOpen(!open)}
        aria-label="팀 채팅"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 20l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      </IconButton>

      {open && (
        <div className="fixed bottom-5 right-5 z-[90] flex h-[440px] w-[320px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-card border border-border bg-bg-panel shadow-[0_20px_50px_-15px_rgba(0,0,0,0.65)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="m-0 text-[12.5px] font-semibold text-silk">팀 채팅</p>
            <button
              type="button"
              onClick={() => changeOpen(false)}
              aria-label="닫기"
              className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-sm text-silk-faint hover:text-silk"
            >
              ✕
            </button>
          </div>

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
                      <div className="mb-0.5 flex items-center gap-1.5 font-mono text-[10px] text-silk-faint">
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

          {error && <p className="m-0 px-4 pb-1 font-mono text-[10.5px] text-[#e2543f]">{error}</p>}

          <form ref={formRef} onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-2.5">
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
        </div>
      )}
    </>
  );
}
