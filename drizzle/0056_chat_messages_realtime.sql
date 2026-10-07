-- 팀 채팅 패널(TeamChatWidget)이 폴링 없이 즉시 새 메시지를 받도록 chat_messages를
-- Supabase Realtime publication에 추가한다. 0055의 chat_messages_select_authenticated
-- 정책(팀 전체 SELECT 허용)이 구독에도 그대로 적용되어, 로그인한 팀원 전체가 모든
-- INSERT 이벤트를 받는다.
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
