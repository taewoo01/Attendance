"use client";

import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/ui/IconButton";
import type { ActivityItem } from "@/lib/notifications/activity";

const DAY_MS = 24 * 60 * 60 * 1000;

function relativeLabel(at: Date, now: Date): string {
  const diffMin = Math.floor((now.getTime() - at.getTime()) / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${Math.floor(diffHour / 24)}일 전`;
}

/**
 * StatusBar의 알림 아이콘. 원본에서는 배지 "3"이 실제 데이터 없는 목업 값이었다
 * (StatusBar.tsx 기존 주석 "실제 알림/사용자 데이터는 연결하지 않고 원본 mockup
 * 값을 그대로 표시한다" 참고) — layout.tsx가 listRecentActivity()로 조회한 실제
 * 활동(체크인/실적·회의록·데일리·파일 등록)을 눌렀을 때 드롭다운으로 보여주고,
 * 배지 숫자는 최근 24시간 안의 항목 수로 계산한다(읽음/안읽음 상태는 저장하지
 * 않는다 — 이번 범위 밖).
 */
export function NotificationBell({ items }: { items: ActivityItem[] }) {
  const [open, setOpen] = useState(false);
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

  const now = new Date();
  const recentCount = items.filter((item) => now.getTime() - item.at.getTime() < DAY_MS).length;

  return (
    <div ref={containerRef} className="relative">
      <IconButton badge={recentCount > 0 ? recentCount : undefined} onClick={() => setOpen((v) => !v)} aria-label="알림">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8}>
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 01-3.4 0" />
        </svg>
      </IconButton>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[300px] overflow-hidden rounded-card border border-border bg-bg-panel shadow-[0_20px_40px_-18px_rgba(0,0,0,0.6)]">
          <div className="border-b border-border px-4 py-3 text-[12.5px] font-semibold text-silk">알림</div>
          <div className="max-h-[320px] overflow-y-auto">
            {items.length === 0 ? (
              <p className="m-0 px-4 py-5 text-center text-[12px] text-silk-faint">아직 알림이 없습니다.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="border-b border-border px-4 py-2.5 last:border-b-0">
                  <p className="m-0 text-xs leading-[1.4] text-silk">{item.message}</p>
                  <p className="m-0 mt-1 font-mono text-[10px] text-silk-faint">{relativeLabel(item.at, now)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
