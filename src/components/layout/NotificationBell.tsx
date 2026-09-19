"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconButton } from "@/components/ui/IconButton";
import { createClient } from "@/lib/supabase/browser";
import { markAllNotificationsRead } from "@/lib/notifications/actions";
import type { ActivityItem } from "@/lib/notifications/activity";

const TOAST_TTL_MS = 6000;

export type PersonalNotification = {
  id: string;
  type: string;
  message: string;
  linkHref: string;
  createdAt: Date;
  readAt: Date | null;
};

type ToastItem = { key: string; message: string; linkHref: string };

function relativeLabel(at: Date, now: Date): string {
  const diffMin = Math.floor((now.getTime() - at.getTime()) / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${Math.floor(diffHour / 24)}일 전`;
}

/**
 * StatusBar의 알림 아이콘. 알림 고도화: 원래는 listRecentActivity()가 조회한
 * 전체 팀 활동만 보여주는 드롭다운이었다 — 여기에 "나에게 온" 개인 알림(아이디어
 * 댓글, 팀원 체크인)을 얹었다(사용자 확인 완료: 벨 하나로 합치기).
 * 개인 알림은 notifications 테이블(Supabase Realtime, attendance와 동일 패턴)을
 * user_id로 필터링해 구독해서, 새로 생기는 즉시 (1) 화면 우상단 토스트로 미리보기를
 * 띄우고 (2) 드롭다운 목록 맨 위에 얹는다. 배지 숫자는 개인 알림 안읽음
 * (readAt === null) 개수만 센다 — 전체 활동 피드는 원래부터 읽음 상태가 없다.
 * 드롭다운을 열면(= 알림을 확인한 시점) 그 시점의 안읽음 알림을 모두 읽음
 * 처리한다(개별 항목 클릭이 아니라 "열람" 자체를 읽음 기준으로 삼는 흔한 패턴).
 */
export function NotificationBell({
  activity,
  initialPersonalNotifications,
  userId,
}: {
  activity: ActivityItem[];
  initialPersonalNotifications: PersonalNotification[];
  userId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [personal, setPersonal] = useState(initialPersonalNotifications);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as {
            id: string;
            type: string;
            message: string;
            link_href: string;
            created_at: string;
          };
          const next: PersonalNotification = {
            id: row.id,
            type: row.type,
            message: row.message,
            linkHref: row.link_href,
            createdAt: new Date(row.created_at),
            readAt: null,
          };
          setPersonal((prev) => [next, ...prev]);

          const toastKey = row.id;
          setToasts((prev) => [...prev, { key: toastKey, message: row.message, linkHref: row.link_href }]);
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.key !== toastKey));
          }, TOAST_TTL_MS);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = personal.filter((n) => !n.readAt).length;

  function handleToggle() {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) {
      const readAt = new Date();
      setPersonal((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt })));
      markAllNotificationsRead();
    }
  }

  function goTo(linkHref: string) {
    setOpen(false);
    router.push(linkHref);
  }

  function dismissToast(key: string) {
    setToasts((prev) => prev.filter((t) => t.key !== key));
  }

  const now = new Date();

  return (
    <>
      <div ref={containerRef} className="relative">
        <IconButton badge={unreadCount > 0 ? unreadCount : undefined} onClick={handleToggle} aria-label="알림">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 01-3.4 0" />
          </svg>
        </IconButton>

        {open && (
          <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[320px] overflow-hidden rounded-card border border-border bg-bg-panel shadow-[0_20px_40px_-18px_rgba(0,0,0,0.6)]">
            <div className="border-b border-border px-4 py-3 text-[12.5px] font-semibold text-silk">알림</div>
            <div className="max-h-[360px] overflow-y-auto">
              {personal.length === 0 && activity.length === 0 ? (
                <p className="m-0 px-4 py-5 text-center text-[12px] text-silk-faint">아직 알림이 없습니다.</p>
              ) : (
                <>
                  {personal.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goTo(item.linkHref)}
                      className="flex w-full items-start gap-2 border-b border-border px-4 py-2.5 text-left last:border-b-0 hover:bg-white/[0.03]"
                    >
                      {!item.readAt && <span className="mt-1.5 h-[6px] w-[6px] shrink-0 rounded-full bg-teal" />}
                      <span className={item.readAt ? "flex-1" : "flex-1 -ml-2"}>
                        <p className="m-0 text-xs leading-[1.4] text-silk">{item.message}</p>
                        <p className="m-0 mt-1 font-mono text-[10px] text-silk-faint">
                          {relativeLabel(item.createdAt, now)}
                        </p>
                      </span>
                    </button>
                  ))}
                  {activity.map((item) => (
                    <div key={item.id} className="border-b border-border px-4 py-2.5 last:border-b-0">
                      <p className="m-0 text-xs leading-[1.4] text-silk">{item.message}</p>
                      <p className="m-0 mt-1 font-mono text-[10px] text-silk-faint">{relativeLabel(item.at, now)}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {toasts.length > 0 && (
        <div className="fixed right-5 top-5 z-[100] flex w-[300px] flex-col gap-2">
          {toasts.map((toast) => (
            <button
              key={toast.key}
              type="button"
              onClick={() => {
                dismissToast(toast.key);
                goTo(toast.linkHref);
              }}
              className="rounded-card border border-border bg-bg-panel px-4 py-3 text-left text-xs leading-[1.4] text-silk shadow-[0_20px_40px_-18px_rgba(0,0,0,0.6)] hover:bg-white/[0.03]"
            >
              {toast.message}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
