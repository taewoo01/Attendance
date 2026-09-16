import { NotificationBell } from "@/components/layout/NotificationBell";
import { RecordingControl } from "@/components/layout/RecordingControl";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { UserChip } from "@/components/ui/UserChip";
import type { ActivityItem } from "@/lib/notifications/activity";
import { Navigation } from "./Navigation";

/**
 * playground-design/ 9개 파일에서 반복되는 상단 statusbar.
 * 원본 about.html은 우측 영역이 share-chip(외부 공유 링크)만 있고 알림/프로필/
 * 로그아웃이 없었으나, 로그인 사용자에게는 다른 8개 페이지와 동일하게 항상
 * 알림/프로필/로그아웃을 보여주기로 해서 그 예외를 없앴다.
 * 상단바 알림/달력 아이콘 수정: 원본 mockup 값(알림 배지 "3" 등)을 그대로 보여주던
 * 두 아이콘 중 눌러도 아무 반응이 없던 달력 아이콘은 없앴고(대응하는 실제 기능이
 * 없어 장식으로만 남아 있었다), 알림 아이콘은 NotificationBell로 교체해 실제 최근
 * 활동(layout.tsx가 listRecentActivity()로 조회)을 드롭다운으로 보여준다.
 */
type StatusBarProps = {
  userName?: string;
  avatarUrl?: string | null;
  notifications: ActivityItem[];
};

export function StatusBar({ userName, avatarUrl, notifications }: StatusBarProps) {
  return (
    <div className="border-b border-border bg-[rgba(8,21,18,0.7)]">
      <div className="mx-auto flex max-w-[1220px] items-center justify-between px-7 py-4 font-mono text-xs text-silk-dim">
        <div className="flex items-center gap-[9px] font-semibold tracking-[0.02em] text-silk">
          <svg
            className="h-5 w-[22px] shrink-0"
            viewBox="0 0 48 44"
            role="img"
            aria-label="Playground"
          >
            <defs>
              <linearGradient id="pg-logo-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a3e635" />
                <stop offset="55%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#0e7a3c" />
              </linearGradient>
            </defs>
            <g
              stroke="url(#pg-logo-grad)"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <path
                d="M24 8 L8.5 34 M24 8 L39.5 34 M24 8 L24 25 M24 25 L8.5 34 M24 25 L39.5 34"
                strokeWidth={3.2}
              />
              <g fill="url(#pg-logo-grad)" strokeWidth={3}>
                <path d="M24 2.5 L28.8 5.25 L28.8 10.75 L24 13.5 L19.2 10.75 L19.2 5.25 Z" />
                <path d="M8.5 28.5 L13.3 31.25 L13.3 36.75 L8.5 39.5 L3.7 36.75 L3.7 31.25 Z" />
                <path d="M39.5 28.5 L44.3 31.25 L44.3 36.75 L39.5 39.5 L34.7 36.75 L34.7 31.25 Z" />
              </g>
            </g>
          </svg>
          PLAY_GROUND
        </div>

        <Navigation />

        <div className="flex items-center gap-4">
          <RecordingControl />
          <NotificationBell items={notifications} />
          <UserChip name={userName} initial={userName?.charAt(0)} avatarUrl={avatarUrl} />
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
