-- 로그인 관련 온보딩 gap 수정: profiles.name을 본인이 채울 수 있게 UPDATE own
-- 정책을 추가한다. 0001_rls_and_trigger.sql은 SELECT만 두고("anon/authenticated
-- 역할은 profiles를 client에서 직접 쓸 수 없다" 주석 참고) 쓰기 정책이 없었다 —
-- personal_events/fixed_schedules/achievements와 동일한 원칙(본인만 쓰기,
-- 팀 전체 조회)을 여기도 적용한다. 실제 쓰기는 서버 Server Action
-- (src/lib/auth/profile.ts)이 DATABASE_URL 연결로 처리하지만, 다른 테이블들과
-- 일관되게 RLS 정책도 함께 정의해둔다(AGENTS.md 11.2절).
CREATE POLICY "profiles_update_own"
  ON "profiles"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
