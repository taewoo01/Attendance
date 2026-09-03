const MONTH_SUMMARY = [
  { n: "3", l: "회의록" },
  { n: "7", l: "액션아이템" },
  { n: "1", l: "지연" },
];

const OPEN_ACTIONS = [
  { title: "중간보고서 초안 작성 (배경·방법론)", meta: "강태윤 · 9/3" },
  { title: "시나리오 3종 실험 설계안 작성", meta: "정민재 · 9/6" },
  { title: "병상 현황 연동 기능 기술 검토", meta: "오지훈 · 9/1 지연" },
];

/**
 * playground-design/meetings.html의 <aside> 격 2개 .side-card
 * (이번 달 요약 / 미완료 액션아이템). 원본 <script>가 전혀 건드리지 않는
 * 정적 영역이라 Server Component로 유지한다. `.chk`는 원본에도 클릭
 * 리스너가 없는 장식용 체크박스라 그대로 정적 요소로 남긴다.
 */
export function MeetingsSidebar() {
  return (
    <div>
      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">이번 달 요약</h4>
        <div className="flex gap-5">
          {MONTH_SUMMARY.map((item) => (
            <div key={item.l} className="flex-1">
              <div className="font-mono text-[24px] font-bold text-teal">{item.n}</div>
              <div className="mt-1 text-[11px] text-silk-faint">{item.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-panel border border-border bg-bg-panel px-[18px] pt-[18px] pb-4">
        <h4 className="m-0 mb-[14px] text-[13.5px] font-semibold">미완료 액션아이템</h4>
        {OPEN_ACTIONS.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-[9px] border-b border-border py-2 last:border-b-0 last:pb-0"
          >
            <div className="mt-0.5 h-[14px] w-[14px] shrink-0 rounded-[4px] border border-border" />
            <div className="flex-1">
              <div className="text-xs leading-[1.4] text-silk">{item.title}</div>
              <div className="mt-[3px] font-mono text-[10px] text-silk-faint">{item.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
