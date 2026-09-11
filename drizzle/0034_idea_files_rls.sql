-- 아이디어 페이지 상세화: idea_files(다중 첨부파일) RLS.
-- drizzle-kit이 관리하지 않는 RLS는 0001_rls_and_trigger.sql과 동일하게 이 custom
-- 마이그레이션에 수기로 작성한다. achievement_files(0023_achievements_write_rls.sql)와
-- 동일한 원칙 — 첨부파일은 부모 아이디어와 마찬가지로 팀 전체가 조회할 수 있어야
-- 하고, 쓰기는 본인이 올린 파일만 가능하다. UPDATE 정책은 두지 않는다(교체는
-- 삭제 후 재업로드).

ALTER TABLE "idea_files" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "idea_files_select_authenticated"
  ON "idea_files"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "idea_files_insert_own"
  ON "idea_files"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "idea_files_delete_own"
  ON "idea_files"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
