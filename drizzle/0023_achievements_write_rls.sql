-- 실적 페이지 상세화(#1~#8): achievements 쓰기(INSERT/UPDATE/DELETE) RLS +
-- achievement_files(다중 첨부파일) RLS.
-- drizzle-kit이 관리하지 않는 RLS는 0001_rls_and_trigger.sql과 동일하게 이 custom
-- 마이그레이션에 수기로 작성한다.
-- 0009_achievements_rls.sql은 등록 기능 자체가 없어 SELECT 정책만 두었다("실적
-- 등록 기능 자체를 구현하지 않으므로 쓰기 정책도 아직 없다" 주석 참고) — 이제 실제
-- 등록/수정/삭제 기능을 추가하면서 personal_events/fixed_schedules와 동일한
-- 원칙(본인만 쓰기 가능, 팀 전체 조회 가능)을 적용한다.

CREATE POLICY "achievements_insert_own"
  ON "achievements"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "achievements_update_own"
  ON "achievements"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "achievements_delete_own"
  ON "achievements"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- achievement_files: 첨부파일은 부모 실적과 마찬가지로 팀 전체가 조회할 수 있어야
-- 하고(files_select_authenticated와 동일 원칙), 쓰기는 본인이 올린 파일만 가능하다.
-- UPDATE 정책은 두지 않는다 — files 테이블과 동일하게 첨부파일은 교체 시
-- 삭제 후 재업로드하는 방식이라 수정 자체가 없다.
ALTER TABLE "achievement_files" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievement_files_select_authenticated"
  ON "achievement_files"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "achievement_files_insert_own"
  ON "achievement_files"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "achievement_files_delete_own"
  ON "achievement_files"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
