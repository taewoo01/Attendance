-- 프로젝트/업무 관리(projects, tasks, task_assignees) RLS. chat_messages
-- (0055_chat_messages_rls.sql)와 동일하게 로그인한 팀원 전체가 모든 프로젝트와
-- 업무를 조회할 수 있어야 한다. INSERT/UPDATE/DELETE 정책은 두지 않는다
-- (default deny) — 쓰기는 서버의 Server Action이 DATABASE_URL 연결(RLS 우회)로만
-- 처리하고, 작성자/담당자 권한 검증과 created_by 채우기를 서버가 수행해서
-- 다른 사람 명의로 업무를 위조하거나 남의 업무를 수정할 수 없게 한다.
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "task_assignees" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_authenticated"
  ON "projects"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "tasks_select_authenticated"
  ON "tasks"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "task_assignees_select_authenticated"
  ON "task_assignees"
  FOR SELECT
  TO authenticated
  USING (true);
