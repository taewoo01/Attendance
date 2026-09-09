-- TASK-018: profiles RLS + auth.users insert 트리거.
-- drizzle-kit이 관리하지 않는 RLS/트리거는 이 custom 마이그레이션에 수기로 작성한다.

-- 1) RLS 활성화. INSERT/UPDATE/DELETE 정책을 두지 않으므로(default deny),
--    anon/authenticated 역할은 profiles를 client에서 직접 쓸 수 없다 —
--    can_invite를 포함한 어떤 컬럼도 사용자가 스스로 변경할 수 없다.
--    (쓰기는 아래 트리거 또는 서버의 DATABASE_URL 연결(RLS 우회)에서만 일어난다.)
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

-- 2) 팀 디렉터리 조회: 로그인한 팀원은 서로의 이름/역할/연락처를 볼 수 있어야
--    UserChip 등 기존 UI가 의미를 가진다. can_invite 값 자체도 노출되지만
--    이는 "초대 가능 여부" 정보일 뿐 관리자 권한이 아니므로 노출에 문제가 없다.
CREATE POLICY "profiles_select_authenticated"
  ON "profiles"
  FOR SELECT
  TO authenticated
  USING (true);

-- 3) auth.users에 새 사용자가 생성될 때(초대 수락 포함) profiles 행을 자동 생성한다.
--    can_invite는 컬럼 기본값(false)을 그대로 사용 — "신규 초대 팀원은 기본
--    can_invite=false" 요구사항을 앱 코드 없이 DB 레벨에서 보장한다.
--    SECURITY DEFINER로 RLS(위 SELECT-only 정책)를 우회해 insert를 수행한다.
--    profiles insert가 어떤 이유로든 실패해도 auth.users 생성(회원가입/초대) 자체는
--    절대 막지 않는다 — EXCEPTION WHEN OTHERS로 흡수하고 경고만 남긴다.
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: profiles insert failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
