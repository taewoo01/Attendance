-- 초기 창업 멤버 4명을 can_invite=true로 전환하는 1회성 수동 스크립트.
-- drizzle-kit 마이그레이션(journal)에 포함하지 않는다 — 스키마 변경이 아니라
-- 특정 인원의 데이터 변경이고, 실제 이메일(개인정보)을 코드/커밋에 남기지 않기 위함이다.
--
-- 사용법:
--   1. <FOUNDER_EMAIL_n>을 실제 창업 멤버 4명의 이메일로 치환한다.
--   2. 대상 auth.users 행이 이미 존재해야 한다(Supabase Dashboard에서 미리 생성).
--   3. Supabase SQL Editor(또는 DATABASE_URL로 psql 접속)에서 1회 실행한다.
--
-- 0001_rls_and_trigger.sql의 트리거가 이미 profiles 행을 만들어 두었어도,
-- 아직 없어도 모두 동작하도록 INSERT ... ON CONFLICT DO UPDATE로 작성한다.
insert into public.profiles (user_id, name, role, contact, can_invite)
select
  id,
  coalesce(split_part(email, '@', 1), ''),
  'founder',
  coalesce(email, ''),
  true
from auth.users
where email in (
  '<FOUNDER_EMAIL_1>',
  '<FOUNDER_EMAIL_2>',
  '<FOUNDER_EMAIL_3>',
  '<FOUNDER_EMAIL_4>'
)
on conflict (user_id) do update set can_invite = true;
