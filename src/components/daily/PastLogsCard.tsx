"use client";

type PastLog = {
  date: string;
  dow: string;
  tag?: string;
  desc: string;
  check: string;
  pct: number;
  dataDate: string;
};

/**
 * playground-design/daily.html의 두 번째 .list-card("지난 기록").
 * 원본 script가 이 4건 자체를 재렌더링하지 않고 클릭 시 위쪽 팀 기록 카드의
 * feedIndex만 바꾸므로, 이 목록은 완전히 정적인 local constant로 유지한다.
 */
const PAST_LOGS: PastLog[] = [
  {
    date: "8월 29일",
    dow: "금",
    tag: "실적 연동",
    desc: "SOH continual learning 실험 셋업 완료, 기존 배치 모델과 비교 실험 시작. 저녁에 실적 관리에 등록.",
    check: "3/3 완료",
    pct: 100,
    dataDate: "0829",
  },
  {
    date: "8월 28일",
    dow: "목",
    tag: "실적 연동",
    desc: "KEPCO 과제 중간보고서 초안 작성, PPO 학습 진행상황 정리해서 팀 채널에 공유.",
    check: "2/3 완료",
    pct: 66,
    dataDate: "0828",
  },
  {
    date: "8월 27일",
    dow: "수",
    desc: "온도 조건별 SOC 추정 하이브리드 모델 논문 초안 리뷰, 이하늘과 실험 셋업 섹션 논의.",
    check: "2/2 완료",
    pct: 100,
    dataDate: "0827",
  },
  {
    date: "8월 26일",
    dow: "화",
    desc: "IDEC 2026 색상 식별기 브레드보드 테스트, 오차 범위 확인 후 회로도 수정.",
    check: "1/2 완료",
    pct: 50,
    dataDate: "0826",
  },
];

export function PastLogsCard({ onSelectDate }: { onSelectDate: (date: string) => void }) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg-panel">
      <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
        <h3 className="m-0 text-[14.5px] font-semibold">지난 기록</h3>
        <span className="font-mono text-[11.5px] text-silk-faint">이번 주 4건 · 클릭하면 그날 팀 기록 보기</span>
      </div>

      {PAST_LOGS.map((log) => (
        <div
          key={log.dataDate}
          onClick={() => onSelectDate(log.dataDate)}
          className="cursor-pointer border-b border-border px-[22px] py-[17px] last:border-b-0 hover:bg-[rgba(72,217,176,0.035)]"
        >
          <div className="mb-[7px] flex flex-wrap items-center justify-between gap-[10px]">
            <span className="text-[13.5px] font-semibold text-silk">
              {log.date}
              <span className="ml-1.5 font-mono text-[11px] font-medium text-silk-faint">{log.dow}</span>
            </span>
            <div className="flex gap-[6px]">
              {log.tag && (
                <span className="rounded-badge bg-amber-dim px-[7px] py-0.5 font-mono text-[9.5px] font-bold text-amber">
                  {log.tag}
                </span>
              )}
            </div>
          </div>
          <p className="m-0 mb-2 max-w-[66ch] text-[12.5px] leading-[1.6] text-silk-dim">{log.desc}</p>
          <div className="flex items-center gap-[6px] font-mono text-[11px] text-silk-faint">
            <div className="h-1 w-16 overflow-hidden rounded-[3px] bg-bg-raised">
              <div className="h-full rounded-[3px] bg-teal" style={{ width: `${log.pct}%` }} />
            </div>
            {log.check}
          </div>
        </div>
      ))}
    </div>
  );
}
