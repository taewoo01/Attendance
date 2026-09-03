const BIZ_ITEMS = [
  {
    tag: "BMS · AI",
    title: "SOH/SOC 추정 엔진",
    desc: "DC 리플과 온도 조건을 반영한 하이브리드(신경망+칼만필터) 모델로 배터리 상태를 더 정확하게 추정합니다.",
  },
  {
    tag: "EMS · RL",
    title: "ESS 전압 제어 최적화",
    desc: "PPO 기반 강화학습으로 차세대 배전망 ESS의 Volt-VAR/Volt-Watt 제어를 최적화하는 기술을 연구합니다.",
  },
  {
    tag: "Healthcare · AI",
    title: "GoldenLink — 응급환자 매칭",
    desc: "응급환자와 수용 가능한 병원을 AI로 실시간 매칭하는 시스템으로, AI Rookie 경진대회 본선에 진출했습니다.",
  },
];

/**
 * playground-design/about.html의 두 번째 section-wrap(WHAT WE DO / 사업 아이템).
 * <script>가 없어 정적 Server Component로 유지한다.
 * .biz-card h4도 원본 CSS에 font-weight 선언이 없어 브라우저 기본 h4 bold에
 * 의존하므로 Tailwind Preflight의 heading font-weight 리셋을 상쇄하기 위해
 * font-bold를 명시한다.
 */
export function BusinessItems() {
  return (
    <div className="mx-auto max-w-[1220px] px-7 pt-5 pb-[60px]">
      <p className="m-0 mb-2 font-mono text-[12px] tracking-[0.08em] text-silk-faint">WHAT WE DO</p>
      <h2 className="m-0 mb-[30px] text-[22px] font-semibold">사업 아이템</h2>
      <div className="grid grid-cols-3 gap-[18px] max-[860px]:grid-cols-1">
        {BIZ_ITEMS.map((item) => (
          <div key={item.title} className="rounded-card border border-border bg-bg-panel px-[22px] py-6">
            <span className="mb-[14px] inline-block rounded-[5px] bg-amber-dim px-2 py-[3px] font-mono text-[10px] font-bold tracking-[0.05em] text-amber">
              {item.tag}
            </span>
            <h4 className="m-0 mb-2 text-[15px] font-bold">{item.title}</h4>
            <p className="m-0 text-[12.5px] leading-[1.65] text-silk-dim">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
