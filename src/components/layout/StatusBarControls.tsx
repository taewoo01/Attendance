"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { NotificationBell, type PersonalNotification } from "@/components/layout/NotificationBell";
import { RecordingControl } from "@/components/layout/RecordingControl";
import { MobileNavToggle } from "@/components/layout/MobileNavToggle";
import type { ChatMessage } from "@/components/layout/TeamChatWidget";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { UserChip } from "@/components/ui/UserChip";
import { formatElapsed, useRecordingControl } from "@/lib/meetings/useRecordingControl";
import type { ActivityItem } from "@/lib/notifications/activity";

type StatusBarControlsProps = {
  userName?: string;
  avatarUrl?: string | null;
  activity: ActivityItem[];
  personalNotifications: PersonalNotification[];
  chatMessages: ChatMessage[];
  userId?: string;
};

/**
 * TeamChatWidget은 열림 상태를 localStorage에서 읽는데, 서버 렌더링 시점엔
 * localStorage가 없어 항상 "닫힘"으로 그려진다 — 클라이언트가 실제로 "열림"을
 * 읽어오면 서버가 보낸 HTML과 달라져 React hydration이 깨지고(콘솔 에러), 그
 * 복구 과정에서 Realtime 구독이 불안정해져 두 번째 메시지부터 새로고침해야
 * 보이는 문제가 있었다(사용자 확인). 이 위젯은 서버에서 그릴 이유가 없는
 * 순수 클라이언트 전용 기능이라 `ssr: false`로 완전히 클라이언트에서만
 * 마운트해서 애초에 hydration 비교 자체가 일어나지 않게 한다.
 */
const TeamChatWidget = dynamic(() => import("@/components/layout/TeamChatWidget").then((m) => m.TeamChatWidget), {
  ssr: false,
});

/**
 * StatusBar 우측 전체(녹음/알림/프로필/로그아웃/모바일 메뉴)를 묶는 client 경계.
 * 1200px 미만에서 녹음 칩·유저칩·로그아웃까지 다 보이면 한 줄에 너무 많아 보여서
 * (사용자 확인 완료) 데스크톱에만 그대로 두고, 모바일엔 알림벨 + 햄버거 버튼만 남긴 뒤
 * 나머지(녹음/프로필/로그아웃)는 햄버거 드로워 안으로 옮겼다.
 * 녹음 상태(useRecordingControl)는 여기서 딱 한 번만 구독한다 — 데스크톱 칩과
 * 모바일 배지·드로워 칩이 각자 따로 구독하면 MediaRecorder/마이크 스트림이
 * 두 벌 잡혀서 동시에 두 녹음이 생기는 사고가 난다. 녹음 중엔 모바일 상단바에
 * 작은 배지만 보이고, 탭하면 드로워가 열려 원래 칩(정지 버튼 포함)이 나온다.
 */
export function StatusBarControls({
  userName,
  avatarUrl,
  activity,
  personalNotifications,
  chatMessages,
  userId,
}: StatusBarControlsProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // 다른 페이지로 이동하면 열려 있던 드로워를 자동으로 닫는다 — effect 대신 렌더
  // 중에 이전 pathname과 비교해 state를 갱신한다(react-hooks/set-state-in-effect).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  const recording = useRecordingControl();

  return (
    // 사이드바(1200px 이상)에서는 이 컨테이너를 contents로 풀어 자식들이 사이드바 세로 열의
    // 직접 항목이 되게 하고, order로 순서를 정한다(로고 1 → 알림/채팅 2 → 메뉴 3 → 녹음 4 →
    // 프로필 5). 메뉴(Navigation)는 order-3이고 남는 공간을 차지해 아래 둘을 바닥으로 민다.
    <div className="flex items-center gap-4 min-[1200px]:contents">
      <div className="hidden min-[1200px]:order-4 min-[1200px]:mt-3 min-[1200px]:flex min-[1200px]:px-3">
        <RecordingControl {...recording} />
      </div>

      {/* 로그아웃은 알림/채팅 버튼과 떨어뜨려 프로필 줄 끝에 둔다 — 붙어 있으면 오클릭하기 쉽다. */}
      <div className="hidden items-center justify-between gap-2 min-[1200px]:order-5 min-[1200px]:mt-3 min-[1200px]:flex min-[1200px]:px-3">
        <div className="min-w-0 flex-1 truncate">
          <UserChip name={userName} initial={userName?.charAt(0)} avatarUrl={avatarUrl} />
        </div>
        <LogoutButton />
      </div>

      <div className="flex items-center gap-4 min-[1200px]:order-2 min-[1200px]:mb-4 min-[1200px]:flex-col min-[1200px]:items-stretch min-[1200px]:gap-1.5">
        <NotificationBell activity={activity} initialPersonalNotifications={personalNotifications} userId={userId} />
        <TeamChatWidget initialMessages={chatMessages} userId={userId} userName={userName} />
      </div>

      {recording.recording && (
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex cursor-pointer items-center gap-1.5 rounded-chip border border-[#e2543f] bg-[rgba(226,84,63,0.16)] px-2.5 py-[6px] font-mono text-[11px] font-semibold text-[#e2543f] min-[1200px]:hidden"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e2543f]" />
          {formatElapsed(recording.elapsedSeconds)}
        </button>
      )}

      <MobileNavToggle open={menuOpen} onOpenChange={setMenuOpen}>
        <RecordingControl {...recording} />
        <div className="flex items-center justify-between rounded-button px-3 py-2">
          <UserChip name={userName} initial={userName?.charAt(0)} avatarUrl={avatarUrl} />
        </div>
        <div className="flex items-center justify-between rounded-button px-3 py-2.5 text-sm text-silk-dim">
          로그아웃
          <LogoutButton />
        </div>
      </MobileNavToggle>
    </div>
  );
}
