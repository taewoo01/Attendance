import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

/**
 * 서버 전용 Drizzle client. `DATABASE_URL`(Supabase Postgres 연결 문자열)을 사용하며
 * 브라우저에서 import되면 안 된다 — 방어적으로 브라우저 실행 시 즉시 에러를 던진다.
 * 모듈 스코프에서 커넥션을 한 번만 만들어 재사용한다(요청마다 새로 만들지 않는다).
 */
if (typeof window !== "undefined") {
  throw new Error("src/lib/db/client.ts는 서버 전용입니다. 브라우저에서 import할 수 없습니다.");
}

// max: 5 — 원래 1이었는데, 홈 화면(src/app/(main)/page.tsx)이 Promise.all로
// listProfiles/listAttendance/listAchievements/listIdeas를 동시에 날리는 걸
// max:1(커넥션 1개) 위에서 로컬로 재현해보니 achievements/ideas 두 쿼리가
// 응답을 영영 못 받고 멈추는 실제 교착 상태였다(pgbouncer transaction pooler +
// 커넥션 1개를 여러 동시 쿼리가 큐잉하는 조합의 문제) — Vercel 프로덕션에서
// 홈 화면이 "흰 화면/무한 로딩"으로 300초 타임아웃까지 걸리던 원인이 이거였다.
// max를 이 페이지의 동시 쿼리 수(4개)를 커버하도록 5로 올리니 매번 0.3초
// 안에 전부 끝난다(5회 반복 재현으로 확인). Vercel 인스턴스 수 × 5가 Supabase
// Transaction Pooler 한도를 넘지 않는지는 트래픽이 늘면 다시 점검해야 한다.
// connect_timeout/idle_timeout은 별개로, 커넥션 하나가 멈췄을 때(네트워크
// 블립, pooler 재시작 등) postgres.js가 이를 감지 못 하고 무한 대기하는 걸
// 막기 위해 추가한 안전장치다.
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  max: 5,
  connect_timeout: 10,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

export const db = drizzle(client, { schema });
