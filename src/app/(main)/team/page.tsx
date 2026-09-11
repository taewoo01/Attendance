import { EditProfileButton } from "@/components/team/EditProfileButton";
import { TeamDirectory } from "@/components/team/TeamDirectory";
import { getCurrentUser } from "@/lib/auth/get-user";
import { listProfiles } from "@/lib/db/profiles";
import { withAvatarUrls } from "@/lib/team/avatars";

// TASK-022: DB 조회가 build 시점에 고정되지 않도록 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const user = await getCurrentUser();
  const fetchedMembers = await withAvatarUrls(await listProfiles());
  // listProfiles가 이미 본인 행도 포함하므로, 편집 버튼 기본값도 여기서 그대로
  // 찾아 쓴다(getProfileByUserId를 또 호출하지 않는다).
  const myProfile = user ? fetchedMembers.find((member) => member.userId === user.id) : undefined;
  // listProfiles는 별도 정렬이 없어 사실상 가입순으로 내려온다 — 본인 카드는
  // 가입순과 무관하게 항상 맨 앞(가장 왼쪽/위)에 오도록 나머지 목록 앞으로 뺀다.
  // 나머지 멤버끼리의 상대 순서(가입순)는 그대로 유지한다.
  const members = myProfile
    ? [myProfile, ...fetchedMembers.filter((member) => member.userId !== myProfile.userId)]
    : fetchedMembers;

  return (
    <>
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">팀 소개</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">팀원 소개</h1>
          <p className="m-0 mt-1 text-[13px] text-silk-dim">Team VAMOS · AI Solution Team Playground</p>
        </div>
        {user && (
          <EditProfileButton
            defaultName={myProfile?.name ?? ""}
            defaultRole={myProfile?.role ?? ""}
            defaultContact={myProfile?.contact || user.email || ""}
            defaultSpecialty={myProfile?.specialty ?? ""}
            defaultAvatarUrl={myProfile?.avatarUrl ?? null}
          />
        )}
      </div>

      <TeamDirectory members={members} currentUserId={user?.id} />
    </>
  );
}
