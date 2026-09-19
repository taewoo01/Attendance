-- 개인 알림(notifications) RLS.
-- attendance_plans/meeting_recordings와 달리 "본인에게 온" 알림만 봐야 하므로
-- 팀 전체 SELECT를 허용하지 않는다(AGENTS.md 11.2절: 기본 정책은 차단 원칙).
-- 실제 알림 생성(INSERT)은 서버 Server Action이 DATABASE_URL 연결(RLS 우회)로만
-- 처리한다(알림을 보낸 사람이 아니라 받는 사람 기준으로 저장하므로 authenticated
-- 역할에 INSERT 정책을 열어주지 않는다 — 열면 다른 사람 명의로 내게 알림을
-- 위조해 넣을 수 있다). UPDATE만 "읽음 처리"(read_at 설정)를 위해 본인에게 허용한다.

ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own"
  ON "notifications"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON "notifications"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
