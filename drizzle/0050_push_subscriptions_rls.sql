-- Web Push 구독(push_subscriptions) RLS.
-- notifications.readAt 갱신처럼 client가 직접 건드릴 이유가 없다 — 구독 등록/해제
-- 모두 Server Action이 DATABASE_URL 연결(RLS 우회)로만 처리한다(AGENTS.md 11.2절:
-- 기본 정책은 차단). anon/authenticated 역할에 어떤 정책도 열어주지 않아 client가
-- 직접 select/insert/delete할 수 없다 — profiles(0001 마이그레이션)와 동일한 설계다.

ALTER TABLE "push_subscriptions" ENABLE ROW LEVEL SECURITY;
