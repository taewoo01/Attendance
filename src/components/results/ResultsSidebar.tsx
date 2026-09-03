const MEMBER_BARS = [
  { name: "김연구", count: "3건", width: "85%" },
  { name: "이하늘", count: "2건", width: "55%" },
  { name: "오지훈", count: "2건", width: "55%" },
  { name: "박준서", count: "1건", width: "30%" },
  { name: "한서준", count: "0건", width: "4%" },
];

const QUICK_ITEMS = [
  { day: "금", title: "DC 리플 SOH continual learning" },
  { day: "목", title: "KEPCO 중간보고서 제출" },
  { day: "수", title: "AI Rookie 예선 통과" },
];

/**
 * playground-design/results.html의 <aside> 격 3개 .side-card
 * (이번 주 요약 / 팀원별 등록 현황 / 최근 등록) 정적 데이터.
 * 원본 <script>가 전혀 건드리지 않는 영역이라 Server Component로 유지한다.
 * .member-bar-fill의 width는 원본에서도 inline style로 동적 수치를 표현하므로
 * (docs/MIGRATION.md 2절) Tailwind 클래스가 아닌 style={{ width }}로 그대로 유지한다.
 */
export function ResultsSidebar() {
  return (
    <div>
      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">이번 주 요약</h4>
        <div className="font-mono text-[30px] font-bold leading-none text-teal">7건</div>
        <div className="mt-1.5 text-[11.5px] text-silk-faint">지난주 대비 +2건</div>
        <div className="mt-4 flex gap-5 border-t border-border pt-3.5">
          <div className="flex-1">
            <div className="font-mono text-[17px] font-bold text-silk">4</div>
            <div className="mt-0.5 text-[10.5px] text-silk-faint">개인 실적</div>
          </div>
          <div className="flex-1">
            <div className="font-mono text-[17px] font-bold text-silk">3</div>
            <div className="mt-0.5 text-[10.5px] text-silk-faint">팀 실적</div>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">팀원별 등록 현황</h4>
        {MEMBER_BARS.map((m) => (
          <div key={m.name} className="mb-[11px] last:mb-0">
            <div className="mb-[5px] flex justify-between text-[11.5px]">
              <span className="text-silk-dim">{m.name}</span>
              <span className="font-mono text-silk-faint">{m.count}</span>
            </div>
            <div className="h-[5px] overflow-hidden rounded-[3px] bg-bg-raised">
              <div className="h-full rounded-[3px] bg-teal" style={{ width: m.width }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">최근 등록</h4>
        {QUICK_ITEMS.map((item) => (
          <div
            key={item.day + item.title}
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
