type Member = {
  avatar: string;
  name: string;
  role: string;
  team: string;
  email: string;
  phone: string;
  stack: string[];
};

const MEMBERS: Member[] = [
  {
    avatar: "연",
    name: "김연구",
    role: "BMS · 연구",
    team: "AI솔루션 팀 · 전자공학부 3학년",
    email: "yeongu.kim@gnu.ac.kr",
    phone: "010-12**-3456",
    stack: ["Python", "Kalman Filter", "PyTorch"],
  },
  {
    avatar: "하",
    name: "이하늘",
    role: "BMS · 연구",
    team: "AI솔루션 팀 · 전자공학부 3학년",
    email: "haneul.lee@gnu.ac.kr",
    phone: "010-23**-4567",
    stack: ["신경망", "SOC 추정", "MATLAB"],
  },
  {
    avatar: "준",
    name: "박준서",
    role: "Firmware · 연구",
    team: "EDCL 팀 · 전자공학부 3학년",
    email: "junseo.park@gnu.ac.kr",
    phone: "010-34**-5678",
    stack: ["아날로그 회로", "PCB"],
  },
  {
    avatar: "도",
    name: "최도윤",
    role: "Firmware · 연구",
    team: "EDCL 팀 · 전자공학부 3학년",
    email: "doyoon.choi@gnu.ac.kr",
    phone: "010-45**-6789",
    stack: ["ANSYS", "열-전기 시뮬레이션"],
  },
  {
    avatar: "민",
    name: "정민재",
    role: "Data · 연구",
    team: "AI솔루션 팀 · 전자공학부 3학년",
    email: "minjae.jeong@gnu.ac.kr",
    phone: "010-56**-7890",
    stack: ["강화학습", "시뮬레이션"],
  },
  {
    avatar: "서",
    name: "한서준",
    role: "Data · 연구",
    team: "EDCL 팀 · 전자공학부 3학년",
    email: "seojun.han@gnu.ac.kr",
    phone: "010-67**-8901",
    stack: ["데이터 라벨링", "SQL"],
  },
  {
    avatar: "지",
    name: "오지훈",
    role: "PM",
    team: "AI솔루션 팀 · 전자공학부 4학년",
    email: "jihoon.oh@gnu.ac.kr",
    phone: "010-78**-9012",
    stack: ["기획", "사업개발"],
  },
  {
    avatar: "태",
    name: "강태윤",
    role: "PM",
    team: "AI솔루션 팀 · 전자공학부 4학년",
    email: "taeyoon.kang@gnu.ac.kr",
    phone: "010-89**-0123",
    stack: ["IR", "투자유치"],
  },
];

/**
 * playground-design/team.html의 .team-grid(.id-card 8장).
 * 원본 <script>가 카드 내부를 전혀 건드리지 않는 순수 정적 영역이라
 * Server Component로 유지한다.
 * .id-divider는 원본 CSS에서 background가 var(--border)로 선언된 뒤 같은 규칙
 * 안에서 background:none으로 다시 덮어써 최종적으로는 배경 없이
 * border-top(1px dashed)만 남는다 — 그 실제 렌더 결과만 재현한다.
 */
export function TeamGrid() {
  return (
    <div className="mx-auto grid max-w-[1220px] grid-cols-4 gap-[18px] px-7 pt-5 pb-[100px] max-[960px]:grid-cols-2 max-[560px]:grid-cols-1">
      {MEMBERS.map((member) => (
        <div
          key={member.name}
          className="relative overflow-hidden rounded-card-lg border border-border bg-bg-panel px-5 pt-[22px] pb-5 transition-[border-color,transform] duration-150 before:absolute before:inset-x-0 before:top-0 before:h-14 before:bg-[linear-gradient(180deg,rgba(72,217,176,0.1),transparent)] before:content-[''] hover:-translate-y-0.5 hover:border-teal-dim"
        >
          <div className="absolute top-[14px] left-1/2 h-[6px] w-[38px] -translate-x-1/2 rounded-[4px] border border-border bg-bg-raised" />
          <div className="relative z-[1] mx-auto mt-[14px] mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(155deg,var(--teal),#157a5f)] font-mono text-[22px] font-bold text-[#04231b] shadow-[0_8px_20px_rgba(72,217,176,0.25)]">
            {member.avatar}
          </div>
          <div className="text-center text-[15.5px] font-bold text-silk">{member.name}</div>
          <div className="mt-[3px] text-center font-mono text-[11px] tracking-[0.02em] text-teal">
            {member.role}
          </div>
          <div className="mt-0.5 text-center text-[11.5px] text-silk-faint">{member.team}</div>

          <div className="my-[15px] h-px border-t border-dashed border-border" />

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[11.5px] text-silk-dim">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-3 w-3 shrink-0 stroke-silk-faint">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 6 10-6" />
              </svg>
              {member.email}
            </div>
            <div className="flex items-center gap-2 text-[11.5px] text-silk-dim">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-3 w-3 shrink-0 stroke-silk-faint">
                <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .3 2 .7 2.9a2 2 0 01-.4 2.1L8 10a16 16 0 006 6l1.3-1.4a2 2 0 012.1-.4c.9.4 1.9.6 2.9.7a2 2 0 011.7 2z" />
              </svg>
              {member.phone}
            </div>
          </div>

          <div className="mt-[14px] flex flex-wrap gap-[5px]">
            {member.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-pill border border-border bg-bg-raised px-2 py-[3px] font-mono text-[9.5px] font-semibold text-silk-dim"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
