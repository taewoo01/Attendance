type ConsoleLogProps = {
  checkedInCount: number;
  totalCount: number;
  resultsCount: number;
  ideasCount: number;
};

/**
 * playground-design/index.html의 .console-wrap/.console-window(team_status.log) 정적 위젯.
 * 상호작용이 전혀 없어 Server Component로 유지한다.
 * TASK-030: attendance/results/ideas 줄은 page.tsx가 조회한 실제 데이터로
 * 채운다. `results --this-week`/`ideas --unread`은 각각 결과·아이디어 페이지의
 * 기존 사이드바 구현과 동일하게 "이번 주"/"안읽음" 필터링 없이 전체 건수를
 * 쓴다(날짜가 자유 텍스트라 필터링이 불가능하고, 읽음 상태 자체가 스키마에
 * 없다 — Results/Ideas TASK에서 이미 같은 이유로 내린 결정과 동일). `meeting
 * --next`는 "다음 예정 회의" 개념 자체가 스키마에 없어(meeting_notes는 지난
 * 회의록만 기록) 원본 값을 그대로 정적 유지한다.
 */
export function ConsoleLog({ checkedInCount, totalCount, resultsCount, ideasCount }: ConsoleLogProps) {
  return (
    <section className="mx-auto mb-10 max-w-[1220px] px-7">
      <div className="border border-border bg-bg-panel">
        <div className="flex items-center gap-2 border-b border-border px-[14px] py-[10px]">
          <span className="h-[9px] w-[9px] rounded-full bg-silk-faint" />
          <span className="h-[9px] w-[9px] rounded-full bg-silk-faint" />
          <span className="h-[9px] w-[9px] rounded-full bg-teal" />
          <span className="ml-1.5 font-mono text-[11.5px] text-silk-dim">team_status.log</span>
        </div>
        <div className="px-[22px] pt-[18px] pb-5 font-mono text-[13.5px]">
          <p className="m-0 mb-2.5 text-silk-dim">
            <span className="mr-2.5 text-silk-faint">$</span>attendance --today &nbsp;→{" "}
            <span className="text-teal">
              {checkedInCount} / {totalCount}명 체크인
            </span>
          </p>
          <p className="m-0 mb-2.5 text-silk-dim">
            <span className="mr-2.5 text-silk-faint">$</span>results --this-week &nbsp;→{" "}
            <span className="text-teal">{resultsCount}건 등록</span>
          </p>
          <p className="m-0 mb-2.5 text-silk-dim">
            <span className="mr-2.5 text-silk-faint">$</span>ideas --unread &nbsp;→{" "}
            <span className="text-amber">{ideasCount}개 신규</span>
          </p>
          <p className="m-0 text-silk-dim">
            <span className="mr-2.5 text-silk-faint">$</span>meeting --next &nbsp;→{" "}
            <span className="text-teal">화요일 15:00, 302호</span>
          </p>
        </div>
      </div>
    </section>
  );
}
