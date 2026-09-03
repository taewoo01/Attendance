type TlItem = { date: string; title: string; desc: string; past?: boolean };

const TIMELINE: TlItem[] = [
  {
    date: "2026.08",
    title: "AI Rookie 경진대회 본선 진출",
    desc: "GoldenLink(응급환자 병원 매칭 시스템)로 예선을 통과하고 본선 진출을 확정했습니다.",
  },
  {
    date: "2026.07",
    title: "KEPCO 외부 R&D 과제 착수",
    desc: '한전 R&D 과제 "AI 기반 차세대 배전망 ESS의 전압제어 최적화 기술 개발"에 선정되어 연구를 시작했습니다.',
  },
  {
    date: "2026.03",
    title: "AI 솔루션 팀 Playground 결성",
    desc: "EDCL 연구실 소속 학부생들이 모여 학생-창업 파이프라인을 목표로 팀을 꾸렸습니다.",
    past: true,
  },
];

/**
 * playground-design/about.html의 세 번째 section-wrap(HISTORY / 연혁).
 * <script>가 없어 정적 Server Component로 유지한다.
 * `past` class는 원본에서 연혁 3건 중 마지막(2026.03) 항목에만 적용되어 dot/date
 * 색상이 달라지는데, 이 상태를 그대로 재현하고 실제 날짜 비교로 재계산하지 않는다.
 */
export function HistoryTimeline() {
  return (
    <div className="mx-auto max-w-[1220px] px-7 pt-5 pb-[60px]">
      <p className="m-0 mb-2 font-mono text-[12px] tracking-[0.08em] text-silk-faint">HISTORY</p>
      <h2 className="m-0 mb-[30px] text-[22px] font-semibold">연혁</h2>
      <div className="relative pl-[26px] before:absolute before:left-[5px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-border before:content-['']">
        {TIMELINE.map((item, i) => (
          <div key={item.date} className={`relative ${i === TIMELINE.length - 1 ? "" : "pb-7"}`}>
            <div
              className={`absolute -left-[26px] top-[3px] h-[11px] w-[11px] rounded-full border-2 ${
                item.past ? "border-silk-faint bg-bg-raised" : "border-teal bg-bg"
              }`}
            />
            <div className={`mb-[5px] font-mono text-[11.5px] ${item.past ? "text-silk-faint" : "text-teal"}`}>
              {item.date}
            </div>
            <div className="m-0 mb-1 text-[14.5px] font-semibold">{item.title}</div>
            <p className="m-0 max-w-[64ch] text-[12.5px] leading-[1.6] text-silk-dim">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
