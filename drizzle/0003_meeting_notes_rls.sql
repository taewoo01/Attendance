-- TASK-023: meeting_notes RLS.
-- drizzle-kit이 관리하지 않는 RLS는 0001_rls_and_trigger.sql과 동일하게 이 custom
-- 마이그레이션에 수기로 작성한다.

-- 1) RLS 활성화. INSERT/UPDATE/DELETE 정책을 두지 않으므로(default deny),
--    anon/authenticated 역할은 meeting_notes를 client에서 직접 쓸 수 없다.
--    (쓰기는 서버의 DATABASE_URL 연결(RLS 우회)에서만 일어난다.)
ALTER TABLE "meeting_notes" ENABLE ROW LEVEL SECURITY;

-- 2) 회의록은 내부 페이지(로그인 필요, docs/MIGRATION.md 10절)이므로 로그인한
--    팀원 전체가 서로의 회의록을 조회할 수 있어야 한다.
CREATE POLICY "meeting_notes_select_authenticated"
  ON "meeting_notes"
  FOR SELECT
  TO authenticated
  USING (true);
