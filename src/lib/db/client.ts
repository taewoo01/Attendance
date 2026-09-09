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

// max: 1 — Vercel의 서버리스 함수는 요청마다 별도 인스턴스로 스케일될 수 있어,
// 인스턴스당 기본 풀 크기(10)를 그대로 두면 동시 요청이 늘어날 때 Supabase
// Transaction Pooler의 커넥션 한도를 인스턴스 수 × 10으로 쉽게 초과할 수 있다.
// 인스턴스 1개당 요청 처리는 사실상 순차적이라 1로 충분하다.
// connect_timeout/idle_timeout 없이는 커넥션 하나가 멈췄을 때(네트워크 블립,
// pooler 재시작 등) postgres.js가 이를 감지하지 못하고 그 뒤로 들어오는 모든
// 쿼리가 죽은 커넥션 뒤에서 무한 대기하다 Vercel 함수 최대 시간(300초)을
// 다 채우고서야 타임아웃으로 죽는 문제가 있었다 — 홈 화면이 "흰 화면/무한
// 로딩"으로 보이던 원인. 연결/유휴 타임아웃을 명시해 죽은 커넥션을 빨리
// 끊어내고 새 커넥션으로 재시도할 수 있게 한다.
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  max: 1,
  connect_timeout: 10,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

export const db = drizzle(client, { schema });
