"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/browser";

/**
 * QR 체크인 모달이 떠 있는 동안, 본인 명의로 attendance INSERT가 생기면(폰으로 QR을
 * 스캔해 체크인 완료) 콜백을 호출한다. AttendanceRealtimeRefresh(팀 전체 INSERT에
 * 반응)와 달리 user_id로 필터링해 다른 팀원이 체크인해도 반응하지 않는다 — 이 모달은
 * "내" QR을 보여주는 용도라 내 체크인에만 자동으로 닫혀야 한다.
 * onCheckedIn을 ref로 감싸 최신 콜백을 항상 쓰면서도 userId가 바뀔 때만 재구독한다.
 */
export function useSelfCheckinRealtime(userId: string | undefined, onCheckedIn: () => void) {
  const callbackRef = useRef(onCheckedIn);
  useEffect(() => {
    callbackRef.current = onCheckedIn;
  }, [onCheckedIn]);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`self-checkin-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "attendance", filter: `user_id=eq.${userId}` },
        () => callbackRef.current(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
}
