-- TASK-034: idea_reactions RLS.
-- 이 테이블은 ideas/meeting_notes와 달리 개인 소유 데이터다(누가 어떤
-- 아이디어에 반응했는지) — personal_events/fixed_schedules와 동일한 원칙
-- (본인만 쓰기, 팀 전체 조회)을 적용한다.

ALTER TABLE "idea_reactions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "idea_reactions_select_authenticated"
  ON "idea_reactions"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "idea_reactions_insert_own"
  ON "idea_reactions"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "idea_reactions_delete_own"
  ON "idea_reactions"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
