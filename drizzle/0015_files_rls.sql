-- TASK-029: files RLS.
-- drizzle-kit이 관리하지 않는 RLS는 0001_rls_and_trigger.sql과 동일하게 이 custom
-- 마이그레이션에 수기로 작성한다.

-- 1) RLS 활성화. INSERT/UPDATE/DELETE 정책을 두지 않으므로(default deny),
--    anon/authenticated 역할은 files를 client에서 직접 쓸 수 없다. 실제 업로드는
--    서버 Server Action(src/lib/files/actions.ts)이 Storage 업로드 성공 후
--    DATABASE_URL 연결(RLS 우회)로만 메타데이터를 insert한다.
ALTER TABLE "files" ENABLE ROW LEVEL SECURITY;

-- 2) 자료실은 내부 페이지(로그인 필요, docs/MIGRATION.md 10절)이므로 로그인한
--    팀원 전체가 파일 목록을 조회할 수 있어야 한다. 실제 다운로드는 이 SELECT
--    권한과 별개로 서버가 발급하는 presigned URL(만료 있음)로만 가능하다.
CREATE POLICY "files_select_authenticated"
  ON "files"
  FOR SELECT
  TO authenticated
  USING (true);
