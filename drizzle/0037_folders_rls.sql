-- 자료실 새 폴더 기능: folders RLS.
-- files와 동일하게 로그인한 팀원 전체가 폴더 목록을 조회할 수 있어야 한다.
-- 생성은 idea_reactions/personal_events와 동일한 원칙(본인만 쓰기)을 적용한다.
-- 실제 쓰기는 서버 Server Action(src/lib/files/actions.ts)이 DATABASE_URL
-- 연결(RLS 우회)로 처리하지만, 다른 개인 소유 테이블과 동일하게 정책을 남겨둔다.

ALTER TABLE "folders" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "folders_select_authenticated"
  ON "folders"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "folders_insert_own"
  ON "folders"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
