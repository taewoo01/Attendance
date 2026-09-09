-- TASK-032: fixed_schedules 쓰기(INSERT/UPDATE/DELETE) RLS.
-- 0013_schedule_rls.sql은 fixed_schedules에 SELECT 정책만 두었다("이번 TASK
-- 범위에서는 조회 정책만 둔다" 주석 참고) — 이제 "내 고정 시간표" 등록/수정/삭제
-- 기능을 추가하면서 personal_events와 동일한 원칙(본인만 쓰기 가능, 팀 전체 조회
-- 가능)을 적용한다.

CREATE POLICY "fixed_schedules_insert_own"
  ON "fixed_schedules"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "fixed_schedules_update_own"
  ON "fixed_schedules"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "fixed_schedules_delete_own"
  ON "fixed_schedules"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
