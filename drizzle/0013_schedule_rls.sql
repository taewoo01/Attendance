-- TASK-028: personal_events / fixed_schedules RLS.
-- drizzle-kit이 관리하지 않는 RLS는 0001_rls_and_trigger.sql과 동일하게 이 custom
-- 마이그레이션에 수기로 작성한다.

-- personal_events: AGENTS.md 11.2절에 명시된 정책("INSERT/UPDATE/DELETE 본인만,
-- SELECT 팀 전체")을 attendance/daily_logs와 동일하게 그대로 반영한다(등록 기능
-- 자체는 이번 TASK 범위가 아니지만, RLS는 테이블 생성 시 함께 설계한다는
-- AGENTS.md 11.2 원칙에 따름).
ALTER TABLE "personal_events" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "personal_events_select_authenticated"
  ON "personal_events"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "personal_events_insert_own"
  ON "personal_events"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "personal_events_update_own"
  ON "personal_events"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "personal_events_delete_own"
  ON "personal_events"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- fixed_schedules: AGENTS.md 11.2절에 이 테이블은 명시적으로 정의되어 있지
-- 않다(personal_events만 명시됨). meeting_notes/ideas/achievements와 동일하게
-- 쓰기 기능이 없는 이번 TASK 범위에서는 조회 정책만 둔다.
ALTER TABLE "fixed_schedules" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fixed_schedules_select_authenticated"
  ON "fixed_schedules"
  FOR SELECT
  TO authenticated
  USING (true);
