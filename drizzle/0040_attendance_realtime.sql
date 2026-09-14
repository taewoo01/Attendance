-- 홈 화면 출석 카운트를 폴링 없이 실시간으로 갱신하기 위해 attendance 테이블을
-- Supabase Realtime publication에 추가한다. RLS(0011_attendance_rls.sql)의
-- attendance_select_authenticated 정책(팀 전체 SELECT 허용)이 realtime 구독에도
-- 그대로 적용되어, 로그인한 팀원만 INSERT 이벤트를 받는다.
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
