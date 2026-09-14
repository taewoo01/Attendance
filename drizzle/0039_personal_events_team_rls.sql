-- 일정 페이지 "구분" 3분화(개인/팀/고정): 팀 일정(team = true)은 등록자가 아닌
-- 팀원도 수정/삭제할 수 있어야 한다. 기존 personal_events_update_own/delete_own
-- 정책(본인만)은 그대로 두고, team = true 행에 한해 허용하는 정책을 추가로 둔다
-- (같은 명령에 여러 permissive 정책은 OR로 합쳐지므로 "본인 것" 또는 "팀 일정"이면
-- 허용된다). 실제 쓰기는 서버 액션(src/lib/schedule/actions.ts)의 WHERE 절이
-- 이미 동일한 규칙으로 검증하지만, 다른 테이블과 동일하게 RLS도 맞춰둔다.

CREATE POLICY "personal_events_update_team"
  ON "personal_events"
  FOR UPDATE
  TO authenticated
  USING (team = true)
  WITH CHECK (team = true);

CREATE POLICY "personal_events_delete_team"
  ON "personal_events"
  FOR DELETE
  TO authenticated
  USING (team = true);
