type TeamMember = {
  userId: string;
  name: string;
  role: string;
  contact: string;
};

type TeamGridProps = {
  members: TeamMember[];
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
 */
export function TeamGrid({ members }: TeamGridProps) {
  return (
    <div className="mx-auto grid max-w-[1220px] grid-cols-4 gap-[18px] px-7 pt-5 pb-[100px] max-[960px]:grid-cols-2 max-[560px]:grid-cols-1">
      {members.map((member) => {
        const avatar = member.name.trim().charAt(0) || "?";

        return (
          <div
            key={member.userId}
            className="relative overflow-hidden rounded-card-lg border border-border bg-bg-panel px-5 pt-[22px] pb-5 transition-[border-color,transform] duration-150 before:absolute before:inset-x-0 before:top-0 before:h-14 before:bg-[linear-gradient(180deg,rgba(72,217,176,0.1),transparent)] before:content-[''] hover:-translate-y-0.5 hover:border-teal-dim"
          >
            <div className="absolute top-[14px] left-1/2 h-[6px] w-[38px] -translate-x-1/2 rounded-[4px] border border-border bg-bg-raised" />
            <div className="relative z-[1] mx-auto mt-[14px] mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(155deg,var(--teal),#157a5f)] font-mono text-[22px] font-bold text-[#04231b] shadow-[0_8px_20px_rgba(72,217,176,0.25)]">
              {avatar}
            </div>
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
