-- TASK-025: daily_logs RLS.
-- drizzle-kit이 관리하지 않는 RLS는 0001_rls_and_trigger.sql과 동일하게 이 custom
-- 마이그레이션에 수기로 작성한다.
-- AGENTS.md 11.2절에 daily_logs의 기본 정책이 명시되어 있다:
-- "INSERT/UPDATE/DELETE: 본인만 허용, SELECT: 팀 전체 허용" — meeting_notes/ideas와
-- 달리 이 테이블은 정책이 이미 문서로 확정되어 있어 그대로 반영한다(쓰기 기능 자체는
-- 이번 TASK 범위가 아니지만, RLS는 테이블 생성 시 함께 설계한다는 AGENTS.md 11.2 원칙에 따름).

ALTER TABLE "daily_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_logs_select_authenticated"
  ON "daily_logs"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "daily_logs_insert_own"
  ON "daily_logs"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_logs_update_own"
  ON "daily_logs"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_logs_delete_own"
  ON "daily_logs"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
