import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Component/Server Action에서 현재 로그인 사용자를 확인하는 최소 helper.
 * 세션이 없으면 user는 null이다. profile/DB 조회는 TASK-018 범위.
 * React `cache()`로 감싸 같은 요청 안에서는 한 번만 실제로 호출한다 — (main)/layout.tsx
 * 가 이제 매 페이지마다 이 함수를 호출하고, 각 page.tsx도 자기 데이터를 위해 다시
 * 호출해서 같은 요청 안에 중복 호출이 생겼다(홈 화면 DB 커넥션 풀 고갈 사고
 * 이후 pool max를 늘려야 했던 전례가 있어 — cce91c6/7f9a53a — 중복 호출을
 * 줄이는 쪽이 안전하다).
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});
