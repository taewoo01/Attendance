-- TASK-035: daily_log_templates RLS.
-- personal_events/fixed_schedules와 동일한 개인 소유 모델: 본인만 쓰기, 팀 전체 조회.

ALTER TABLE "daily_log_templates" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_log_templates_select_authenticated"
  ON "daily_log_templates"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "daily_log_templates_insert_own"
  ON "daily_log_templates"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_log_templates_update_own"
  ON "daily_log_templates"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_log_templates_delete_own"
  ON "daily_log_templates"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
