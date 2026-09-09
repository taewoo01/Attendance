import { CompleteProfileModal } from "@/components/auth/CompleteProfileModal";
import { StatusBar } from "@/components/layout/StatusBar";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getProfileByUserId } from "@/lib/db/profiles";

/**
 * 기존 10개 페이지(/,  /attendance, /schedule, /results, /daily, /ideas,
 * /meetings, /files, /about, /team)가 공유하던 StatusBar/main/Footer 골격을
 * Root Layout(src/app/layout.tsx)에서 이 route group 전용 레이아웃으로 옮긴 것.
 * (main) 폴더명은 URL에 포함되지 않으므로 각 페이지의 실제 경로는 변경되지 않는다.
 * /login은 이 그룹 밖에 위치해 이 StatusBar/Footer를 상속하지 않는다.
 * StatusBar의 UserChip에 실제 로그인 사용자 이름을 보여주기 위해 여기서
 * profiles.name을 조회해 내려준다(로그인 여부 게이팅은 각 page.tsx의 몫이라
 * 세션이 없으면 UserChip 기본값으로 폴백한다).
 * 로그인 관련 온보딩 gap: Supabase Auth에 직접 등록된 계정은 초대 수락
 * (/set-password)을 거치지 않아 이름/이메일을 입력할 기회가 없다 —
 * profiles.name 또는 profiles.contact(이메일)가 비어있으면 여기서
 * CompleteProfileModal을 띄운다(모든 (main) 페이지가 이 layout을 상속하므로
 * 어느 페이지로 들어와도 한 번은 걸린다). 이름은 있는데 이메일만 없는 경우
 * (예: 이메일 입력칸이 생기기 전에 이미 프로필을 완성한 계정)도 이 조건으로
 * 같이 잡힌다 — 이때는 모달을 새로 만들지 않고 같은 모달에 기존 이름을
 * defaultName으로 미리 채워서 다시 입력하지 않게 한다.
 */
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const profile = user ? await getProfileByUserId(user.id) : null;
  const needsProfile = !!user && (!profile?.name || !profile?.contact);

  return (
    <>
      <StatusBar userName={profile?.name || undefined} />
      <main className="flex-1">{children}</main>
      <Footer />
      {needsProfile && (
        <CompleteProfileModal
          defaultName={profile?.name}
          defaultRole={profile?.role}
          defaultEmail={profile?.contact || user?.email}
        />
      )}
    </>
  );
}
