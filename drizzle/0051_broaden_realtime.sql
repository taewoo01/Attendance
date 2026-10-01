-- 파일/아이디어/실적/데일리/회의록 등록도 출석(0040_attendance_realtime.sql)과 동일하게
-- 실시간으로 다른 팀원 화면에 반영되도록 각 테이블을 Supabase Realtime publication에
-- 추가한다. 각 테이블의 기존 RLS SELECT 정책이 구독에도 그대로 적용된다.
ALTER PUBLICATION supabase_realtime ADD TABLE files;
ALTER PUBLICATION supabase_realtime ADD TABLE ideas;
ALTER PUBLICATION supabase_realtime ADD TABLE achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_notes;
