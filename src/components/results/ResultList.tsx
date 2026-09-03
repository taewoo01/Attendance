type Result = {
  avatar: string;
  team?: boolean;
  title: string;
  tag: "개인" | "팀";
  desc: string;
  who: string;
  file?: string;
  date: string;
  metric?: { label: string; value: string };
};

/**
 * playground-design/results.html의 .list-card(.res-row 7건) 정적 데이터.
 * 원본 <script>가 이 목록을 조작하지 않으므로 local constant로 유지한다
 * (docs/MIGRATION.md 8절 Mock Data Migration).
 */
const RESULTS: Result[] = [
  {
    avatar: "연",
    title: "DC 리플 기반 SOH 추정 continual learning 실험 1차 완료",
    tag: "개인",
    desc: "기존 배치 학습 대비 드리프트 대응 정확도 비교 실험을 마치고 결과 정리. 다음 주 파라미터 튜닝 예정.",
    who: "김연구",
    file: "실험결과.xlsx",
    date: "8월 29일 (금)",
  },
  {
    avatar: "지",
    team: true,
    title: "KEPCO 과제 중간보고서 제출",
    tag: "팀",
    desc: "Volt-VAR/Volt-Watt 제어 PPO 학습 진행상황 및 다음 분기 계획 포함해 제출 완료.",
    who: "오지훈 외 3명",
    file: "중간보고서.pdf",
    date: "8월 28일 (목)",
  },
  {
    avatar: "지",
    team: true,
    title: "AI Rookie 경진대회 예선 통과",
    tag: "팀",
    desc: "응급환자 병원 매칭 시스템(GoldenLink)으로 예선 통과, 본선 진출 확정.",
    who: "Team GoldenLink",
    date: "8월 27일 (수)",
    metric: { label: "진출", value: "본선" },
  },
  {
    avatar: "하",
    title: "온도 조건별 SOC 추정 하이브리드 모델 초안 논문 작성",
    tag: "개인",
    desc: "신경망+칼만필터 결합 구조 설명 및 실험 셋업 섹션까지 초안 작성 완료.",
    who: "이하늘",
    file: "초안_v2.docx",
    date: "8월 27일 (수)",
  },
  {
    avatar: "준",
    title: "IDEC 2026 색상 식별기 아날로그 회로 1차 설계",
    tag: "개인",
    desc: "MCU 없이 비교기 기반으로 RGB 판별 회로 브레드보드 테스트 완료, 오차 범위 내 동작 확인.",
    who: "박준서",
    date: "8월 26일 (화)",
  },
  {
    avatar: "민",
    team: true,
    title: "창업팀 협업 플랫폼 요구사항 정의서 확정",
    tag: "팀",
    desc: "11개 기능 확정 및 페이지별 상세 스펙 정리, 다음 단계로 와이어프레임 착수.",
    who: "정민재 외 2명",
    file: "요구사항정의서_v0.2.docx",
    date: "8월 25일 (월)",
  },
  {
    avatar: "도",
    title: "배터리 시뮬레이션 챌린지용 TGL 모델 검증",
    tag: "개인",
    desc: "ANSYS 열-전기 결합 시뮬레이션 결과와 실측 데이터 오차 3% 이내로 확인.",
    who: "최도윤",
    date: "8월 25일 (월)",
    metric: { label: "오차", value: "2.8%" },
  },
];

/**
 * playground-design/results.html의 .list-card 전체(헤더 + .res-row 목록).
 * 원본 <script>가 건드리지 않는 정적 영역이라 Server Component로 유지한다.
 */
export function ResultList() {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg-panel">
      <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
        <h3 className="m-0 text-[14.5px] font-semibold">이번 주 실적</h3>
        <span className="font-mono text-[11.5px] text-silk-faint">7건 등록 · 개인 4 / 팀 3</span>
      </div>

      {RESULTS.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-[40px_1fr_auto] items-start gap-[14px] border-b border-border px-[22px] py-[17px] last:border-b-0 hover:bg-[rgba(231,239,236,0.02)] max-[640px]:grid-cols-[34px_1fr]"
        >
          <div
            className={`mt-px flex h-[34px] w-[34px] items-center justify-center rounded-full font-mono text-xs font-bold ${
              r.team ? "bg-amber-dim text-amber" : "bg-[rgba(72,217,176,0.14)] text-teal"
            }`}
          >
            {r.avatar}
          </div>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-[9px]">
              <span className="text-sm font-semibold text-silk">{r.title}</span>
              <span
                className={`rounded-badge px-1.5 py-0.5 font-mono text-[9.5px] font-bold tracking-[0.03em] ${
                  r.team ? "bg-amber-dim text-amber" : "bg-[rgba(72,217,176,0.14)] text-teal"
                }`}
              >
                {r.tag}
              </span>
            </div>
            <p className="m-0 mb-2 max-w-[64ch] text-[12.5px] leading-[1.55] text-silk-dim">{r.desc}</p>
            <div className="flex flex-wrap items-center gap-[14px] font-mono text-[11px] text-silk-faint">
              <span className="text-silk-dim">{r.who}</span>
              {r.file && (
                <span className="inline-flex items-center gap-[5px]">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-[11px] w-[11px] stroke-silk-faint">
                    <path d="M4 4h11l5 5v11H4z" />
                    <path d="M15 4v5h5" />
                  </svg>
                  {r.file}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 max-[640px]:col-span-2 max-[640px]:mt-2 max-[640px]:flex-row max-[640px]:items-center max-[640px]:justify-between max-[640px]:pl-12">
            <span className="whitespace-nowrap font-mono text-[11.5px] text-silk-faint">{r.date}</span>
            {r.metric && (
              <span className="whitespace-nowrap rounded-chip border border-border bg-bg-raised px-2.5 py-[5px] font-mono text-[11.5px] font-bold text-teal">
                <span className="mr-[5px] font-medium text-silk-faint">{r.metric.label}</span>
                {r.metric.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
