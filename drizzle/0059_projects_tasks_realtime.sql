-- 프로젝트/업무 칸반(/projects)이 다른 팀원의 생성/이동/담당자 변경/삭제를 새로고침
-- 없이 반영하도록 세 테이블을 Supabase Realtime publication에 추가한다. 0058의
-- *_select_authenticated 정책(팀 전체 SELECT 허용)이 구독에도 그대로 적용된다.
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE task_assignees;
