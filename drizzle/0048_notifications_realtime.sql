-- 알림 토스트(useNotificationRealtime)가 폴링 없이 즉시 뜨도록 notifications
-- 테이블을 Supabase Realtime publication에 추가한다. 0047의
-- notifications_select_own 정책(본인 알림만 SELECT 허용)이 realtime 구독에도
-- 그대로 적용되어, 각 사용자는 자신에게 온 INSERT 이벤트만 받는다.
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
