type TeamMember = {
  userId: string;
  name: string;
  role: string;
  contact: string;
  specialty: string;
  avatarUrl: string | null;
};

type TeamGridProps = {
  members: TeamMember[];
  currentUserId?: string;
};

/**
 * playground-design/team.html의 .team-grid(.id-card).
 * 원본 <script>가 카드 내부를 전혀 건드리지 않는 순수 정적 영역이라
 * Server Component로 유지한다.
 * .id-divider는 원본 CSS에서 background가 var(--border)로 선언된 뒤 같은 규칙
 * 안에서 background:none으로 다시 덮어써 최종적으로는 배경 없이
 * border-top(1px dashed)만 남는다 — 그 실제 렌더 결과만 재현한다.
 * TASK-022: 원본의 소속 서브라벨/전화번호/기술스택은 profiles DB에 없는 값이라
 * 표시하지 않는다(가짜 데이터로 채우지 않음). avatar는 실제 avatar 컬럼이 없어
 * name의 첫 글자에서 파생한다.
 * 팀소개 페이지 수정: `currentUserId`가 주어지면 본인 카드에 "나" 배지를 달아
 * 어떤 카드가 자기 것인지(그래서 "+ 프로필 편집"으로 어떤 카드가 바뀌는지) 바로
 * 알 수 있게 한다 — 실제 auth 사용자 매칭이라 가짜 데이터가 아니다.
 * 프로필 사진/전공분야 추가: `avatarUrl`이 있으면(호출부가 미리 발급한 signed
 * URL) 이름 첫 글자 아바타 대신 실제 사진을 보여주고, `specialty`가 있으면
 * 이메일 아래에 한 줄 더 표시한다. 둘 다 값이 없으면 기존 폴백/미표시 그대로다.
 */
export function TeamGrid({ members, currentUserId }: TeamGridProps) {
  return (
    <div className="mx-auto grid max-w-[1220px] grid-cols-4 gap-[18px] px-7 pt-5 pb-[100px] max-[960px]:grid-cols-2 max-[560px]:grid-cols-1">
      {members.map((member) => {
        const avatar = member.name.trim().charAt(0) || "?";
        const isSelf = member.userId === currentUserId;

        return (
          <div
            key={member.userId}
            className={`relative overflow-hidden rounded-card-lg border bg-bg-panel px-5 pt-[22px] pb-5 transition-[border-color,transform] duration-150 before:absolute before:inset-x-0 before:top-0 before:h-14 before:bg-[linear-gradient(180deg,rgba(72,217,176,0.1),transparent)] before:content-[''] hover:-translate-y-0.5 hover:border-teal-dim ${
              isSelf ? "border-teal-dim" : "border-border"
            }`}
          >
            {isSelf && (
              <span className="absolute top-3 right-3 z-[1] rounded-[5px] bg-teal-dim px-2 py-[3px] font-mono text-[10px] font-bold tracking-[0.05em] text-teal">
                나
              </span>
            )}
            <div className="absolute top-[14px] left-1/2 h-[6px] w-[38px] -translate-x-1/2 rounded-[4px] border border-border bg-bg-raised" />
            {member.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- signed URL은 만료가 있어 next/image 원격 최적화 대상으로 등록하기보다 그대로 <img>로 둔다.
              <img
                src={member.avatarUrl}
                alt=""
                className="relative z-[1] mx-auto mt-[14px] mb-3 h-16 w-16 rounded-full object-cover shadow-[0_8px_20px_rgba(72,217,176,0.25)]"
              />
            ) : (
              <div className="relative z-[1] mx-auto mt-[14px] mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(155deg,var(--teal),#157a5f)] font-mono text-[22px] font-bold text-[#04231b] shadow-[0_8px_20px_rgba(72,217,176,0.25)]">
                {avatar}
              </div>
            )}
            <div className="text-center text-[15.5px] font-bold text-silk">{member.name}</div>
            <div className="mt-[3px] text-center font-mono text-[11px] tracking-[0.02em] text-teal">
              {member.role}
            </div>

            <div className="my-[15px] h-px border-t border-dashed border-border" />

            <div className="flex flex-col gap-2">
              {member.contact && (
                <div className="flex items-center gap-2 text-[11.5px] text-silk-dim">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth={1.8}
                    className="h-3 w-3 shrink-0 stroke-silk-faint"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 7l10 6 10-6" />
                  </svg>
                  {member.contact}
                </div>
              )}
              {member.specialty && (
                <div className="flex items-center gap-2 text-[11.5px] text-silk-dim">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth={1.8}
                    className="h-3 w-3 shrink-0 stroke-silk-faint"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                  </svg>
                  {member.specialty}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
