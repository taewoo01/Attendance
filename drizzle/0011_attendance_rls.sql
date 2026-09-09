-- TASK-027: attendance RLS.
-- drizzle-kit이 관리하지 않는 RLS는 0001_rls_and_trigger.sql과 동일하게 이 custom
-- 마이그레이션에 수기로 작성한다.
-- AGENTS.md 11.2절에 attendance의 기본 정책이 명시되어 있다:
-- "INSERT/UPDATE/DELETE: 본인만 허용, SELECT: 팀 전체 허용" — daily_logs와 동일하게
-- 그대로 반영한다(체크인 기능 자체는 이번 TASK 범위가 아니지만, RLS는 테이블 생성 시
-- 함께 설계한다는 AGENTS.md 11.2 원칙에 따름).

ALTER TABLE "attendance" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance_select_authenticated"
  ON "attendance"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "attendance_insert_own"
  ON "attendance"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "attendance_update_own"
  ON "attendance"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "attendance_delete_own"
  ON "attendance"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
