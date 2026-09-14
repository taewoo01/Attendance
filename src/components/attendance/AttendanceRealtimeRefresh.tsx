"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

/**
 * attendance 테이블에 새 체크인(INSERT)이 생기면 즉시 router.refresh()로 이 페이지의
 * Server Component 데이터(출석 카운트/현황)를 다시 불러온다. 폴링 대신 Supabase
 * Realtime(postgres_changes)으로 이벤트를 받는다 — attendance_select_authenticated
 * RLS 정책(팀 전체 SELECT 허용, 0011_attendance_rls.sql)이 구독에도 그대로 적용되어
 * 로그인한 팀원만 이벤트를 받는다. 화면에는 아무것도 그리지 않는다.
 */
export function AttendanceRealtimeRefresh() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("attendance-checkins")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "attendance" }, () => {
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
