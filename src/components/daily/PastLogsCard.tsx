"use client";

export type PastLog = {
  date: string;
  dow: string;
  desc: string;
  check: string;
  pct: number;
  dataDate: string;
};

type PastLogsCardProps = {
  pastLogs: PastLog[];
  onSelectDate: (date: string) => void;
};

/**
 * playground-design/daily.html의 두 번째 .list-card("지난 기록").
 * 원본 script가 이 목록 자체를 재렌더링하지 않고 클릭 시 위쪽 팀 기록 카드의
 * feedIndex만 바꾸므로, 클릭 동작은 그대로 유지한다.
 * TASK-025: 하드코딩 4건 대신 로그인한 사용자 본인의 실제 daily_logs 중
 * 오늘을 제외한 항목을 page.tsx에서 계산해 props로 받는다. `tag`("실적
 * 연동")는 실적(achievements) 기능이 아직 없어 derive할 데이터가 없으므로
 * 제거했다(가짜 값을 채우지 않음).
 */
export function PastLogsCard({ pastLogs, onSelectDate }: PastLogsCardProps) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg-panel">
      <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
        <h3 className="m-0 text-[14.5px] font-semibold">지난 기록</h3>
        <span className="font-mono text-[11.5px] text-silk-faint">
          이번 주 {pastLogs.length}건 · 클릭하면 그날 팀 기록 보기
        </span>
      </div>

      {pastLogs.map((log) => (
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
