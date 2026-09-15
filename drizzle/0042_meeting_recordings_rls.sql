-- 회의록 상단바 녹음 기능: meeting_recordings RLS.
-- files와 동일하게 로그인한 팀원 전체가 녹음 목록을 조회할 수 있어야 한다.
-- 실제 업로드는 서버 Server Action(src/lib/meetings/recordings.ts)이 Storage
-- 업로드 성공 후 DATABASE_URL 연결(RLS 우회)로만 메타데이터를 insert한다.

ALTER TABLE "meeting_recordings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meeting_recordings_select_authenticated"
  ON "meeting_recordings"
  FOR SELECT
  TO authenticated
  USING (true);
