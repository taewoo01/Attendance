const ITEMS = [
  {
    title: "Vision",
    desc: "배터리와 전력 인프라의 상태를 누구나 신뢰할 수 있는 데이터로 만들어, 에너지를 더 안전하고 오래 쓰는 세상을 만듭니다.",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      </>
    ),
  },
  {
    title: "Mission",
    desc: "SOC·SOH 추정 AI 모델과 실시간 제어 알고리즘을 연구실 수준에서 현장 적용 가능한 수준까지 끌어올려, 학생 연구를 제품으로 연결합니다.",
    icon: <path d="M13 2 4 14h6l-1 8 9-12h-6z" />,
  },
];

/**
 * playground-design/about.html의 .vm-grid.
 * <script>가 없어 정적 Server Component로 유지한다.
 * .vm-card h3에는 원본 CSS에 font-weight 선언이 없어 브라우저 기본 h3 bold에
 * 의존하는데, 이 프로젝트의 Tailwind Preflight가 heading font-weight를 inherit으로
 * 리셋하므로 원본과 동일한 굵기를 위해 font-bold를 명시한다.
 */
export function VisionMission() {
  return (
    <div className="mx-auto grid max-w-[1220px] grid-cols-2 gap-5 px-7 pt-2.5 pb-[60px] max-[800px]:grid-cols-1">
      {ITEMS.map((item) => (
        <div key={item.title} className="rounded-card-lg border border-border bg-bg-panel px-7 py-[30px]">
          <div className="mb-[18px] flex h-11 w-11 items-center justify-center rounded-[12px] border border-teal-dim bg-teal-dim">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-5 w-5 stroke-teal">
              {item.icon}
            </svg>
          </div>
          <h3 className="m-0 mb-2.5 text-[17px] font-bold">{item.title}</h3>
          <p className="m-0 text-[13.5px] leading-[1.75] text-silk-dim">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
