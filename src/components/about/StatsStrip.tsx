const STATS = [
  { num: "8", label: "팀원" },
  { num: "3", label: "진행 중 프로젝트" },
  { num: "1", label: "외부 R&D 과제" },
  { num: "2026", label: "설립년도" },
];

/**
 * playground-design/about.html의 .stats-strip.
 * <script>가 없어 정적 Server Component로 유지한다.
 */
export function StatsStrip() {
  return (
    <div className="mx-auto grid max-w-[1220px] grid-cols-4 gap-[18px] px-7 pt-2.5 pb-[70px] max-[760px]:grid-cols-2">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="rounded-panel border border-border bg-bg-panel px-5 pt-5 pb-[18px] text-center"
        >
          <div className="font-mono text-[28px] font-bold text-teal">{stat.num}</div>
          <div className="mt-1.5 text-[11.5px] text-silk-faint">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
