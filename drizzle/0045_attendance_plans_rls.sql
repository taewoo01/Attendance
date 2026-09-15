-- 퇴근 후 "내일 상주 계획" 기능: attendance_plans RLS.
-- 다른 팀원들에게 보여주는 게 목적이라(홈 화면/출석 인증 페이지 출석 현황에 미리 표시)
-- attendance/files와 동일하게 로그인한 팀원 전체가 조회할 수 있어야 한다.
-- 실제 쓰기는 서버 Server Action(src/lib/attendance/plan.ts)이 DATABASE_URL
-- 연결(RLS 우회)로만 처리한다.

ALTER TABLE "attendance_plans" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance_plans_select_authenticated"
  ON "attendance_plans"
  FOR SELECT
  TO authenticated
  USING (true);
