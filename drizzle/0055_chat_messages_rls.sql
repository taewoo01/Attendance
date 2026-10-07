-- 팀 채팅(chat_messages) RLS. ideas_select_authenticated(0005_ideas_rls.sql)와 동일한
-- 이유로 로그인한 팀원 전체가 전체 메시지를 조회할 수 있어야 한다. INSERT/UPDATE/
-- DELETE 정책은 두지 않는다(default deny) — 쓰기는 서버의 Server Action이
-- DATABASE_URL 연결(RLS 우회)로만 처리하고, who/avatar를 로그인 사용자 프로필에서
-- 서버가 채워서 다른 사람 명의로 메시지를 위조해 보낼 수 없게 한다.
ALTER TABLE "chat_messages" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_messages_select_authenticated"
  ON "chat_messages"
  FOR SELECT
  TO authenticated
  USING (true);
