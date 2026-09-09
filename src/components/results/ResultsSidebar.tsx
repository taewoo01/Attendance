import type { Result } from "@/components/results/ResultList";

type ResultsSidebarProps = {
  results: Result[];
  members: { userId: string; name: string }[];
};

/** "8월 29일 (금)" 같은 원본 date 표기에서 괄호 안 요일 한 글자만 뽑아낸다. */
function extractWeekday(dateText: string): string {
  return dateText.match(/\(([가-힣])\)/)?.[1] ?? "";
}

/**
 * playground-design/results.html의 <aside> 격 3개 .side-card
 * (이번 주 요약 / 팀원별 등록 현황 / 최근 등록). 원본 <script>가 전혀 건드리지
 * 않는 영역이라 Server Component로 유지한다.
 * .member-bar-fill의 width는 원본에서도 inline style로 동적 수치를 표현하므로
 * (docs/MIGRATION.md 2절) Tailwind 클래스가 아닌 style={{ width }}로 그대로 유지한다.
 * TASK-026: "이번 주 요약"의 건수/개인·팀 실적과 "최근 등록"(최신순 3건)은
 * 실제 results props에서 계산한다. "지난주 대비" 증감은 resultDate가 실제
 * date 컬럼이 아니라 자유 텍스트 표기라 주간 범위 비교가 어려워 하드코딩을 유지한다.
 * "팀원별 등록 현황"(실적 페이지 상세화 후속)은 achievements.userId(실적 페이지
 * 상세화 1단계에서 추가)로 실제 등록 건수를 집계한다 — "등록 현황"이라 팀 실적의
 * teamMembers(참여자)가 아니라 "누가 실제로 등록했는지"(userId)만 센다.
 */
export function ResultsSidebar({ results, members }: ResultsSidebarProps) {
  const personalCount = results.filter((r) => !r.team).length;
  const teamCount = results.filter((r) => r.team).length;
  const quickItems = results.slice(0, 3).map((r) => ({ day: extractWeekday(r.date), title: r.title }));

  const countByUserId = new Map<string, number>();
  for (const r of results) {
    if (!r.userId) continue;
    countByUserId.set(r.userId, (countByUserId.get(r.userId) ?? 0) + 1);
  }
  const memberBars = members
    .map((m) => ({ name: m.name, count: countByUserId.get(m.userId) ?? 0 }))
    .sort((a, b) => b.count - a.count);
  const maxCount = Math.max(1, ...memberBars.map((m) => m.count));

  return (
    <div>
      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">이번 주 요약</h4>
        <div className="font-mono text-[30px] font-bold leading-none text-teal">{results.length}건</div>
        <div className="mt-1.5 text-[11.5px] text-silk-faint">지난주 대비 +2건</div>
        <div className="mt-4 flex gap-5 border-t border-border pt-3.5">
          <div className="flex-1">
            <div className="font-mono text-[17px] font-bold text-silk">{personalCount}</div>
            <div className="mt-0.5 text-[10.5px] text-silk-faint">개인 실적</div>
          </div>
          <div className="flex-1">
            <div className="font-mono text-[17px] font-bold text-silk">{teamCount}</div>
            <div className="mt-0.5 text-[10.5px] text-silk-faint">팀 실적</div>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">팀원별 등록 현황</h4>
        {memberBars.map((m) => (
          <div key={m.name} className="mb-[11px] last:mb-0">
            <div className="mb-[5px] flex justify-between text-[11.5px]">
              <span className="text-silk-dim">{m.name}</span>
              <span className="font-mono text-silk-faint">{m.count}건</span>
            </div>
            <div className="h-[5px] overflow-hidden rounded-[3px] bg-bg-raised">
              <div
                className="h-full rounded-[3px] bg-teal"
                style={{ width: `${Math.max((m.count / maxCount) * 100, 4)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">최근 등록</h4>
        {quickItems.map((item, i) => (
          <div
            key={i}
            className="flex items-baseline gap-[9px] border-b border-border py-[7px] last:border-b-0 last:pb-0"
          >
            <span className="w-[34px] shrink-0 font-mono text-[10.5px] text-teal">{item.day}</span>
            <span className="flex-1 text-xs text-silk">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
