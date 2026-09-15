type ConsoleLogProps = {
  checkedInCount: number;
  totalCount: number;
  /** 이번 주(월~일, Asia/Seoul)에 등록된 실적 건수. */
  resultsThisWeekCount: number;
  /** 이번 주(월~일, Asia/Seoul)에 새로 올라온 아이디어 개수. */
  ideasThisWeekCount: number;
  /** 오늘 이후로 등록된 가장 가까운 회의 요약("화요일 15:00, 302호" 형태). 없으면 안내 문구. */
  nextMeetingLabel: string;
};

/**
 * playground-design/index.html의 .console-wrap/.console-window(team_status.log) 정적 위젯.
 * 상호작용이 전혀 없어 Server Component로 유지한다.
 * 전부 page.tsx가 조회한 실제 데이터로 채운다.
 * `results --this-week`: achievements.resultDate(ISO)가 이번 주 범위인 것만 센다.
 * `ideas --this-week`: 원래 "--unread"였으나 읽음 상태 자체가 스키마에 없어(Results/
 * Ideas 사이드바에서 이미 같은 이유로 내린 결정과 동일) ideas.postedAt이 이번 주인
 * 것만 세는 "이번 주 신규"로 바꿨다.
 * `meeting --next`: meeting_notes.meetingDateKey가 오늘 이후인 것 중 가장 이른
 * 회의를 찾는다(과거에는 "다음 예정 회의" 개념이 스키마에 없어 정적 텍스트였다 —
 * 이제 날짜 피커로 등록된 회의록 중 미래 날짜인 것을 그 용도로 쓴다).
 */
export function ConsoleLog({
  checkedInCount,
  totalCount,
  resultsThisWeekCount,
  ideasThisWeekCount,
  nextMeetingLabel,
}: ConsoleLogProps) {
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
            <span className="text-teal">{resultsThisWeekCount}건 등록</span>
          </p>
          <p className="m-0 mb-2.5 text-silk-dim">
            <span className="mr-2.5 text-silk-faint">$</span>ideas --this-week &nbsp;→{" "}
            <span className="text-amber">{ideasThisWeekCount}개 신규</span>
          </p>
          <p className="m-0 text-silk-dim">
            <span className="mr-2.5 text-silk-faint">$</span>meeting --next &nbsp;→{" "}
            <span className="text-teal">{nextMeetingLabel}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
