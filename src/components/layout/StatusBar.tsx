import type { PersonalNotification } from "@/components/layout/NotificationBell";
import type { ActivityItem } from "@/lib/notifications/activity";
import { Navigation } from "./Navigation";
import { StatusBarControls } from "./StatusBarControls";

/**
 * playground-design/ 9개 파일에서 반복되는 상단 statusbar.
 * 원본 about.html은 우측 영역이 share-chip(외부 공유 링크)만 있고 알림/프로필/
 * 로그아웃이 없었으나, 로그인 사용자에게는 다른 8개 페이지와 동일하게 항상
 * 알림/프로필/로그아웃을 보여주기로 해서 그 예외를 없앴다.
 * 상단바 알림/달력 아이콘 수정: 원본 mockup 값(알림 배지 "3" 등)을 그대로 보여주던
 * 두 아이콘 중 눌러도 아무 반응이 없던 달력 아이콘은 없앴고(대응하는 실제 기능이
 * 없어 장식으로만 남아 있었다), 알림 아이콘은 NotificationBell로 교체해 실제 최근
 * 활동(layout.tsx가 listRecentActivity()로 조회)을 드롭다운으로 보여준다.
 * 알림 고도화: 벨을 둘로 쪼개지 않고 하나로 합쳤다 — 드롭다운 위쪽에 "나에게 온"
 * 개인 알림(댓글/체크인, 읽음·안읽음 있음)을, 그 아래 기존 전체 활동 피드를
 * 그대로 보여준다(사용자 확인 완료). 배지 숫자는 개인 알림 안읽음 개수만 센다.
 * 모바일 재배치: 960px 미만에서 워드마크 텍스트("PLAY_GROUND")는 숨기고 로고
 * 아이콘만 남긴다 — 나머지 우측 아이콘 그룹(녹음/알림/프로필/로그아웃/메뉴)의
 * 반응형 배치는 StatusBarControls로 옮겼다(사용자 확인 완료).
 */
type StatusBarProps = {
  userName?: string;
  avatarUrl?: string | null;
  activity: ActivityItem[];
  personalNotifications: PersonalNotification[];
  userId?: string;
};

export function StatusBar({ userName, avatarUrl, activity, personalNotifications, userId }: StatusBarProps) {
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
          <span className="hidden min-[960px]:inline">PLAY_GROUND</span>
        </div>

        <Navigation />

        <StatusBarControls
          userName={userName}
          avatarUrl={avatarUrl}
          activity={activity}
          personalNotifications={personalNotifications}
          userId={userId}
        />
      </div>
    </div>
  );
}
