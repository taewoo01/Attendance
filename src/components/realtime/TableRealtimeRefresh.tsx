"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

/**
 * AttendanceRealtimeRefresh(src/components/attendance/AttendanceRealtimeRefresh.tsx)를
 * 여러 테이블에 재사용할 수 있게 일반화한 버전. 지정한 테이블(들)에 INSERT가 생기면
 * router.refresh()로 현재 페이지의 Server Component 데이터를 다시 불러온다 — 파일/
 * 아이디어/실적/데일리/회의록처럼 "누가 등록하면 보고 있는 다른 팀원 화면에도 바로
 * 반영돼야" 하는 목록 페이지가 공통으로 쓴다. 각 테이블의 기존 RLS SELECT 정책이
 * 구독에도 그대로 적용되어, 그 정책이 허용하는 로그인 사용자만 이벤트를 받는다.
 * `tables`는 매 렌더마다 새 배열이 넘어와도(부모가 인라인 배열 리터럴을 쓰는 게
 * 자연스럽다) 불필요하게 재구독하지 않도록, 배열 자체가 아니라 join한 문자열을
 * effect 의존성으로 둔다. 화면에는 아무것도 그리지 않는다.
 */
export function TableRealtimeRefresh({ channel, tables }: { channel: string; tables: string[] }) {
  const router = useRouter();
  const tablesKey = tables.join(",");

  useEffect(() => {
    const supabase = createClient();
    let subscription = supabase.channel(channel);
    for (const table of tablesKey.split(",")) {
      subscription = subscription.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table },
        () => {
          router.refresh();
        },
      );
    }
    subscription.subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [channel, tablesKey, router]);

  return null;
}
